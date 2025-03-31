const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ["Drought", "Dust and Haze", "Earthquakes", "Floods", "Landslides", "Manmade", "Sea and Lake Ice", "Severe Storms", "Snow", "Temperature Extremes", "Volcanoes", "Water Color", "Wildfires"]
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String },
        region: { type: String }
    },

    reportedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String },
        contact: { type: String }
    },

    status: {
        type: String,
        enum: ["pending", "verified", "resolved", "rejected"],
        default: "pending"
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Incident", IncidentSchema);
