const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Create/book a consultation
exports.bookConsultation = async (req, res) => {
  try {
    const { doctorId, scheduledAt, durationMinutes, notes, mobileNumber } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ ok: false, error: 'scheduledAt is required' });
    }

    // create placeholder meeting link (in real app integrate Jitsi/Zoom/API)
    const meetingLink = `https://meet.example.com/${Date.now().toString(36)}-${Math.floor(Math.random()*9000+1000)}`;

    // Validate doctorId if provided - must be valid ObjectId or empty
    let validDoctorId = undefined;
    if (doctorId && doctorId.trim() !== '') {
      // Check if it's a valid MongoDB ObjectId format (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(doctorId)) {
        validDoctorId = doctorId;
      }
      // If not valid ObjectId format, leave it undefined (optional field)
    }

    const consult = new Consultation({
      userId: req.userId,
      doctorId: validDoctorId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 30,
      mobileNumber: mobileNumber || undefined,
      notes,
      meetingLink,
      status: 'scheduled'
    });

    const saved = await consult.save();
    res.status(201).json({ ok: true, consultation: saved });
  } catch (err) {
    console.error('Error booking consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get user's consultations
exports.getUserConsultations = async (req, res) => {
  try {
    const consults = await Consultation.find({ userId: req.userId }).sort({ scheduledAt: -1 });
    res.json({ ok: true, consultations: consults });
  } catch (err) {
    console.error('Error fetching consultations:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get consultation by id
exports.getConsultationById = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id);
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    if (consult.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });
    res.json({ ok: true, consultation: consult });
  } catch (err) {
    console.error('Error fetching consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update status (confirm, start, complete, cancel)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ ok: false, error: 'status required' });
    const consult = await Consultation.findById(req.params.id);
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    if (consult.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });
    consult.status = status;
    await consult.save();
    res.json({ ok: true, consultation: consult });
  } catch (err) {
    console.error('Error updating consultation status:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id);
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    if (consult.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });
    consult.status = 'canceled';
    await consult.save();
    res.json({ ok: true, message: 'Consultation canceled', consultation: consult });
  } catch (err) {
    console.error('Error canceling consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Generate (placeholder) meeting link — returns existing link or creates one
exports.ensureMeetingLink = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id);
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    if (consult.userId.toString() !== req.userId) return res.status(403).json({ ok: false, error: 'Unauthorized' });
    if (!consult.meetingLink) {
      consult.meetingLink = `https://meet.example.com/${Date.now().toString(36)}-${Math.floor(Math.random()*9000+1000)}`;
      await consult.save();
    }
    res.json({ ok: true, meetingLink: consult.meetingLink });
  } catch (err) {
    console.error('Error ensuring meeting link:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
