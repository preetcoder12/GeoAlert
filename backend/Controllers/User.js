const User = require("../models/Users");
const bcrypt = require("bcrypt");

const UserSignup = async (req, res) => {
    try {
        const { name, email, password, role, subscribedToAlerts } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        const nameRegex = /^[A-Za-z\s]{3,50}$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ error: "Invalid name format" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
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
            subscribedToAlerts,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error during signup:", error.message);
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
            return res.status(400).json({ error: "User does'nt exist with provided email" });
        }

        const passwordmatch = await bcrypt.compare(password, existing_user.password);
        if (!passwordmatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        res.status(200).json({ message: "User login successful!" });

    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { UserSignup, UserLogin };
