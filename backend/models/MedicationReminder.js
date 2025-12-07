// backend/models/MedicationReminder.js
const mongoose = require('mongoose');

const medicationReminderSchema = new mongoose.Schema({
  reminder: {
    type: String,
    required: true, // short description of the reminder
    trim: true
  },
  patientId: {
    type: String,
    required: true,
    trim: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true, // store "HH:MM" or "HH:MM AM/PM"
    trim: true
  },
  frequency: {
    type: String,
    required: true, // e.g. "Daily", "Weekly", "Once"
    trim: true
  },
  method: {
    type: String,
    required: true, // e.g. "App", "SMS", "Email"
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model to use in routes/controllers
module.exports = mongoose.model('MedicationReminder', medicationReminderSchema);
