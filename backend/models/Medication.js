const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medicationName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      enum: ['Once daily', 'Twice daily', 'Thrice daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed'],
      required: true
    },
    timesPerDay: {
      type: Number,
      default: 1
    },
    reminderTimes: {
      type: [String], // Array of times in HH:MM format (e.g., ["08:00", "20:00"])
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    prescribedBy: String, // Doctor name or ID
    reason: String, // Why the medication is prescribed
    sideEffects: [String], // Known side effects
    notes: String, // Additional notes
    isActive: {
      type: Boolean,
      default: true
    },
    taken: {
      type: Number,
      default: 0
    },
    missed: {
      type: Number,
      default: 0
    },
    takenDates: [
      {
        date: Date,
        takenTime: String,
        status: {
          type: String,
          enum: ['taken', 'missed', 'skipped'],
          default: 'taken'
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
