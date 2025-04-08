require('dotenv').config();

const express = require("express");
const router = express.Router();
const geolib = require('geolib');
const sendSMS = require('../Utils/SendSms');
const {
    getAllEvents,
    getEventById,
    getCategories,
    getCategoryById,
    getLayers,
} = require("../Controllers/API");

// Event Routes
router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);

// Category Routes
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);

// Layer Routes
router.get("/layers", getLayers);

router.post('/send-alert', async (req, res) => {
    try {
        const { phone, disaster, userLocation } = req.body;

        if (!phone || !disaster || !userLocation) {
            return res.status(400).json({ error: 'Missing required information' });
        }

        // Format the disaster information
        const disasterType = disaster.categories?.[0]?.title || 'Unknown disaster';
        const disasterTitle = disaster.title || 'Disaster alert';
        const distance = Math.round(req.body.distance / 1000); // Convert meters to km

        // Create the SMS message
        const message = `🚨 ALERT: ${disasterType} detected near you! "${disasterTitle}" is approximately ${distance}km from your location. Stay safe and follow local emergency instructions.`;

        // Send the SMS via Twilio
        const twilioResponse = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });

        // Emit the success event to the socket
        req.io.emit('disaster-sent', {
            disaster: disaster,
            messageId: twilioResponse.sid
        });

        return res.status(200).json({
            success: true,
            messageId: twilioResponse.sid
        });
    } catch (error) {
        console.error('Error sending SMS alert:', error);
        return res.status(500).json({
            error: 'Failed to send alert',
            details: error.message
        });
    }
});



module.exports = router;