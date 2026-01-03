const Invoice = require('../models/Invoice');

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
    
    const updated = await Invoice.findOneAndUpdate(filter, updateData, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, invoice: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
