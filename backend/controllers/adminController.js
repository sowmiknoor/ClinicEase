const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const LabTest = require('../models/LabTest');
const Message = require('../models/Message');
const Invoice = require('../models/Invoice');
const Prescription = require('../models/Prescription');
const HomeVisit = require('../models/HomeVisit');
const ForumPost = require('../models/ForumPost');
const HealthTip = require('../models/HealthTip');
const ResearchPaper = require('../models/ResearchPaper');

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
    let selectFields = '-password';
    
    // If fetching doctors, include all doctor-specific fields
    if (role === 'Doctor') {
      selectFields = '-password';
    }
    
    const users = await User.find({ role }).select(selectFields);
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching users', error: err.message });
  }
};

// Get doctors list (for patient to choose)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' }).select('name email phone specialist designation degrees experience consultationFee availableDays consultationHours bio photo');
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
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    
    const totalRecords = await MedicalRecord.countDocuments();
    const totalLabTests = await LabTest.countDocuments();
    const pendingLabTests = await LabTest.countDocuments({ status: 'ordered' });
    const completedLabTests = await LabTest.countDocuments({ status: 'completed' });
    
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ read: false });
    
    const totalInvoices = await Invoice.countDocuments();
    const unpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingRevenue = await Invoice.aggregate([
      { $match: { status: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalPrescriptions = await Prescription.countDocuments();
    const totalHomeVisits = await HomeVisit.countDocuments();
    const pendingHomeVisits = await HomeVisit.countDocuments({ status: 'pending' });
    
    const totalForumPosts = await ForumPost.countDocuments();
    const totalHealthTips = await HealthTip.countDocuments();
    const totalResearchPapers = await ResearchPaper.countDocuments();
    
    // Recent activity - last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: last24Hours } });
    const newAppointmentsToday = await Appointment.countDocuments({ createdAt: { $gte: last24Hours } });
    const newForumPostsToday = await ForumPost.countDocuments({ createdAt: { $gte: last24Hours } });

    const stats = {
      users: {
        totalPatients,
        totalDoctors,
        totalAdmins,
        total: totalPatients + totalDoctors + totalAdmins,
        activeUsers,
        newUsersToday
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        newToday: newAppointmentsToday
      },
      records: {
        total: totalRecords
      },
      labTests: {
        total: totalLabTests,
        pending: pendingLabTests,
        completed: completedLabTests
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages
      },
      financial: {
        totalInvoices,
        unpaidInvoices,
        paidInvoices,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0
      },
      services: {
        totalPrescriptions,
        totalHomeVisits,
        pendingHomeVisits
      },
      community: {
        totalForumPosts,
        totalHealthTips,
        totalResearchPapers,
        newPostsToday: newForumPostsToday
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

// Get active users in real-time
exports.getActiveUsers = async (req, res) => {
  try {
    // Users active in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsers = await User.find({ 
      lastActive: { $gte: fifteenMinutesAgo },
      isActive: true 
    }).select('name email role lastActive');
    
    res.json({ ok: true, activeUsers, count: activeUsers.length });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching active users', error: err.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');
    
    const recentPosts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name');
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email role createdAt');
    
    res.json({ 
      ok: true, 
      activities: {
        recentAppointments,
        recentPosts,
        recentUsers
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching activities', error: err.message });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
    
    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'weekly':
        groupBy = { $week: '$createdAt' };
        break;
      case 'monthly':
        groupBy = { $month: '$createdAt' };
        break;
      case 'yearly':
        groupBy = { $year: '$createdAt' };
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }
    
    const revenueByPeriod = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ ok: true, revenueByPeriod });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching revenue analytics', error: err.message });
  }
};

// Manage health tips (Admin can approve/reject)
exports.manageHealthTips = async (req, res) => {
  try {
    const { tipId } = req.params;
    const { isPublished } = req.body;
    
    const tip = await HealthTip.findByIdAndUpdate(
      tipId,
      { isPublished },
      { new: true }
    );
    
    res.json({ ok: true, message: 'Health tip updated', tip });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating health tip', error: err.message });
  }
};

// Manage research papers (Admin can approve/reject)
exports.manageResearchPapers = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { isPublished } = req.body;
    
    const paper = await ResearchPaper.findByIdAndUpdate(
      paperId,
      { isPublished },
      { new: true }
    );
    
    res.json({ ok: true, message: 'Research paper updated', paper });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating research paper', error: err.message });
  }
};

// Get all pending content for review
exports.getPendingContent = async (req, res) => {
  try {
    const pendingTips = await HealthTip.find({ isPublished: false })
      .populate('author', 'name email');
    const pendingPapers = await ResearchPaper.find({ isPublished: false })
      .populate('uploadedBy', 'name email');
    const pendingPosts = await ForumPost.find({ isHidden: true })
      .populate('author', 'name email');
    
    res.json({ 
      ok: true, 
      pendingContent: {
        healthTips: pendingTips,
        researchPapers: pendingPapers,
        forumPosts: pendingPosts
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching pending content', error: err.message });
  }
};
