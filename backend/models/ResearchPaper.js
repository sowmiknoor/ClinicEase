const mongoose = require('mongoose');

const researchPaperSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Cardiology', 'Oncology', 'Neurology', 'Infectious Diseases', 'Diabetes', 'Public Health', 'Mental Health', 'Pediatrics', 'Dermatology', 'Orthopedics']
  },
  title: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  journal: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  abstract: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  doi: {
    type: String,
    required: true,
    unique: true
  },
  citations: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    default: '#'
  },
  keyFindings: [{
    type: String
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedByName: String,
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

researchPaperSchema.index({ category: 1, isPublished: 1 });
researchPaperSchema.index({ year: -1 });
researchPaperSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ResearchPaper', researchPaperSchema);
