const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const User = require('../models/User');

const scopeFilter = (user) => {
  if (!user) return {};
  if (user.role === 'Patient') return { patientId: user._id };
  return {};
};

exports.create = async (req, res) => {
  try {
    const { patientId, amount, description, dueDate } = req.body;
    const pid = req.user.role === 'Patient' ? req.user._id : (patientId || req.query.patientId);
    if (!pid) return res.json({ ok: false, msg: 'patientId required' });
    const doctorId = req.user.role === 'Doctor' ? req.user._id : null;
    const inv = await Invoice.create({ patientId: pid, doctorId, amount, description, dueDate });
    
    // Get patient and doctor details for notification
    const patient = await User.findById(pid);
    const doctor = doctorId ? await User.findById(doctorId) : null;
    
    // Notify patient about new invoice
    if (patient) {
      await Notification.create({
        userId: pid,
        title: '💰 New Invoice Created',
        body: `A new invoice of ৳${amount} has been created${doctor ? ` by Dr. ${doctor.name}` : ''}. ${description || 'Please review and pay.'}`,
        category: 'billing'
      });
    }
    
    // Notify doctor about invoice creation
    if (doctorId && doctor) {
      await Notification.create({
        userId: doctorId,
        title: '💰 Invoice Created',
        body: `Invoice of ৳${amount} created for ${patient.name}. ${description || ''}`,
        category: 'billing'
      });
    }
    
    res.json({ ok: true, invoice: inv });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    if (req.query.patientId && req.user.role !== 'Patient') filter.patientId = req.query.patientId;
    const data = await Invoice.find(filter)
      .populate('doctorId', 'name email phone')
      .populate('patientId', 'name email phone')
      .sort('-createdAt');
    res.json({ ok: true, invoices: data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, transactionId } = req.body;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const updateData = { status };
    
    if (status === 'paid') {
      updateData.paymentDate = new Date();
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (transactionId) updateData.transactionId = transactionId;
    }
    
    const updated = await Invoice.findOneAndUpdate(filter, updateData, { new: true })
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');
    
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    
    // Notify on payment completion
    if (status === 'paid') {
      // Notify patient
      if (updated.patientId) {
        await Notification.create({
          userId: updated.patientId._id,
          title: '✅ Payment Successful',
          body: `Your payment of ৳${updated.amount} has been successfully processed${paymentMethod ? ` via ${paymentMethod}` : ''}.${transactionId ? ` Transaction ID: ${transactionId}` : ''}`,
          category: 'billing'
        });
      }
      
      // Notify doctor
      if (updated.doctorId) {
        await Notification.create({
          userId: updated.doctorId._id,
          title: '✅ Payment Received',
          body: `Payment of ৳${updated.amount} received from ${updated.patientId?.name || 'patient'}${paymentMethod ? ` via ${paymentMethod}` : ''}.`,
          category: 'billing'
        });
      }
    }
    
    res.json({ ok: true, invoice: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
