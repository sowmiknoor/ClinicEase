const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: String,
  instructions: String,
  refills: { type: Number, default: 0 }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: String,
  medications: [medicationSchema],
  notes: String,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  validUntil: Date
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
