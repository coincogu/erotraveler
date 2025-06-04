const { Resend } = require('resend');
const dotenv = require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBookingConfirmationEmail(bookingData) {
    const {
        name,
        email,
        hotelName,
        hotelUrl,
        hotelAddress,
        bookingName,
        checkIn,
        checkOut,
        amount,
        amountUSD,
        transactionId
    } = bookingData;

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: 'zezimace@gmail.com',
            subject: 'Your Hotel Booking Confirmation - EroTraveler',
            html: `
                <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom right, #0F172A, #1E293B); color: white; padding: 40px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #F7931A; font-size: 28px; margin-bottom: 16px;">Booking Confirmation</h1>
                        <p style="color: #E2E8F0; font-size: 16px; line-height: 1.6;">Hello Traveler! Your booking is confirmed. Thank you for choosing EroTraveler for your stay.</p>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/484907168.jpg?k=2c3334af32f45e75698070ad5a34e67931e26d5e41597859810151031df47a3b&o=" 
                             alt="${hotelName}" 
                             style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;">
                    </div>
                    
                    <div style="background: rgba(30, 41, 59, 0.7); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="margin-bottom: 24px;">
                            <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Hotel Information</h3>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 16px;">
                                <a href="${hotelUrl}" style="color: #F7931A; text-decoration: none; font-weight: 600;">${hotelName}</a>
                            </p>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;">${hotelAddress}</p>
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Booking Details</h3>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Travel Agent Booking Name:</strong> ${bookingName}</p>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Check-in Date:</strong> ${checkIn}</p>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Check-out Date:</strong> ${checkOut}</p>
                        </div>
                        
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px;">
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;"><strong>Total Amount Paid:</strong> ${amount} | $${amountUSD}</p>
                            <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px;">
                                <strong>Transaction ID:</strong> 
                                <a href="https://etherscan.io/tx/${transactionId}" style="color: #F7931A; text-decoration: none;">
                                    ${transactionId}
                                </a>
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(247, 147, 26, 0.1); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(247, 147, 26, 0.2);">
                        <h3 style="color: #F7931A; font-size: 18px; margin-bottom: 12px;">Important Information</h3>
                        <p style="color: #E2E8F0; margin: 8px 0; font-size: 15px; font-weight: bold;">In order to check in our Travel agent booking name will be: ${bookingName}</p>
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

// Run the email sender with the actual booking data
const bookingData = {
    name: "Customer",
    email: "zezimace@gmail.com",
    hotelName: "Hampton Inn & Suites Teaneck/Glenpointe",
    hotelUrl: "https://www.booking.com/hotel/us/hampton-inn-suites-teaneck-glenpointe-nj.html",
    hotelAddress: "One Glenwood Avenue Suite B, Teaneck, NJ 07666, United States",
    bookingName: "RYAN SPANGLER",
    checkIn: "20th",
    checkOut: "25th",
    amount: "0.2071 ETH",
    amountUSD: "543.47",
    transactionId: "0x92af5c1ce39ea35ed9fdb963b724ed5d55c929177883182d590b0a43fc940f2f"
};

// Execute the email send
sendBookingConfirmationEmail(bookingData)
    .then(() => {
        console.log('Email sent successfully');
        process.exit(0); // Exit after sending
    })
    .catch(error => {
        console.error('Failed to send email:', error);
        process.exit(1); // Exit with error
    });

module.exports = {
    sendBookingConfirmationEmail
};