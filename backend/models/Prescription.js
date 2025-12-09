const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medications: [medicationSchema],
  notes: String,
  status: { type: String, enum: ['draft', 'issued', 'completed', 'cancelled'], default: 'issued' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
