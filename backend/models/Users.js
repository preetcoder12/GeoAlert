const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  location: {
    type: {
      lat: Number,
      lng: Number,
    },
    default: null, 
  },
  subscribedToAlerts: {
    type: Boolean,
    default: false, 
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
