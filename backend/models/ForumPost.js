const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'General Health',
        'Mental Health',
        'Nutrition',
        'Exercise & Fitness',
        'Disease Prevention',
        'Research Papers',
        'Medical Breakthrough',
        'Patient Stories',
        'Health Tips',
        'Q&A',
        'Other'
      ],
      default: 'General Health'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: String,
    authorRole: String,
    tags: [String],
    attachments: [{
      filename: String,
      url: String,
      type: String // 'pdf', 'image', 'document'
    }],
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      userRole: String,
      content: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    isHidden: {
      type: Boolean,
      default: false
    },
    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hiddenReason: String,
    hiddenAt: Date,
    views: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for better query performance
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ authorId: 1 });
forumPostSchema.index({ isHidden: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
