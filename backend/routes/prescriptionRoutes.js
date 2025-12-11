const express = require('express');
const router = express.Router();
const { authMiddleware, requireRoles } = require('../controllers/authController');
const controller = require('../controllers/prescriptionController');

router.use(authMiddleware);

// Create prescription (doctors only)
router.post('/', requireRoles(['Doctor','Admin']), controller.create);

// Get all prescriptions (filtered by role)
router.get('/', requireRoles(['Doctor','Admin','Patient']), controller.list);

// Get specific prescription by ID
router.get('/:id', requireRoles(['Doctor','Admin','Patient']), controller.getById);

// Get prescriptions for a specific patient
router.get('/patient/:patientId', requireRoles(['Doctor','Admin']), controller.getPatientPrescriptions);

// Get prescriptions by a specific doctor
router.get('/doctor/:doctorId', requireRoles(['Doctor','Admin']), controller.getDoctorPrescriptions);

// Update prescription status
router.patch('/:id/status', requireRoles(['Doctor','Admin']), controller.updateStatus);

module.exports = router;
