const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['teleconsultation', 'home-visit', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  notes: String,
  rejectionReason: String,
  completionNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
