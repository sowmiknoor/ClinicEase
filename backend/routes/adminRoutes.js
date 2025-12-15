const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUsersByRole,
  getDoctors,
  getSystemStats,
  updateUserStatus,
  deleteUser,
  getActiveUsers,
  getRecentActivities,
  getRevenueAnalytics,
  manageHealthTips,
  manageResearchPapers,
  getPendingContent
} = require('../controllers/adminController');

// Get users
router.get('/users/all', getAllUsers);
router.get('/users/role/:role', getUsersByRole);
router.get('/doctors', getDoctors);
router.get('/users/active', getActiveUsers);

// System stats
router.get('/stats', getSystemStats);
router.get('/activities', getRecentActivities);
router.get('/revenue-analytics', getRevenueAnalytics);

// User management
router.put('/users/status/:userId', updateUserStatus);
router.delete('/users/delete/:userId', deleteUser);

// Content management
router.get('/pending-content', getPendingContent);
router.put('/health-tips/:tipId/publish', manageHealthTips);
router.put('/research-papers/:paperId/publish', manageResearchPapers);

module.exports = router;
