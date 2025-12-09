const Record = require('../models/Record');

const scopeFilter = (user) => {
  if (!user) return {};
  if (user.role === 'Patient') return { patientId: user._id };
  return {};
};

exports.create = async (req, res) => {
  try {
    const { patientId, title, description, attachmentUrl } = req.body;
    const pid = req.user.role === 'Patient' ? req.user._id : (patientId || req.query.patientId);
    if (!pid) return res.json({ ok: false, msg: 'patientId required' });
    const rec = await Record.create({ patientId: pid, doctorId: req.user._id, title, description, attachmentUrl });
    res.json({ ok: true, record: rec });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    if (req.query.patientId && req.user.role !== 'Patient') filter.patientId = req.query.patientId;
    const data = await Record.find(filter).sort('-createdAt');
    res.json({ ok: true, records: data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
