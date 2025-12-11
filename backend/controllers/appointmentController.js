const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Patient: Request teleconsultation or home visit
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, type, appointmentDate, appointmentTime, symptoms, address, notes } = req.body;
    const patientId = req.body.patientId;

    const appointment = new Appointment({
      patientId,
      doctorId,
      type,
      appointmentDate,
      appointmentTime,
      symptoms,
      address,
      notes
    });

    await appointment.save();
    res.json({ ok: true, message: 'Appointment request sent successfully', appointment });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error creating appointment', error: err.message });
  }
};

// Get appointments for patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name email phone')
      .sort({ appointmentDate: -1 });
    
    res.json({ ok: true, appointments });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching appointments', error: err.message });
  }
};

// Get appointments for doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: -1 });
    
    res.json({ ok: true, appointments });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching appointments', error: err.message });
  }
};

// Doctor: Accept or reject appointment
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, rejectionReason, completionNotes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status, rejectionReason, completionNotes },
      { new: true }
    ).populate('patientId', 'name email phone');

    res.json({ ok: true, message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error updating appointment', error: err.message });
  }
};

// Get all appointments (Admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone role')
      .populate('doctorId', 'name email phone role')
      .sort({ createdAt: -1 });
    
    res.json({ ok: true, appointments });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error fetching appointments', error: err.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled' },
      { new: true }
    );
    
    res.json({ ok: true, message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Error cancelling appointment', error: err.message });
  }
};
