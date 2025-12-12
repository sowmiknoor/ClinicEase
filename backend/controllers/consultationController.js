const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create/book a consultation
exports.bookConsultation = async (req, res) => {
  try {
    const { doctorId, scheduledAt, durationMinutes, notes, mobileNumber } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({ ok: false, error: 'scheduledAt is required' });
    }

    // Do NOT create meeting link automatically - only doctor can send invitation
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
      status: 'scheduled'
    });

    const saved = await consult.save();

    // Send notification to doctor if doctorId is provided
    if (validDoctorId) {
      const patient = await User.findById(req.userId);
      const doctor = await User.findById(validDoctorId);
      
      if (doctor && doctor.role === 'Doctor') {
        const notification = new Notification({
          userId: validDoctorId,
          title: '🩺 New Tele-Consultation Request',
          body: `${patient.name} has scheduled a tele-consultation on ${new Date(scheduledAt).toLocaleString()}. Duration: ${durationMinutes || 30} minutes.`,
          category: 'tele-consult'
        });
        await notification.save();
        console.log('Tele-consult notification sent to doctor:', validDoctorId);
      }
    }

    res.status(201).json({ ok: true, consultation: saved });
  } catch (err) {
    console.error('Error booking consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get user's consultations
exports.getUserConsultations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    let consults;
    
    if (currentUser.role === 'Doctor') {
      // For doctors, fetch consultations where they are the assigned doctor
      consults = await Consultation.find({ doctorId: req.userId })
        .populate('userId', 'name email phone')
        .populate('doctorId', 'name email phone specialist designation')
        .sort({ scheduledAt: -1 });
    } else {
      // For patients, fetch their own consultations
      consults = await Consultation.find({ userId: req.userId })
        .populate('userId', 'name email phone')
        .populate('doctorId', 'name email phone specialist designation')
        .sort({ scheduledAt: -1 });
    }
    
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

// Generate (placeholder) meeting link — returns existing link or creates one (DOCTOR ONLY)
exports.ensureMeetingLink = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id).populate('userId', 'name');
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    
    // Verify the current user is the doctor assigned to this consultation
    const currentUser = await User.findById(req.userId);
    if (currentUser.role !== 'Doctor' || consult.doctorId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Only the assigned doctor can send meeting invitations' });
    }
    
    if (!consult.meetingLink) {
      consult.meetingLink = `https://meet.google.com/${Date.now().toString(36)}-${Math.floor(Math.random()*9000+1000)}`;
      await consult.save();
      
      // Send notification to patient that meeting invitation is ready
      const notification = new Notification({
        userId: consult.userId._id,
        title: '📧 Meeting Invitation Received',
        body: `Dr. ${currentUser.name} has sent you a Google Meet invitation for your consultation on ${new Date(consult.scheduledAt).toLocaleString()}. Click to join!`,
        category: 'tele-consult'
      });
      await notification.save();
      console.log('Meeting invitation notification sent to patient:', consult.userId._id);
    }
    res.json({ ok: true, meetingLink: consult.meetingLink });
  } catch (err) {
    console.error('Error ensuring meeting link:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Accept consultation request (Doctor only)
exports.acceptConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id).populate('userId', 'name');
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    
    // Verify the current user is the doctor assigned to this consultation
    if (!consult.doctorId || consult.doctorId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized - Not assigned doctor' });
    }
    
    consult.status = 'accepted';
    await consult.save();

    // Send notification to patient
    const doctor = await User.findById(req.userId);
    const notification = new Notification({
      userId: consult.userId._id,
      title: '✅ Consultation Accepted',
      body: `Dr. ${doctor.name} has accepted your tele-consultation request scheduled on ${new Date(consult.scheduledAt).toLocaleString()}.`,
      category: 'tele-consult'
    });
    await notification.save();
    console.log('Acceptance notification sent to patient:', consult.userId._id);

    res.json({ ok: true, message: 'Consultation accepted', consultation: consult });
  } catch (err) {
    console.error('Error accepting consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Reject consultation request (Doctor only)
exports.rejectConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id).populate('userId', 'name');
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    
    // Verify the current user is the doctor assigned to this consultation
    if (!consult.doctorId || consult.doctorId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized - Not assigned doctor' });
    }
    
    consult.status = 'rejected';
    await consult.save();

    // Send notification to patient
    const doctor = await User.findById(req.userId);
    const notification = new Notification({
      userId: consult.userId._id,
      title: '❌ Consultation Rejected',
      body: `Dr. ${doctor.name} is unable to accept your tele-consultation request scheduled on ${new Date(consult.scheduledAt).toLocaleString()}. Please try booking with another doctor.`,
      category: 'tele-consult'
    });
    await notification.save();
    console.log('Rejection notification sent to patient:', consult.userId._id);

    res.json({ ok: true, message: 'Consultation rejected', consultation: consult });
  } catch (err) {
    console.error('Error rejecting consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Complete consultation (Doctor only)
exports.completeConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findById(req.params.id).populate('userId', 'name');
    if (!consult) return res.status(404).json({ ok: false, error: 'Consultation not found' });
    
    // Verify the current user is the doctor assigned to this consultation
    if (!consult.doctorId || consult.doctorId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized - Not assigned doctor' });
    }
    
    consult.status = 'completed';
    await consult.save();

    // Send notification to patient
    const doctor = await User.findById(req.userId);
    const notification = new Notification({
      userId: consult.userId._id,
      title: '✅ Consultation Completed',
      body: `Your tele-consultation with Dr. ${doctor.name} has been marked as completed. Thank you for using ClinicEase!`,
      category: 'tele-consult'
    });
    await notification.save();
    console.log('Completion notification sent to patient:', consult.userId._id);

    res.json({ ok: true, message: 'Consultation completed', consultation: consult });
  } catch (err) {
    console.error('Error completing consultation:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
