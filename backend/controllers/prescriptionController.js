const Prescription = require('../models/Prescription');
const User = require('../models/User');

const scopeFilter = (user) => {
  if (!user) return {};
  // Patients see prescriptions prescribed TO them (they are the receiver)
  if (user.role === 'Patient') return { patientId: user._id };
  // Doctors see prescriptions created BY them (they are the creator)
  if (user.role === 'Doctor') return { doctorId: user._id };
  // Admin can see all prescriptions
  return {};
};

exports.create = async (req, res) => {
  try {
    const { patientId, medications = [], notes, diagnosis, validUntil } = req.body;
    const doctorId = req.user?._id;
    
    console.log('Creating prescription - Doctor:', doctorId, 'Patient:', patientId);
    
    // Only doctors can create prescriptions
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
      return res.status(403).json({ ok: false, msg: 'Only doctors can create prescriptions' });
    }
    
    if (!patientId) {
      return res.status(400).json({ ok: false, msg: 'Patient ID is required' });
    }
    
    if (!medications || medications.length === 0) {
      return res.status(400).json({ ok: false, msg: 'At least one medication is required' });
    }
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'Patient') {
      return res.status(404).json({ ok: false, msg: 'Patient not found' });
    }
    
    const prescription = await Prescription.create({ 
      patientId, 
      doctorId, 
      medications, 
      notes, 
      diagnosis,
      validUntil 
    });
    
    console.log('Prescription created:', prescription._id, 'for patient:', prescription.patientId);
    
    const populated = await Prescription.findById(prescription._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');
    
    res.json({ ok: true, prescription: populated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    console.log('List prescriptions - User:', req.user._id, 'Role:', req.user.role);
    const filter = scopeFilter(req.user);
    console.log('Filter applied:', filter);
    
    // Doctor/Admin can filter by specific patient if needed
    if (req.query.patientId && req.user.role !== 'Patient') {
      filter.patientId = req.query.patientId;
    }
    
    // Patients get prescriptions where THEY are the receiver (patientId)
    // Doctors get prescriptions where THEY are the creator (doctorId)
    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort('-createdAt');
    
    console.log('Found prescriptions:', prescriptions.length);
    
    res.json({ ok: true, prescriptions });
  } catch (err) {
    console.error('Error listing prescriptions:', err);
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...scopeFilter(req.user) };
    
    const prescription = await Prescription.findOne(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');
    
    if (!prescription) {
      return res.status(404).json({ ok: false, msg: 'Prescription not found' });
    }
    
    res.json({ ok: true, prescription });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const filter = { _id: id };
    
    // Only doctors can update their own prescriptions, admins can update any
    if (req.user.role === 'Doctor') {
      filter.doctorId = req.user._id;
    } else if (req.user.role === 'Patient') {
      return res.status(403).json({ ok: false, msg: 'Patients cannot update prescriptions' });
    }
    
    const updated = await Prescription.findOneAndUpdate(filter, { status }, { new: true })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');
    
    if (!updated) {
      return res.status(404).json({ ok: false, msg: 'Prescription not found or unauthorized' });
    }
    
    res.json({ ok: true, prescription: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({ patientId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort('-createdAt');
    
    res.json({ ok: true, prescriptions });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone')
      .sort('-createdAt');
    
    res.json({ ok: true, prescriptions });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};
