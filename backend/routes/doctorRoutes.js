const express = require('express');
const router = express.Router();
const controller = require('../controllers/doctorController');
const { authMiddleware } = require('../controllers/authController');

// Public routes (accessible by patients and admins)
router.get('/all', controller.getAllDoctors);
router.get('/specialists', controller.getSpecialistCategories);
router.get('/specialist/:specialist', controller.getDoctorsBySpecialist);
router.get('/profile/:id', controller.getDoctorProfile);

// Protected routes (for doctors only)
router.put('/profile', authMiddleware, controller.updateDoctorProfile);
router.get('/my-patients', authMiddleware, controller.getDoctorPatients);

module.exports = router;
