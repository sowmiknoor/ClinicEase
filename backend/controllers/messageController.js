const Message = require('../models/Message');

exports.send = async (req, res) => {
  try {
    const { toUser, content } = req.body;
    if (!toUser) return res.json({ ok: false, msg: 'toUser required' });
    const msg = await Message.create({ fromUser: req.user._id, toUser, content });
    res.json({ ok: true, message: msg });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.inbox = async (req, res) => {
  try {
    const uid = req.user._id;
    const messages = await Message.find({ $or: [ { toUser: uid }, { fromUser: uid } ] }).sort('-createdAt');
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user._id;
    const updated = await Message.findOneAndUpdate({ _id: id, toUser: uid }, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, message: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
