// utils/sendSMS.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

module.exports = async function sendSMS(to, message) {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to
    });
  } catch (err) {
    console.error("Twilio SMS Error:", err.message);
  }
};
