const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,  // plain text (unsafe, but as you requested)
    role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], default: 'Patient' },
    darkMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
