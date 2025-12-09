const Prescription = require('../models/Prescription');

const scopeFilter = (user) => {
  if (!user) return {};
  if (user.role === 'Patient') return { patientId: user._id };
  return {}; // Doctor/Admin can see all or filter by patientId passed from route/query
};

exports.create = async (req, res) => {
  try {
    const { patientId, medications = [], notes } = req.body;
    const docId = req.user?._id;
    const pid = req.user.role === 'Patient' ? req.user._id : (patientId || req.body.patientId || req.params.patientId);
    if (!pid) return res.json({ ok: false, msg: 'patientId required' });
    const p = await Prescription.create({ patientId: pid, doctorId: docId, medications, notes });
    res.json({ ok: true, prescription: p });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    if (req.query.patientId && req.user.role !== 'Patient') filter.patientId = req.query.patientId;
    const data = await Prescription.find(filter).sort('-createdAt');
    res.json({ ok: true, prescriptions: data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const updated = await Prescription.findOneAndUpdate(filter, { status }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, prescription: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
