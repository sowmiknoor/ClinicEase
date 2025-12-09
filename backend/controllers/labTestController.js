const LabTest = require('../models/LabTest');

const scopeFilter = (user) => {
  if (!user) return {};
  if (user.role === 'Patient') return { patientId: user._id };
  return {};
};

exports.create = async (req, res) => {
  try {
    const { patientId, testType, scheduledDate, notes } = req.body;
    const pid = req.user.role === 'Patient' ? req.user._id : (patientId || req.query.patientId);
    if (!pid) return res.json({ ok: false, msg: 'patientId required' });
    const docId = req.user.role === 'Doctor' || req.user.role === 'Admin' ? req.user._id : undefined;
    const test = await LabTest.create({ patientId: pid, doctorId: docId, testType, scheduledDate, notes });
    res.json({ ok: true, labTest: test });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    if (req.query.patientId && req.user.role !== 'Patient') filter.patientId = req.query.patientId;
    const data = await LabTest.find(filter).sort('-createdAt');
    res.json({ ok: true, labTests: data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultUrl } = req.body;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const updated = await LabTest.findOneAndUpdate(filter, { status, resultUrl }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, labTest: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
