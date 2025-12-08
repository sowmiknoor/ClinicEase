const Medication = require('../models/Medication');

// Add a new medication reminder
exports.addMedication = async (req, res) => {
  try {
    const {
      medicationName,
      dosage,
      frequency,
      reminderTimes,
      startDate,
      endDate,
      prescribedBy,
      reason,
      sideEffects,
      notes
    } = req.body;

    if (!medicationName || !dosage || !frequency || !reminderTimes || !startDate) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: medicationName, dosage, frequency, reminderTimes, startDate'
      });
    }

    const medication = new Medication({
      userId: req.userId,
      medicationName,
      dosage,
      frequency,
      reminderTimes,
      startDate,
      endDate,
      prescribedBy,
      reason,
      sideEffects,
      notes
    });

    const saved = await medication.save();
    res.status(201).json({ ok: true, medication: saved });
  } catch (err) {
    console.error('Error adding medication:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get all medications for a user
exports.getUserMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.userId }).sort({
      createdAt: -1
    });
    res.json({ ok: true, medications });
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get active medications for a user
exports.getActiveMedications = async (req, res) => {
  try {
    const medications = await Medication.find({
      userId: req.userId,
      isActive: true
    }).sort({ createdAt: -1 });
    res.json({ ok: true, medications });
  } catch (err) {
    console.error('Error fetching active medications:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get medication by ID
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }
    res.json({ ok: true, medication });
  } catch (err) {
    console.error('Error fetching medication:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }

    // Update fields
    Object.assign(medication, req.body);
    const updated = await medication.save();
    res.json({ ok: true, medication: updated });
  } catch (err) {
    console.error('Error updating medication:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Mark medication as taken
exports.markAsTaken = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }

    const { takenTime } = req.body;
    const today = new Date().toISOString().split('T')[0];

    medication.takenDates.push({
      date: new Date(today),
      takenTime: takenTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'taken'
    });

    const updated = await medication.save();
    res.json({ ok: true, medication: updated, message: 'Marked as taken' });
  } catch (err) {
    console.error('Error marking medication as taken:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Mark medication as missed
exports.markAsMissed = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }

    const { missedTime } = req.body;
    const today = new Date().toISOString().split('T')[0];

    medication.takenDates.push({
      date: new Date(today),
      takenTime: missedTime || 'Not recorded',
      status: 'missed'
    });

    const updated = await medication.save();
    res.json({ ok: true, medication: updated, message: 'Marked as missed' });
  } catch (err) {
    console.error('Error marking medication as missed:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Get medication adherence report
exports.getAdherenceReport = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.userId });

    const report = medications.map(med => {
      const total = med.takenDates.length;
      const taken = med.takenDates.filter(d => d.status === 'taken').length;
      const missed = med.takenDates.filter(d => d.status === 'missed').length;
      const skipped = med.takenDates.filter(d => d.status === 'skipped').length;

      const adherenceRate = total > 0 ? ((taken / total) * 100).toFixed(2) : 0;

      return {
        medicationId: med._id,
        medicationName: med.medicationName,
        dosage: med.dosage,
        totalRecords: total,
        taken,
        missed,
        skipped,
        adherenceRate: `${adherenceRate}%`
      };
    });

    res.json({ ok: true, report });
  } catch (err) {
    console.error('Error generating adherence report:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Delete medication
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }

    await Medication.deleteOne({ _id: req.params.id });
    res.json({ ok: true, message: 'Medication deleted successfully' });
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Deactivate medication
exports.deactivateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ ok: false, error: 'Medication not found' });
    }
    if (medication.userId.toString() !== req.userId) {
      return res.status(403).json({ ok: false, error: 'Unauthorized' });
    }

    medication.isActive = false;
    const updated = await medication.save();
    res.json({ ok: true, medication: updated, message: 'Medication deactivated' });
  } catch (err) {
    console.error('Error deactivating medication:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
