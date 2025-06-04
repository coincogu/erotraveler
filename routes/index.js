const express = require('express');
const router = express.Router();
const { createPayment, verifyIPN } = require('../nowpayments');
const { sendBookingConfirmation } = require('../resend');
const supabase = require('../supabase');

// Homepage route
router.get('/', async (req, res) => {
  try {
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('*');
    
    if (error) throw error;
    res.render('index', { hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).send('Error loading hotels');
  }
});

// Booking form route
router.get('/book/:hotelId', async (req, res) => {
  try {
    const { data: hotel, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', req.params.hotelId)
      .single();

    if (error) throw error;
    if (!hotel) {
      return res.status(404).send('Hotel not found');
    }

    res.render('booking', { hotel });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).send('Error loading hotel details');
  }
});

// Process booking route
router.post('/book', async (req, res) => {
  try {
    const { hotelId, name, email, checkIn, checkOut, cryptoCurrency } = req.body;
    
    if (!hotelId || !name || !email || !checkIn || !checkOut || !cryptoCurrency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate cryptocurrency
    const validCryptos = ['btc', 'eth', 'ltc'];
    if (!validCryptos.includes(cryptoCurrency)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency selected' });
    }

    // Validate hotel ID
    if (isNaN(parseInt(hotelId))) {
      return res.status(400).json({ error: 'Invalid hotel ID' });
    }

    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();

    if (hotelError) {
      console.error('Supabase hotel error:', hotelError);
      return res.status(500).json({ error: 'Error fetching hotel details' });
    }
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * hotel.price_per_night;

    // Generate a unique order ID
    const orderId = `CRYPTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create booking in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          order_id: orderId,
          hotel_id: hotel.id,
          name,
          email,
          check_in: checkInDate.toISOString(),
          check_out: checkOutDate.toISOString(),
          nights,
          total_price: totalPrice,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Supabase booking error:', bookingError);
      return res.status(500).json({ error: 'Error creating booking' });
    }

    try {
      const payment = await createPayment(totalPrice, 'USD', {
        orderId: booking.order_id,
        name: booking.name,
        email: booking.email,
        hotelId: booking.hotel_id,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        nights: booking.nights,
        totalPrice: booking.total_price,
        cryptoCurrency: cryptoCurrency
      });

      // Update booking with payment ID
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_id: payment.payment_id })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        // Don't return error here as the booking was created successfully
      }

      // Send JSON response with the payment URL
      if (!payment.invoice_url) {
        throw new Error('No payment URL received from payment provider');
      }

      res.json({ 
        invoice_url: payment.invoice_url,
        payment_id: payment.payment_id,
        pay_address: payment.pay_address,
        pay_amount: payment.pay_amount,
        pay_currency: payment.pay_currency
      });
    } catch (paymentError) {
      console.error('Payment creation error:', paymentError);
      
      // Delete the booking if payment creation fails
      await supabase
        .from('bookings')
        .delete()
        .eq('order_id', orderId);

      return res.status(500).json({ 
        error: 'Error creating payment',
        details: paymentError.message
      });
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'Error processing booking',
      details: error.message
    });
  }
});

// Webhook route for payment notifications
router.post('/webhook', async (req, res) => {
  console.log('Webhook received:', {
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const signature = req.headers['x-nowpayments-sig'];
    console.log('Received signature:', signature);
    
    // Verify IPN signature
    const isValidSignature = verifyIPN(req.body, signature);
    console.log('IPN signature verification result:', isValidSignature);

    if (!isValidSignature) {
      console.error('Invalid IPN signature');
      return res.status(401).send('Invalid signature');
    }

    const { payment_status, order_id } = req.body;
    console.log('Payment status:', payment_status, 'Order ID:', order_id);

    if (payment_status === 'confirmed' && order_id) {
      console.log('Payment confirmed, looking up booking...');
      
      // Find booking by order ID
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('order_id', order_id)
        .single();

      if (error) {
        console.error('Error finding booking:', error);
        throw error;
      }
      
      console.log('Found booking:', booking);
      
      if (booking) {
        console.log('Updating booking status to confirmed...');
        // Update booking status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('order_id', order_id);

        if (updateError) {
          console.error('Error updating booking status:', updateError);
          throw updateError;
        }

        console.log('Looking up hotel details...');
        const { data: hotel, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', booking.hotel_id)
          .single();
        
        if (hotelError) {
          console.error('Error finding hotel:', hotelError);
          throw hotelError;
        }

        console.log('Found hotel:', hotel);
        
        if (hotel) {
          console.log('Sending booking confirmation email...');
          try {
            await sendBookingConfirmation({
              name: booking.name,
              email: booking.email,
              hotelName: hotel.name,
              location: hotel.location,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              nights: booking.nights,
              amount: booking.total_price,
              currency: 'USD'
            });
            console.log('Booking confirmation email sent successfully');
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't throw here, we still want to return 200 to NowPayments
          }
        } else {
          console.error('Hotel not found for booking');
        }
      } else {
        console.error('Booking not found for order ID:', order_id);
      }
    } else {
      console.log('Payment not confirmed or missing order ID');
    }

    console.log('Webhook processed successfully');
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router; 