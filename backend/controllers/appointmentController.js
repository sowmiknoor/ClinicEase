const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
    
    // Get patient and doctor details
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);
    
    // Notify doctor about new appointment request
    if (doctor) {
      await Notification.create({
        userId: doctorId,
        title: `📅 New Appointment Request`,
        body: `${patient?.name || 'A patient'} has requested an appointment with you on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.`,
        category: 'general'
      });
    }
    
    // Notify patient about request submission
    if (patient) {
      await Notification.create({
        userId: patientId,
        title: '✅ Appointment Request Sent',
        body: `Your appointment request with Dr. ${doctor?.name || 'the doctor'} has been sent. You'll be notified once the doctor responds.`,
        category: 'general'
      });
    }
    
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
    ).populate('patientId', 'name email phone')
     .populate('doctorId', 'name email phone');

    // Send notification to patient based on status
    if (appointment && appointment.patientId) {
      if (status === 'accepted') {
        await Notification.create({
          userId: appointment.patientId._id,
          title: '✅ Appointment Accepted',
          body: `Dr. ${appointment.doctorId?.name || 'Your doctor'} has accepted your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}. You are now registered as their patient.`,
          category: 'general'
        });
      } else if (status === 'rejected') {
        await Notification.create({
          userId: appointment.patientId._id,
          title: '❌ Appointment Declined',
          body: `Dr. ${appointment.doctorId?.name || 'Your doctor'} has declined your appointment. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
          category: 'general'
        });
      } else if (status === 'completed') {
        await Notification.create({
          userId: appointment.patientId._id,
          title: '✅ Appointment Completed',
          body: `Your appointment with Dr. ${appointment.doctorId?.name || 'your doctor'} has been completed. ${completionNotes || ''}`,
          category: 'general'
        });
      }
    }

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
