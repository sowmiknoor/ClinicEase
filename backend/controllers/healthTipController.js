const HealthTip = require('../models/HealthTip');

// Get all published health tips
exports.getAllHealthTips = async (req, res) => {
  try {
    const tips = await HealthTip.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({ ok: true, tips });
  } catch (err) {
    console.error('Error fetching health tips:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Get health tip by ID
exports.getHealthTipById = async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ ok: false, msg: 'Health tip not found' });
    }

    // Increment views
    tip.views += 1;
    await tip.save();
    
    res.json({ ok: true, tip });
  } catch (err) {
    console.error('Error fetching health tip:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Create new health tip (Admin/Doctor only)
exports.createHealthTip = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { category, title, icon, content, tips } = req.body;

    if (!category || !title || !content || !tips || tips.length === 0) {
      return res.status(400).json({ ok: false, msg: 'Missing required fields' });
    }

    // Get user info
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || (user.role !== 'Admin' && user.role !== 'Doctor')) {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    const healthTip = new HealthTip({
      category,
      title,
      icon: icon || '💡',
      content,
      tips,
      author: userId,
      authorName: user.name
    });

    await healthTip.save();
    res.json({ ok: true, tip: healthTip });
  } catch (err) {
    console.error('Error creating health tip:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Update health tip
exports.updateHealthTip = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const updates = req.body;

    const tip = await HealthTip.findById(id);
    if (!tip) {
      return res.status(404).json({ ok: false, msg: 'Health tip not found' });
    }

    // Check authorization
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || (user.role !== 'Admin' && tip.author.toString() !== userId)) {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    Object.assign(tip, updates);
    tip.updatedAt = Date.now();
    await tip.save();

    res.json({ ok: true, tip });
  } catch (err) {
    console.error('Error updating health tip:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Delete health tip
exports.deleteHealthTip = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const tip = await HealthTip.findById(id);
    if (!tip) {
      return res.status(404).json({ ok: false, msg: 'Health tip not found' });
    }

    // Check authorization (Admin only)
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    await HealthTip.findByIdAndDelete(id);
    res.json({ ok: true, msg: 'Health tip deleted' });
  } catch (err) {
    console.error('Error deleting health tip:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Like/Unlike health tip
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const tip = await HealthTip.findById(id);
    if (!tip) {
      return res.status(404).json({ ok: false, msg: 'Health tip not found' });
    }

    const likeIndex = tip.likes.indexOf(userId);
    if (likeIndex > -1) {
      tip.likes.splice(likeIndex, 1);
    } else {
      tip.likes.push(userId);
    }

    await tip.save();
    res.json({ ok: true, likes: tip.likes.length, isLiked: likeIndex === -1 });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};
