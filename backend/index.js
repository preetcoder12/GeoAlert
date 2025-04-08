require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const twilio = require('twilio');
const geolib = require('geolib');

const User = require('./models/Users');
const UserRoutes = require("./Routes/User");
const eventRoutes = require("./Routes/API");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// 🔐 Twilio Config
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const twilioPhone = process.env.TWILIO_PHONE;
const twilioClient = twilio(accountSid, authToken);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    });

// Basic Route
app.get("/", (req, res) => {
    res.send("🌍 Disaster Alert Backend Running");
});

// ✅ Send SMS Utility
async function sendSMS(to, message) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: to
        });
        console.log(`📨 SMS sent to ${to}`);
    } catch (err) {
        console.error(`❌ Error sending SMS to ${to}:`, err.message);
    }
}

// Set IO and SMS sender globally if needed elsewhere
app.set('io', io);
app.set('sendSMS', sendSMS);

// Routes
app.use("/user", UserRoutes);
app.use("/api", eventRoutes);

// ✅ SOCKET.IO DISASTER ALERT HANDLER
io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('new-disaster', async (disaster) => {
        try {
            const coords = disaster?.geometries?.[0]?.coordinates;
            if (!coords || coords.length !== 2) {
                console.warn("⚠️ Invalid coordinates in disaster object.");
                return;
            }

            const disasterPoint = {
                latitude: coords[1],
                longitude: coords[0]
            };

            const users = await User.find({ alertsEnabled: true }).select('phone location');
            console.log(`📡 Broadcasting disaster to ${users.length} users`);

            for (const user of users) {
                if (!user.location || !user.phone) continue;

                const userLocation = {
                    latitude: user.location.lat,
                    longitude: user.location.lng
                };

                const distance = geolib.getDistance(userLocation, disasterPoint);

                if (distance <= 50000) { // 50 km
                    const message = `🚨 ALERT: ${disaster.title || 'A disaster'} has occurred near your area. Stay safe.`;

                    await sendSMS(user.phone, message);
                    io.to(socket.id).emit('disaster-sent', {
                        to: user.phone,
                        distance,
                        success: true
                    });
                }
            }
        } catch (err) {
            console.error("❌ Error in new-disaster socket handler:", err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected:', socket.id);
    });
});

// Start Server
server.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});
