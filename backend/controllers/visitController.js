const Visit = require('../models/Visit');
const User = require('../models/User');

// Request a home visit
exports.requestVisit = async (req, res) => {
  try {
    const { address, location, requestedDateTime, doctorId, notes } = req.body;
    if (!address || !requestedDateTime) {
      return res.status(400).json({ ok: false, error: 'address and requestedDateTime are required' });
    }

    const visit = new Visit({
      userId: req.userId,
      address,
      location,
      requestedDateTime: new Date(requestedDateTime),
      doctorId: doctorId || undefined,
      notes
    });

    const saved = await visit.save();
    res.status(201).json({ ok: true, visit: saved });
  } catch (err) {
    console.error('Error requesting visit:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all visits for the user
exports.getUserVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ ok: true, visits });
  } catch (err) {
    console.error('Error fetching visits:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get visit by id
exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ ok: false, error: 'Visit not found' });
    if (visit.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });
    res.json({ ok: true, visit });
  } catch (err) {
    console.error('Error fetching visit:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update visit status (e.g., scheduled, in_progress, completed, canceled)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ ok: false, error: 'status is required' });

    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ ok: false, error: 'Visit not found' });
    // Only user or assigned doctor can update; simple check for now
    if (visit.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });

    visit.status = status;
    await visit.save();
    res.json({ ok: true, visit });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Add route point (coordinates) to visit (used by driver app)
exports.addRoutePoint = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ ok: false, error: 'lat and lng numbers are required' });
    }

    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ ok: false, error: 'Visit not found' });

    visit.route.push({ lat, lng, recordedAt: new Date() });
    await visit.save();
    res.json({ ok: true, route: visit.route });
  } catch (err) {
    console.error('Error adding route point:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// List available doctors (simple helper)
exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).select('name email phone');
    res.json({ ok: true, doctors });
  } catch (err) {
    console.error('Error listing doctors:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
