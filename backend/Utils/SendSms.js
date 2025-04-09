const twilio = require('twilio');
require('dotenv').config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSmsAlert = async (to, message) => {
  try {
      console.log(`Sending SMS to ${to}: ${message}`); // Check if the function is being called
      const response = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to,
      });
      console.log('✅ Alert SMS sent successfully:', response.sid);
  } catch (error) {
      console.error('❌ Error sending SMS:', error.message);
  }
};


module.exports = { sendSmsAlert };
