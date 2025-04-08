const User = require('../models/Users');
const { sendSmsAlert } = require('../Utils/SendSms');
const { getDistanceFromLatLonInKm } = require('../Utils/geoUtils');

const sendDisasterAlert = async (req, res) => {
    try {
        const { phone, message, coordinates, userLocation } = req.body;

        // Validate inputs
        if (!phone || !message) {
            return res.status(400).json({ 
                error: "Missing required fields",
                details: { received: req.body }
            });
        }

        // Send the SMS
        const smsResult = await sendSmsAlert(phone, message);
        
        if (!smsResult.success) {
            return res.status(400).json({
                error: "Failed to send SMS",
                details: smsResult
            });
        }

        res.json({
            success: true,
            message: "Alert sent successfully",
            details: {
                recipient: phone,
                content: message,
                smsDetails: smsResult,
                disasterLocation: coordinates,
                userLocation: userLocation
            }
        });
    } catch (error) {
        console.error("Error sending alert:", error);
        res.status(500).json({ 
            error: "Failed to send alert",
            details: error.message 
        });
    }
};

module.exports = { sendDisasterAlert };