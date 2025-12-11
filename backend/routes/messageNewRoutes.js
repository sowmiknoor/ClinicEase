const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { fromUser, toUser, content } = req.body;

    const message = new Message({
      fromUser,
      toUser,
      content
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role');
    
    res.json({ ok: true, message: 'Message sent successfully', data: populatedMessage });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error sending message', error: err.message });
  }
};

// Get messages for a user (inbox)
const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ toUser: userId })
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching messages', error: err.message });
  }
};

// Get sent messages
const getSentMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ fromUser: userId })
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching sent messages', error: err.message });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { fromUser: userId1, toUser: userId2 },
        { fromUser: userId2, toUser: userId1 }
      ]
    })
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role')
      .sort({ createdAt: 1 });
    
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching conversation', error: err.message });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );
    
    res.json({ ok: true, message: 'Message marked as read', data: message });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error marking message', error: err.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({ toUser: userId, read: false });
    
    res.json({ ok: true, count });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching unread count', error: err.message });
  }
};

// Send message
router.post('/send', sendMessage);

// Get messages
router.get('/inbox/:userId', getUserMessages);
router.get('/sent/:userId', getSentMessages);
router.get('/conversation/:userId1/:userId2', getConversation);

// Mark as read
router.put('/read/:messageId', markAsRead);

// Get unread count
router.get('/unread-count/:userId', getUnreadCount);

module.exports = router;
