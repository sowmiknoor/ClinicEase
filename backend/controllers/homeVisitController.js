const HomeVisit = require('../models/HomeVisit');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Patient: Create home visit request
exports.createHomeVisit = async (req, res) => {
  try {
    const { doctorId, visitDate, visitTime, address, reasonForVisit, emergencyContact, notes } = req.body;
    const patientId = req.user._id;

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ ok: false, message: 'Doctor not found' });
    }

    const patient = await User.findById(patientId);

    const homeVisit = new HomeVisit({
      patientId,
      doctorId,
      visitDate,
      visitTime,
      address,
      reasonForVisit,
      emergencyContact,
      notes,
      status: 'pending'
    });

    await homeVisit.save();

    // Send notification to doctor
    const notification = new Notification({
      userId: doctorId,
      title: '🏠 New Home Visit Request',
      body: `${patient.name} has requested a home visit on ${new Date(visitDate).toLocaleDateString()} at ${visitTime}. Reason: ${reasonForVisit}`,
      category: 'home-visit'
    });
    await notification.save();

    const populated = await HomeVisit.findById(homeVisit._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    console.log('Home visit request created:', homeVisit._id, 'Patient:', patientId, 'Doctor:', doctorId);
    console.log('Notification sent to doctor:', doctorId);

    res.json({ ok: true, message: 'Home visit request created successfully', homeVisit: populated });
  } catch (err) {
    console.error('Error creating home visit:', err);
    res.status(500).json({ ok: false, message: 'Error creating home visit request', error: err.message });
  }
};

// Patient: Cancel home visit request
exports.cancelHomeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    const homeVisit = await HomeVisit.findById(id);
    
    if (!homeVisit) {
      return res.status(404).json({ ok: false, message: 'Home visit not found' });
    }

    if (homeVisit.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized to cancel this request' });
    }

    if (homeVisit.status === 'completed') {
      return res.status(400).json({ ok: false, message: 'Cannot cancel completed visit' });
    }

    homeVisit.status = 'cancelled';
    await homeVisit.save();

    console.log('Home visit cancelled by patient:', id);

    res.json({ ok: true, message: 'Home visit request cancelled', homeVisit });
  } catch (err) {
    console.error('Error cancelling home visit:', err);
    res.status(500).json({ ok: false, message: 'Error cancelling home visit', error: err.message });
  }
};

// Doctor: Accept home visit request
exports.acceptHomeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;

    const homeVisit = await HomeVisit.findById(id);
    
    if (!homeVisit) {
      return res.status(404).json({ ok: false, message: 'Home visit not found' });
    }

    if (homeVisit.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized to accept this request' });
    }

    if (homeVisit.status !== 'pending') {
      return res.status(400).json({ ok: false, message: 'Can only accept pending requests' });
    }

    homeVisit.status = 'accepted';
    await homeVisit.save();

    const populated = await HomeVisit.findById(homeVisit._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    console.log('Home visit accepted by doctor:', id);

    res.json({ ok: true, message: 'Home visit request accepted', homeVisit: populated });
  } catch (err) {
    console.error('Error accepting home visit:', err);
    res.status(500).json({ ok: false, message: 'Error accepting home visit', error: err.message });
  }
};

// Doctor: Reject home visit request
exports.rejectHomeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const doctorId = req.user._id;

    const homeVisit = await HomeVisit.findById(id);
    
    if (!homeVisit) {
      return res.status(404).json({ ok: false, message: 'Home visit not found' });
    }

    if (homeVisit.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized to reject this request' });
    }

    if (homeVisit.status !== 'pending') {
      return res.status(400).json({ ok: false, message: 'Can only reject pending requests' });
    }

    homeVisit.status = 'rejected';
    homeVisit.rejectionReason = rejectionReason || 'No reason provided';
    await homeVisit.save();

    const populated = await HomeVisit.findById(homeVisit._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    console.log('Home visit rejected by doctor:', id);

    res.json({ ok: true, message: 'Home visit request rejected', homeVisit: populated });
  } catch (err) {
    console.error('Error rejecting home visit:', err);
    res.status(500).json({ ok: false, message: 'Error rejecting home visit', error: err.message });
  }
};

// Get home visits (filtered by role)
exports.getHomeVisits = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let filter = {};
    
    if (userRole === 'Patient') {
      filter.patientId = userId;
    } else if (userRole === 'Doctor') {
      filter.doctorId = userId;
    }
    // Admin can see all (no filter)

    const homeVisits = await HomeVisit.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort('-createdAt');

    console.log('Home visits fetched - User:', userId, 'Role:', userRole, 'Count:', homeVisits.length);

    res.json({ ok: true, homeVisits });
  } catch (err) {
    console.error('Error fetching home visits:', err);
    res.status(500).json({ ok: false, message: 'Error fetching home visits', error: err.message });
  }
};

// Get single home visit
exports.getHomeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const homeVisit = await HomeVisit.findById(id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    if (!homeVisit) {
      return res.status(404).json({ ok: false, message: 'Home visit not found' });
    }

    res.json({ ok: true, homeVisit });
  } catch (err) {
    console.error('Error fetching home visit:', err);
    res.status(500).json({ ok: false, message: 'Error fetching home visit', error: err.message });
  }
};

// Doctor: Mark visit as completed
exports.completeHomeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;

    const homeVisit = await HomeVisit.findById(id);
    
    if (!homeVisit) {
      return res.status(404).json({ ok: false, message: 'Home visit not found' });
    }

    if (homeVisit.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized' });
    }

    if (homeVisit.status !== 'accepted') {
      return res.status(400).json({ ok: false, message: 'Can only complete accepted visits' });
    }

    homeVisit.status = 'completed';
    await homeVisit.save();

    const populated = await HomeVisit.findById(homeVisit._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    res.json({ ok: true, message: 'Home visit marked as completed', homeVisit: populated });
  } catch (err) {
    console.error('Error completing home visit:', err);
    res.status(500).json({ ok: false, message: 'Error completing home visit', error: err.message });
  }
};
