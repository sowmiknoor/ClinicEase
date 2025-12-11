const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  cancelAppointment
} = require('../controllers/appointmentController');

// Patient routes
router.post('/create', createAppointment);
router.get('/patient/:patientId', getPatientAppointments);
router.put('/cancel/:appointmentId', cancelAppointment);

// Doctor routes
router.get('/doctor/:doctorId', getDoctorAppointments);
router.put('/update-status/:appointmentId', updateAppointmentStatus);

// Admin routes
router.get('/all', getAllAppointments);

module.exports = router;
