require("dotenv").config();
const mongoose = require("mongoose");
const Incident = require("../models/Reports");
const User = require("../models/Users");

const Report = async (req, res) => {
    try {
        const { title, description, category, location, reportedBy, status } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Ensure location contains latitude and longitude
        if (!location || location.latitude === undefined || location.longitude === undefined) {
            return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });
        }


        // ✅ Ensure reportedBy contains userId, name, and contact
        if (!reportedBy.userId || !reportedBy.name || !reportedBy.contact) {
            return res.status(400).json({ success: false, message: "Reporter details (userId, name, contact) are required" });
        }

        // ✅ Validate userId
        if (!mongoose.Types.ObjectId.isValid(reportedBy.userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId format" });
        }

        // ✅ Fetch the user from DB to ensure they exist
        const curr_user = await User.findById(reportedBy.userId);
        if (!curr_user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Ensure status is valid
        const validStatuses = ["pending", "verified", "resolved", "rejected"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const newIncident = new Incident({
            title,
            description,
            category,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || "Unknown",
                region: location.region || "Unknown"
            },
            reportedBy: {
                userId: curr_user._id,  // ✅ Corrected userId assignment
                name: reportedBy.name,
                contact: reportedBy.contact
            },
            status: status || "pending"
        });

        await newIncident.save();
        res.status(201).json({ success: true, message: "Incident reported successfully", incident: newIncident });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error reporting incident", error: error.message });
    }
};

module.exports = { Report };
