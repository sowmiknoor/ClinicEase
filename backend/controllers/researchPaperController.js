const ResearchPaper = require('../models/ResearchPaper');

// Get all published research papers
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await ResearchPaper.find({ isPublished: true })
      .sort({ year: -1, createdAt: -1 })
      .select('-__v');
    
    res.json({ ok: true, papers });
  } catch (err) {
    console.error('Error fetching research papers:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Get research paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const paper = await ResearchPaper.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ ok: false, msg: 'Research paper not found' });
    }

    // Increment views
    paper.views += 1;
    await paper.save();
    
    res.json({ ok: true, paper });
  } catch (err) {
    console.error('Error fetching research paper:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Create new research paper (Admin/Doctor only)
exports.createPaper = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { category, title, authors, journal, year, abstract, keywords, doi, keyFindings, link } = req.body;

    if (!category || !title || !authors || !journal || !year || !abstract || !doi || !keyFindings) {
      return res.status(400).json({ ok: false, msg: 'Missing required fields' });
    }

    // Get user info
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || (user.role !== 'Admin' && user.role !== 'Doctor')) {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    const paper = new ResearchPaper({
      category,
      title,
      authors,
      journal,
      year,
      abstract,
      keywords: keywords || [],
      doi,
      keyFindings,
      link: link || '#',
      uploadedBy: userId,
      uploadedByName: user.name
    });

    await paper.save();
    res.json({ ok: true, paper });
  } catch (err) {
    console.error('Error creating research paper:', err);
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, msg: 'Paper with this DOI already exists' });
    }
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Update research paper
exports.updatePaper = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;
    const updates = req.body;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({ ok: false, msg: 'Research paper not found' });
    }

    // Check authorization
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || (user.role !== 'Admin' && paper.uploadedBy.toString() !== userId)) {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    Object.assign(paper, updates);
    paper.updatedAt = Date.now();
    await paper.save();

    res.json({ ok: true, paper });
  } catch (err) {
    console.error('Error updating research paper:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Delete research paper
exports.deletePaper = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { id } = req.params;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({ ok: false, msg: 'Research paper not found' });
    }

    // Check authorization (Admin only)
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Unauthorized' });
    }

    await ResearchPaper.findByIdAndDelete(id);
    res.json({ ok: true, msg: 'Research paper deleted' });
  } catch (err) {
    console.error('Error deleting research paper:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Increment citation count
exports.incrementCitations = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return res.status(404).json({ ok: false, msg: 'Research paper not found' });
    }

    paper.citations += 1;
    await paper.save();

    res.json({ ok: true, citations: paper.citations });
  } catch (err) {
    console.error('Error incrementing citations:', err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
};
