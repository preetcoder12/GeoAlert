require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const geolib = require('geolib');
const { sendSmsAlert } = require('./Utils/SendSms');  // Import your SMS service

const User = require('./models/Users');  // Assuming the User model is correctly set up
const UserRoutes = require('./Routes/User');
const eventRoutes = require('./Routes/API');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Configurations
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware Setup
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });

// Routes Setup
app.use('/user', UserRoutes);
app.use('/api', eventRoutes);

// Base Route
app.get('/', (req, res) => res.send('🌍 Disaster Alert Backend Running'));

// Socket.IO - Disaster Alert Broadcast
io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('new-disaster', async (disaster) => {
        try {
            const coords = disaster?.geometries?.[0]?.coordinates;

            if (!coords || coords.length !== 2) {
                console.warn('⚠️ Invalid coordinates in disaster payload.');
                return;
            }

            const disasterLocation = {
                latitude: coords[1],
                longitude: coords[0]
            };

            const users = await User.find({ subscribedToAlerts: true }).select('phone location');
            console.log(`📡 Checking proximity for ${users.length} users...`);

            // Check proximity of each user
            for (const user of users) {
                if (!user.location?.lat || !user.location?.lng || !user.phone) continue;

                const userLocation = { latitude: user.location.lat, longitude: user.location.lng };
                const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, disasterLocation.latitude, disasterLocation.longitude);

                // If the distance is <= 500 km
                if (distance <= 500) {
                    const alertMessage = `🚨 ALERT: ${disaster.title || 'A disaster'} has occurred near your area. Stay safe.`;
                    await sendSmsAlert(user.phone, alertMessage);  // Send SMS Alert
                    console.log(`📲 Sent alert to ${user.phone}`);

                    // Emit confirmation back to the sender
                    io.to(socket.id).emit('disaster-sent', {
                        to: user.phone,
                        distance,
                        success: true
                    });
                }

            }
        } catch (err) {
            console.error('❌ Error in new-disaster handler:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
