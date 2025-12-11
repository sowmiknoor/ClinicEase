const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const User = require('../models/User');

// Doctor: Request lab test for patient
const requestLabTest = async (req, res) => {
  try {
    const { patientId, testType, category, urgency, notes, labName, labLocation } = req.body;
    const doctorId = req.body.doctorId;

    const labTest = new LabTest({
      patientId,
      doctorId,
      testType,
      category,
      urgency,
      notes,
      labName,
      labLocation,
      status: 'ordered'
    });

    await labTest.save();
    res.json({ ok: true, message: 'Lab test requested successfully', labTest });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error requesting lab test', error: err.message });
  }
};

// Patient: Get their lab tests
const getPatientLabTests = async (req, res) => {
  try {
    const { patientId } = req.params;
    const labTests = await LabTest.find({ patientId })
      .populate('doctorId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, labTests });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching lab tests', error: err.message });
  }
};

// Doctor: Get lab tests they requested
const getDoctorLabTests = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const labTests = await LabTest.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, labTests });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching lab tests', error: err.message });
  }
};

// Admin: Get all lab tests
const getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, labTests });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching lab tests', error: err.message });
  }
};

// Update lab test status
const updateLabTestStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const { status, resultUrl, testResults, completedDate } = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      testId,
      { status, resultUrl, testResults, completedDate },
      { new: true }
    );
    
    res.json({ ok: true, message: 'Lab test updated', labTest });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating lab test', error: err.message });
  }
};

// Doctor routes
router.post('/request', requestLabTest);
router.get('/doctor/:doctorId', getDoctorLabTests);

// Patient routes
router.get('/patient/:patientId', getPatientLabTests);

// Admin routes
router.get('/all', getAllLabTests);

// Update status
router.put('/update/:testId', updateLabTestStatus);

module.exports = router;
