const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');

// Add medication
const addMedication = async (req, res) => {
  try {
    const { userId, medicationName, dosage, frequency, reminderTimes, startDate, endDate, prescribedBy, reason, notes } = req.body;

    const medication = new Medication({
      userId,
      medicationName,
      dosage,
      frequency,
      reminderTimes,
      startDate,
      endDate,
      prescribedBy,
      reason,
      notes,
      isActive: true
    });

    await medication.save();
    res.json({ ok: true, message: 'Medication added successfully', medication });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error adding medication', error: err.message });
  }
};

// Get patient medications
const getPatientMedications = async (req, res) => {
  try {
    const { userId } = req.params;
    const medications = await Medication.find({ userId })
      .sort({ startDate: -1 });
    
    res.json({ ok: true, medications });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching medications', error: err.message });
  }
};

// Get active medications
const getActiveMedications = async (req, res) => {
  try {
    const { userId } = req.params;
    const medications = await Medication.find({ userId, isActive: true })
      .sort({ startDate: -1 });
    
    res.json({ ok: true, medications });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching active medications', error: err.message });
  }
};

// Update medication
const updateMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const updates = req.body;

    const medication = await Medication.findByIdAndUpdate(
      medicationId,
      updates,
      { new: true }
    );
    
    res.json({ ok: true, message: 'Medication updated', medication });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating medication', error: err.message });
  }
};

// Delete medication
const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    await Medication.findByIdAndDelete(medicationId);
    
    res.json({ ok: true, message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error deleting medication', error: err.message });
  }
};

// Record medication taken
const recordMedicationTaken = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { date, takenTime, status } = req.body;

    const medication = await Medication.findById(medicationId);
    medication.takenDates.push({ date, takenTime, status });
    await medication.save();
    
    res.json({ ok: true, message: 'Medication recorded', medication });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error recording medication', error: err.message });
  }
};

// Add medication
router.post('/add', addMedication);

// Get medications
router.get('/patient/:userId', getPatientMedications);
router.get('/active/:userId', getActiveMedications);

// Update medication
router.put('/update/:medicationId', updateMedication);

// Delete medication
router.delete('/delete/:medicationId', deleteMedication);

// Record taken
router.post('/record/:medicationId', recordMedicationTaken);

module.exports = router;
