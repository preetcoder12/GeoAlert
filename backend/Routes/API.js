require('dotenv').config();
const { sendDisasterAlert } = require('../Controllers/AlertController.js');

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

router.post('/send-alert', sendDisasterAlert);


module.exports = router;