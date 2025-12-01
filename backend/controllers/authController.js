// backend/controllers/authController.js

const User = require("../models/User");

// REGISTER USER (NO SECURITY)
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const exist = await User.findOne({ email });
    if (exist) return res.json({ ok: false, msg: "Email already used" });

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password, // plain text
      role
    });

    // Respond with success
    res.json({ ok: true, msg: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// LOGIN USER (NO SECURITY)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, msg: "User not found" });

    // Check password
    if (user.password !== password)
      return res.json({ ok: false, msg: "Wrong password" });

    // Send user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({ ok: true, msg: "Login successful", user: userData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
