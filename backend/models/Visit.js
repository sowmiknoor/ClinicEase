const mongoose = require('mongoose');

const coordSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  recordedAt: { type: Date, default: Date.now }
});

const visitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, required: true },
    location: {
      // optional single coordinate for the address
      lat: Number,
      lng: Number
    },
    requestedDateTime: { type: Date, required: true },
    status: { type: String, enum: ['requested', 'scheduled', 'in_progress', 'completed', 'canceled'], default: 'requested' },
    notes: String,
    route: [coordSchema], // route tracking: list of coords
    assignedVehicle: String,
    estimatedArrivalMinutes: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', visitSchema);
