const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBookingConfirmation(bookingData) {
  console.log('Starting to send booking confirmation email with data:', {
    ...bookingData,
    checkIn: new Date(bookingData.checkIn).toISOString(),
    checkOut: new Date(bookingData.checkOut).toISOString()
  });

  const { name, email, hotelName, location, checkIn, checkOut, nights, amount, currency } = bookingData;

  try {
    console.log('Preparing email with Resend...');
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your Hotel Booking Confirmation - EroTraveler',
      html: `
        <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom right, #0F172A, #1E293B); color: white; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #F7931A; font-size: 28px; margin-bottom: 16px;">Booking Confirmation</h1>
                <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6;">Hello Traveler! Your booking is confirmed. Thank you for choosing EroTraveler for your stay.</p>
            </div>
            
            <div style="background: rgba(30, 41, 59, 0.7); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Hotel Information</h3>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 16px;">
                        <span style="color: #F7931A; font-weight: 600;">${hotelName}</span>
                    </p>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;">${location}</p>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Booking Details</h3>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Guest Name:</strong> ${name}</p>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Check-in Date:</strong> ${new Date(checkIn).toLocaleDateString()}</p>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Check-out Date:</strong> ${new Date(checkOut).toLocaleDateString()}</p>
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Number of Nights:</strong> ${nights}</p>
                </div>
                
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
                    <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Total Amount Paid:</strong> ${amount} ${currency}</p>
                </div>
            </div>
            
            <div style="background: rgba(247, 147, 26, 0.1); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(247, 147, 26, 0.2);">
                <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Important Information</h3>
                <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px; font-weight: bold;">In order to check in our Travel agent booking name will be: ${name}</p>
                <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;">• Check-in time: 3:00 PM | Check-out time: 11:00 AM</p>
                <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;">• Free cancellation until 24 hours before check-in</p>
            </div>
            
            <div style="padding: 24px; background-color: #1A1A1A; border-radius: 8px; text-align: center;">
                <p style="color: #E2E8F0; margin-bottom: 16px; font-size: 15px;">We look forward to welcoming you!</p>
                <p style="color: #E2E8F0; margin-top: 24px;">Best regards,<br>
                <span style="color: #F7931A; font-weight: 600;">EroTraveler Team</span></p>
            </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

module.exports = {
  sendBookingConfirmation,
}; 