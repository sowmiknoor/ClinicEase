const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    status: { type: String, enum: ['requested','scheduled','confirmed','accepted','rejected','in_progress','completed','canceled'], default: 'requested' },
    meetingLink: { type: String },
    mobileNumber: { type: String },
    notes: { type: String },
    patientNotes: { type: String },
    providerNotes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
