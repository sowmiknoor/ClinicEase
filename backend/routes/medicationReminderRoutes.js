// backend/routes/medicationReminderRoutes.js
const express = require('express');
const router = express.Router();
const MedicationReminder = require('../models/MedicationReminder');

// Create a new reminder
router.post('/add', async (req, res) => {
  try {
    const reminder = new MedicationReminder(req.body);
    await reminder.save();
    res.status(201).json({ message: 'Reminder added', reminder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reminders, optionally filter by patientId
router.get('/all', async (req, res) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    const reminders = await MedicationReminder.find(filter).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single reminder by ID
router.get('/:id', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ error: 'Not found' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a reminder by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await MedicationReminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate / Deactivate reminder
router.put('/:id/activate', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive boolean required' });
    const updated = await MedicationReminder.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Activation updated', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a reminder by ID
router.delete('/:id', async (req, res) => {
  try {
    const removed = await MedicationReminder.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
