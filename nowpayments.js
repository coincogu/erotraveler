const axios = require('axios');
const crypto = require('crypto');

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_KEY = process.env.NOWPAYMENTS_IPN_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPAYMENTS_API_KEY is not set in environment variables');
}

function verifyIPN(payload, signature) {
    if (!NOWPAYMENTS_IPN_KEY) {
        console.warn('NOWPAYMENTS_IPN_KEY not set, skipping IPN verification');
        return true;
    }

    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_KEY);
    const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
    return calculatedSignature === signature;
}

async function createPayment(amount, currency, bookingData) {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL is not set in environment variables');
    }

    try {
        console.log('Creating payment with data:', {
            price_amount: amount,
            price_currency: currency,
            order_id: bookingData.orderId,
            pay_currency: bookingData.cryptoCurrency,
            base_url: process.env.BASE_URL
        });

        const response = await axios.post(
            `${NOWPAYMENTS_API_URL}/payment`,
            {
                price_amount: amount,
                price_currency: currency,
                pay_currency: bookingData.cryptoCurrency,
                order_id: bookingData.orderId,
                success_url: `${process.env.BASE_URL}/success`,
                cancel_url: `${process.env.BASE_URL}/cancel`,
                ipn_callback_url: `${process.env.BASE_URL}/webhook`,
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('NowPayments API response:', response.data);

        if (!response.data) {
            throw new Error('Empty response from NowPayments API');
        }

        if (!response.data.pay_address) {
            console.error('Invalid NowPayments response:', response.data);
            throw new Error('No payment address in NowPayments response');
        }

        const paymentUrl = `https://nowpayments.io/payment/?iid=${response.data.payment_id}`;

        response.data.invoice_url = paymentUrl;

        return response.data;
    } catch (error) {
        console.error('NowPayments API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.data?.message) {
            throw new Error(`NowPayments API error: ${error.response.data.message}`);
        }

        throw new Error('Failed to create payment. Please try again later.');
    }
}

module.exports = {
    createPayment,
    verifyIPN,
}; 