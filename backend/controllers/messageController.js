const Message = require('../models/Message');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// Get available recipients based on user role
exports.getAvailableRecipients = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    let recipients = [];

    if (userRole === 'Patient') {
      // Patients can message all doctors
      recipients = await User.find({ role: 'Doctor' }).select('name email role');
    } else if (userRole === 'Doctor') {
      // Doctors can only message their existing patients
      // Find patients from medical records and prescriptions
      const medicalRecords = await MedicalRecord.find({ doctorId: userId }).distinct('patientId');
      const prescriptions = await Prescription.find({ doctorId: userId }).distinct('patientId');
      
      // Combine and get unique patient IDs
      const patientIds = [...new Set([...medicalRecords.map(id => id.toString()), ...prescriptions.map(id => id.toString())])];
      
      recipients = await User.find({ 
        _id: { $in: patientIds },
        role: 'Patient'
      }).select('name email role');
    } else if (userRole === 'Admin') {
      // Admin can message all patients and doctors
      recipients = await User.find({ 
        role: { $in: ['Patient', 'Doctor'] }
      }).select('name email role');
    }

    console.log('Available recipients for', userRole, ':', recipients.length);
    res.json({ ok: true, recipients });
  } catch (err) {
    console.error('Error fetching recipients:', err);
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.send = async (req, res) => {
  try {
    const { toUser, content } = req.body;
    const fromUserId = req.user._id;
    const userRole = req.user.role;

    if (!toUser) return res.json({ ok: false, msg: 'toUser required' });
    if (!content) return res.json({ ok: false, msg: 'content required' });

    // Verify recipient exists
    const recipient = await User.findById(toUser);
    if (!recipient) {
      return res.status(404).json({ ok: false, msg: 'Recipient not found' });
    }

    // Role-based access control
    if (userRole === 'Doctor') {
      // Verify this patient is associated with this doctor
      const hasRelationship = await MedicalRecord.exists({ 
        doctorId: fromUserId, 
        patientId: toUser 
      }) || await Prescription.exists({ 
        doctorId: fromUserId, 
        patientId: toUser 
      });

      if (!hasRelationship) {
        return res.status(403).json({ 
          ok: false, 
          msg: 'You can only message your existing patients' 
        });
      }
    } else if (userRole === 'Patient') {
      // Patients can only message doctors
      if (recipient.role !== 'Doctor') {
        return res.status(403).json({ 
          ok: false, 
          msg: 'Patients can only message doctors' 
        });
      }
    }
    // Admin has no restrictions

    const msg = await Message.create({ fromUser: fromUserId, toUser, content });
    const populated = await Message.findById(msg._id)
      .populate('fromUser', 'name email role')
      .populate('toUser', 'name email role');

    console.log('Message sent from', userRole, 'to', recipient.role);
    res.json({ ok: true, message: populated });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.inbox = async (req, res) => {
  try {
    const uid = req.user._id;
    const messages = await Message.find({ 
      $or: [ { toUser: uid }, { fromUser: uid } ] 
    })
    .populate('fromUser', 'name email role')
    .populate('toUser', 'name email role')
    .sort('-createdAt');
    
    console.log('Inbox fetched for user:', uid, 'Messages:', messages.length);
    res.json({ ok: true, messages });
  } catch (err) {
    console.error('Error fetching inbox:', err);
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user._id;
    const updated = await Message.findOneAndUpdate({ _id: id, toUser: uid }, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, message: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
