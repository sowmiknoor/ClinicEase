const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUsersByRole,
  getDoctors,
  getSystemStats,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminController');

// Get users
router.get('/users/all', getAllUsers);
router.get('/users/role/:role', getUsersByRole);
router.get('/doctors', getDoctors);

// System stats
router.get('/stats', getSystemStats);

// User management
router.put('/users/status/:userId', updateUserStatus);
router.delete('/users/delete/:userId', deleteUser);

module.exports = router;
