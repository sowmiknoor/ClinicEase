const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getPatientRecords,
  getDoctorRecords,
  getPatientRecordsByDoctor,
  getAllRecords,
  updateMedicalRecord
} = require('../controllers/medicalRecordController');
const { authMiddleware } = require('../controllers/authController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Doctor routes
router.post('/create', createMedicalRecord);
router.get('/doctor/:doctorId', getDoctorRecords);
router.get('/patient-history/:patientId', getPatientRecordsByDoctor);
router.put('/update/:recordId', updateMedicalRecord);

// Patient routes
router.get('/patient/:patientId', getPatientRecords);

// Admin routes
router.get('/all', getAllRecords);

module.exports = router;
