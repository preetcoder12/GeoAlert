require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRoutes = require("./Routes/User");
const eventRoutes = require("./Routes/API");
// const authMiddleware = require("./Middleware/Auth");

const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Failed:", err);
        process.exit(1);
    });

// Test Route
app.get("/", (req, res) => {
    res.send("Hello, world!");
});


// Routes
app.use("/user", UserRoutes);
app.use("/api", eventRoutes);

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});
