const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testType: String,
  category: String,
  status: { type: String, enum: ['ordered', 'scheduled', 'in_progress', 'completed', 'cancelled'], default: 'ordered' },
  scheduledDate: Date,
  completedDate: Date,
  resultUrl: String,
  testResults: {
    value: String,
    unit: String,
    normalRange: String,
    interpretation: String
  },
  labName: String,
  labLocation: String,
  notes: String,
  patientNotes: String,
  batchOrderId: String  // Groups tests ordered together
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
