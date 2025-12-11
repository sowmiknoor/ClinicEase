const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const LabTest = require('../models/LabTest');
const Message = require('../models/Message');

// Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching users', error: err.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching users', error: err.message });
  }
};

// Get doctors list (for patient to choose)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email phone');
    res.json({ ok: true, doctors });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching doctors', error: err.message });
  }
};

// Get system statistics (Admin)
exports.getSystemStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalRecords = await MedicalRecord.countDocuments();
    const totalLabTests = await LabTest.countDocuments();
    const pendingLabTests = await LabTest.countDocuments({ status: 'ordered' });
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ read: false });

    const stats = {
      users: {
        totalPatients,
        totalDoctors,
        total: totalPatients + totalDoctors
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments
      },
      records: {
        total: totalRecords
      },
      labTests: {
        total: totalLabTests,
        pending: pendingLabTests
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages
      }
    };

    res.json({ ok: true, stats });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching statistics', error: err.message });
  }
};

// Update user status (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');
    
    res.json({ ok: true, message: 'User status updated', user });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating user', error: err.message });
  }
};

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error deleting user', error: err.message });
  }
};
