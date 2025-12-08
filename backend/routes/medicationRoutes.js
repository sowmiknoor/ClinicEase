const express = require('express');
const medicationController = require('../controllers/medicationController');
const { authMiddleware } = require('../controllers/authController');

const router = express.Router();

// Middleware to verify authentication
router.use(authMiddleware);

// Add a new medication reminder
router.post('/add', medicationController.addMedication);

// Get all medications for the user
router.get('/', medicationController.getUserMedications);

// Get active medications
router.get('/active', medicationController.getActiveMedications);

// Get medication by ID
router.get('/:id', medicationController.getMedicationById);

// Update medication
router.put('/:id', medicationController.updateMedication);

// Mark medication as taken
router.post('/:id/taken', medicationController.markAsTaken);

// Mark medication as missed
router.post('/:id/missed', medicationController.markAsMissed);

// Get adherence report
router.get('/report/adherence', medicationController.getAdherenceReport);

// Deactivate medication
router.patch('/:id/deactivate', medicationController.deactivateMedication);

// Delete medication
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;
