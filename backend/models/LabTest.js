const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testType: String,
  status: { type: String, enum: ['ordered', 'scheduled', 'completed', 'cancelled'], default: 'ordered' },
  scheduledDate: Date,
  resultUrl: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
