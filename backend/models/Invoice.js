const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'cancelled'], default: 'unpaid' },
  description: String,
  dueDate: Date,
  paymentMethod: { type: String, enum: ['bKash', 'Nagad', 'MasterCard', 'Visa', 'Cash', 'Other'], default: null },
  paymentDate: Date,
  transactionId: String,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
