const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ ok: true, notifications: notes });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { userId, title, body, category } = req.body;
    const target = userId || req.user._id;
    const note = await Notification.create({ userId: target, title, body, category: category || 'general' });
    res.json({ ok: true, notification: note });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, notification: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
