// backend/controllers/authController.js

const User = require("../models/User");

// REGISTER USER (NO SECURITY)
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      return res.json({ ok: false, msg: "Passwords do not match" });
    }

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
      darkMode: user.darkMode || false,
      language: user.language || 'en',
      createdAt: user.createdAt
    };

    res.json({ ok: true, msg: "Login successful", user: userData });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// MIDDLEWARE: Verify user ID (from request header or body)
exports.authMiddleware = (req, res, next) => {
  try {
    // The userId should be passed in the request header or extracted from token
    // For now, we expect it in the header
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
      return res.status(401).json({ ok: false, error: 'User ID is required' });
    }

    User.findById(userId)
      .then((user) => {
        if (!user) return res.status(401).json({ ok: false, error: 'Invalid user' });
        req.userId = userId;
        req.user = user;
        next();
      })
      .catch(() => res.status(401).json({ ok: false, error: 'Unauthorized' }));
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
};

// Simple role guard
exports.requireRoles = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  next();
};

// UPDATE USER SETTINGS (including dark mode and language)
exports.updateSettings = async (req, res) => {
  try {
    const { userId, darkMode, language } = req.body;
    
    if (!userId) {
      return res.status(400).json({ ok: false, msg: 'User ID required' });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (typeof darkMode !== 'undefined') {
      updateData.darkMode = darkMode;
    }
    if (language) {
      updateData.language = language;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, msg: 'User not found' });
    }

    res.json({ 
      ok: true, 
      msg: 'Settings updated', 
      darkMode: user.darkMode,
      language: user.language 
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
