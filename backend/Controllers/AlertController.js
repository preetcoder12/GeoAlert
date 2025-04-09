const User = require('../models/Users');
const { sendSmsAlert } = require('../Utils/SendSms');
const { getDistanceFromLatLonInKm } = require('../Utils/geoUtils');

const sendDisasterAlert = async (req, res) => {
    try {
        const { phone, message, coordinates, userLocation } = req.body;

        // Validate inputs
        if (!phone || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Here you would integrate with your SMS gateway (Twilio, etc.)
        // This is just a mock implementation
        console.log(`Would send SMS to ${phone}: ${message}`);

        // Mock response
        res.json({
            success: true,
            message: "Alert sent successfully",
            details: {
                recipient: phone,
                content: message,
                disasterLocation: coordinates,
                userLocation: userLocation
            }
        });
    } catch (error) {
        console.error("Error sending alert:", error);
        res.status(500).json({ error: "Failed to send alert" });
    }
};

module.exports = { sendDisasterAlert };