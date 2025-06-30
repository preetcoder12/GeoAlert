const twilio = require('twilio');
require('dotenv').config();


const sendSmsAlert = async (to, message) => {
    try {
        // Validate inputs
        if (!to || !message) {
            throw new Error('Missing required parameters: to or message');
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone) {
            throw new Error('Twilio credentials not configured in environment variables');
        }

        // Format phone number to E.164 if not already
        const formattedTo = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`;

        const client = twilio(accountSid, authToken);

        console.log(`Attempting to send SMS to: ${formattedTo}`);
        console.log(`Message content: ${message}`);

        const response = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedTo
        });

        console.log('✅ SMS sent successfully. SID:', response.sid);
        console.log('Message status:', response.status);
        return {
            success: true,
            sid: response.sid,
            status: response.status
        };
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        console.error('Error details:', error);

        // Specific handling for Twilio errors
        if (error.code === 21211) {
            console.error('Invalid phone number format');
        } else if (error.code === 21614) {
            console.error('Phone number not verified (Twilio trial account limitation)');
        }

        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
};

module.exports = { sendSmsAlert };
module.exports = { sendSmsAlert };