const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Nutrition', 'Exercise', 'Mental Health', 'Sleep', 'Hygiene', 'Preventive Care', 'Lifestyle']
  },
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tips: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

healthTipSchema.index({ category: 1, isPublished: 1 });
healthTipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HealthTip', healthTipSchema);
