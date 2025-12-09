const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'cancelled'], default: 'unpaid' },
  description: String,
  dueDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
