const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Record = require('../models/Record');
const LabTest = require('../models/LabTest');
const Notification = require('../models/Notification');

// Doctor: Create medical record for patient
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, medications, labTestsRecommended, followUpDate, notes, appointmentId } = req.body;
    const doctorId = req.body.doctorId;

    console.log('Creating medical record - Doctor:', doctorId, 'Patient:', patientId);

    // Create the medical record
    const record = new MedicalRecord({
      patientId,
      doctorId,
      diagnosis,
      prescription,
      medications,
      labTestsRecommended,
      followUpDate,
      notes,
      appointmentId
    });

    await record.save();
    console.log('Medical record created:', record._id);

    // Create a comprehensive description for the Record
    let recordDescription = `MEDICAL REPORT\n====================\n\n`;
    recordDescription += `Diagnosis: ${diagnosis}\n\n`;
    
    if (prescription) {
      recordDescription += `Prescription: ${prescription}\n\n`;
    }
    
    if (medications && medications.length > 0) {
      recordDescription += `Medications:\n`;
      medications.forEach((med, index) => {
        recordDescription += `${index + 1}. ${med.name} - ${med.dosage}\n`;
        if (med.frequency) recordDescription += `   Frequency: ${med.frequency}\n`;
        if (med.duration) recordDescription += `   Duration: ${med.duration}\n`;
      });
      recordDescription += `\n`;
    }
    
    if (labTestsRecommended && labTestsRecommended.length > 0) {
      recordDescription += `Recommended Lab Tests:\n${labTestsRecommended.map((test, i) => `${i + 1}. ${test}`).join('\n')}\n\n`;
    }
    
    if (followUpDate) {
      recordDescription += `Follow-up Date: ${new Date(followUpDate).toLocaleDateString()}\n\n`;
    }
    
    if (notes) {
      recordDescription += `Additional Notes: ${notes}\n`;
    }
    
    recordDescription += `\nIssued by Doctor ID: ${doctorId}\nDate: ${new Date().toLocaleString()}`;

    // Also save to Record collection so it appears in patient's Medical Records page
    const simpleRecord = await Record.create({
      patientId,
      doctorId,
      title: `Medical Report - ${diagnosis}`,
      description: recordDescription,
      attachmentUrl: ''
    });
    console.log('Simple record created:', simpleRecord._id);

    // If medications are provided, also create a prescription entry
    if (medications && medications.length > 0) {
      const validMedications = medications.filter(m => m.name && m.dosage && m.frequency);
      
      if (validMedications.length > 0) {
        const prescriptionEntry = new Prescription({
          patientId,
          doctorId,
          diagnosis,
          medications: validMedications,
          notes: notes || prescription || '',
          status: 'active',
          validUntil: followUpDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

        await prescriptionEntry.save();
        console.log('Prescription created:', prescriptionEntry._id, 'for patient:', patientId);
      }
    }

    // If lab tests are recommended, create LabTest documents
    if (labTestsRecommended && labTestsRecommended.length > 0) {
      const validLabTests = labTestsRecommended.filter(test => test && test.trim());
      
      if (validLabTests.length > 0) {
        // Generate batch order ID for grouped tests
        const batchOrderId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create lab test documents
        const labTestPromises = validLabTests.map(testType => 
          LabTest.create({
            patientId,
            doctorId,
            testType,
            category: 'General', // Default category
            status: 'ordered',
            batchOrderId,
            notes: `Recommended by Dr. ${doctorId} - ${diagnosis}`
          })
        );

        await Promise.all(labTestPromises);
        console.log(`Created ${validLabTests.length} lab test(s) for patient:`, patientId);

        // Send notification to patient about lab tests
        const notification = new Notification({
          userId: patientId,
          title: `🔬 New Lab Tests Recommended (${validLabTests.length} ${validLabTests.length === 1 ? 'Test' : 'Tests'})`,
          body: `Dr. has recommended ${validLabTests.length} lab test(s) for you. Please check your Lab Tests page for details.`,
          category: 'lab-test'
        });
        await notification.save();
      }
    }

    res.json({ ok: true, message: 'Medical record and prescription created successfully', record });
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({ ok: false, message: 'Error creating medical record', error: err.message });
  }
};

// Patient: Get their medical records
exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, records });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching records', error: err.message });
  }
};

// Doctor: Get records they created
exports.getDoctorRecords = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const records = await MedicalRecord.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, records });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching records', error: err.message });
  }
};

// Doctor: Get specific patient's records
exports.getPatientRecordsByDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, records });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching patient records', error: err.message });
  }
};

// Admin: Get all medical records
exports.getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, records });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching records', error: err.message });
  }
};

// Update medical record
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updates = req.body;

    const record = await MedicalRecord.findByIdAndUpdate(
      recordId,
      updates,
      { new: true }
    );
    
    res.json({ ok: true, message: 'Medical record updated', record });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating record', error: err.message });
  }
};
