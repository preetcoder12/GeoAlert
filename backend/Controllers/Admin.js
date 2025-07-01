const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { default: mongoose } = require("mongoose");
const Reports = require("../models/Reports");

require("dotenv").config();

const AdminSignup = async (req, res) => {
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
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const existing_admin = await Admin.findOne({ email });
    if (existing_admin) {
      return res
        .status(400)
        .json({ error: "Admin already exists with the same email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const AdminLogin = async (req, res) => {
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
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const existing_Admin = await Admin.findOne({ email });
    if (!existing_Admin) {
      return res
        .status(400)
        .json({ error: "Admin doesn't exist with provided email" });
    }

    const passwordmatch = await bcrypt.compare(
      password,
      existing_Admin.password
    );
    if (!passwordmatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = existing_Admin._id.toString();

    return res.status(200).json({
      message: "Admin logged in successfully",
      token,
      Admin: {
        id: existing_Admin._id,
        email: existing_Admin.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const AllUsers = async (req, res) => {
  try {
    const user = await User.find({}).select("-password");

    if (!user) {
      return res.status(404).json({ error: "No user found ...(self)" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error during AllUser access:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const Allincidents = async (req, res) => {
  try {
    const reports = await Reports.find({});

    if (!reports) {
      return res.status(404).json({ error: "No user found ...(self)" });
    }
    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error during Allindcidents access:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deletespecificuser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const selectedUser = await User.deleteOne({ _id: id });

    if (selectedUser.deletedCount === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User deleted successfully", selectedUser });
  } catch (error) {
    console.error("Error during deleting user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const specificincident = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const incident = await Reports.findById(id);

    if (!incident) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ incident });
  } catch (error) {
    console.error("Error fetching incident details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  specificincident,
  AdminSignup,
  AdminLogin,
  AllUsers,
  deletespecificuser,
  Allincidents,
};
