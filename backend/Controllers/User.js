const express = require('express');
const User = require('../models/Users'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDistanceFromLatLonInKm } = require('../Utils/geoUtils');
require("dotenv").config();

const UserSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role = "user",
            phone,
            subscribedToAlerts = false,
            location
        } = req.body;

        const lat = location?.latitude;
        const lng = location?.longitude;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: "Name, email, phone, and password are required" });
        }

        const nameRegex = /^[A-Za-z\s]{3,50}$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ error: "Invalid name format" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const formattedPhone = phone.trim();

        const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format

        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: "Phone number must be in international format (e.g., +919876543210)" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const existing_user = await User.findOne({ email });
        if (existing_user) {
            return res.status(400).json({ error: "User already exists with the same email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phone: formattedPhone,
            subscribedToAlerts,
            location: (lat !== undefined && lng !== undefined)
                ? { lat: parseFloat(lat), lng: parseFloat(lng) }
                : undefined
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const existing_user = await User.findOne({ email });
        if (!existing_user) {
            return res.status(400).json({ error: "User doesn't exist with provided email" });
        }

        const passwordmatch = await bcrypt.compare(password, existing_user.password);
        if (!passwordmatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Instead of JWT, send user ID as token
        const token = existing_user._id.toString();

        return res.status(200).json({
            message: "User logged in successfully",
            token,  // Now, token is just the user ID
            user: {
                id: existing_user._id,
                email: existing_user.email
            }
        });

    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const updatelocation = async (req, res) => {
    try {
        const { location } = req.body;
        const userId = req.params.id;  // Get userId from URL params

        // Ensure userId is provided
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user by userId and update the location
        const user = await User.findByIdAndUpdate(
            userId,  // Use userId from URL params to find the user
            { location }, // Update the location field
            { new: true } // Return the updated user document
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found with this ID' });
        }

        res.status(200).json({ message: 'Location updated successfully' });
    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ error: 'Failed to update location' });
    }
};

const sendsms = async (req, res) => {
    try {
        const { title, type, latitude, longitude, severity } = req.body;

        // Validate input
        if (!title || !type || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create disaster record
        const newDisaster = await Disaster.create({
            title,
            type,
            latitude,
            longitude,
            severity
        });

        // Get all subscribed users
        const users = await User.find({ subscribedToAlerts: true });

        // Send alerts to nearby users
        for (const user of users) {
            if (!user.phone || !user.location) continue;

            const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                user.location.lat,
                user.location.lng
            );

            if (distance <= 500) { // 500 km radius
                const message = `🚨 ${title} (${type}) reported ${distance.toFixed(0)}km from you! Stay safe.`;
                await sendSmsAlert(user.phone, message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Disaster created and alerts sent',
            disaster: newDisaster
        });
    } catch (error) {
        console.error('Error in sendsms:', error);
        res.status(500).json({ error: 'Failed to process alert' });
    }
}

const userdetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format (optional)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        const user = await User.findById(id).select('-password'); // exclude password

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = { UserSignup, UserLogin, updatelocation, sendsms, userdetails };
