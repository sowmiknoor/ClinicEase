const User = require('../models/User');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor' })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`Fetched ${doctors.length} doctors`);
    res.json({ ok: true, doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ ok: false, msg: 'Failed to fetch doctors' });
  }
};

// Get doctors by specialist
exports.getDoctorsBySpecialist = async (req, res) => {
  try {
    const { specialist } = req.params;
    const doctors = await User.find({ role: 'Doctor', specialist })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`Fetched ${doctors.length} doctors for specialist: ${specialist}`);
    res.json({ ok: true, doctors });
  } catch (err) {
    console.error('Error fetching doctors by specialist:', err);
    res.status(500).json({ ok: false, msg: 'Failed to fetch doctors' });
  }
};

// Get single doctor profile
exports.getDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findById(id).select('-password');
    
    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ ok: false, msg: 'Doctor not found' });
    }
    
    console.log(`Fetched doctor profile: ${doctor.name}`);
    res.json({ ok: true, doctor });
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    res.status(500).json({ ok: false, msg: 'Failed to fetch doctor profile' });
  }
};

// Update doctor profile (for doctors to update their own profile)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { designation, degrees, specialist, photo, bio, experience, consultationFee, availableDays, consultationHours, phone } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'Doctor') {
      return res.status(403).json({ ok: false, msg: 'Only doctors can update doctor profiles' });
    }
    
    // Update fields
    if (designation !== undefined) user.designation = designation;
    if (degrees !== undefined) user.degrees = degrees;
    if (specialist !== undefined) user.specialist = specialist;
    if (photo !== undefined) user.photo = photo;
    if (bio !== undefined) user.bio = bio;
    if (experience !== undefined) user.experience = experience;
    if (consultationFee !== undefined) user.consultationFee = consultationFee;
    if (availableDays !== undefined) user.availableDays = availableDays;
    if (consultationHours !== undefined) user.consultationHours = consultationHours;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    console.log(`Doctor profile updated: ${user.name}`);
    res.json({ ok: true, msg: 'Profile updated successfully', doctor: user });
  } catch (err) {
    console.error('Error updating doctor profile:', err);
    res.status(500).json({ ok: false, msg: 'Failed to update profile' });
  }
};

// Get all specialist categories
exports.getSpecialistCategories = async (req, res) => {
  try {
    const specialists = [
      'General Physician',
      'Cardiologist',
      'Dermatologist',
      'Neurologist',
      'Orthopedic',
      'Pediatrician',
      'Psychiatrist',
      'Gynecologist',
      'ENT Specialist',
      'Ophthalmologist',
      'Dentist',
      'Pulmonologist',
      'Gastroenterologist',
      'Urologist',
      'Oncologist',
      'Endocrinologist',
      'Nephrologist',
      'Rheumatologist',
      'Radiologist',
      'Anesthesiologist'
    ];
    
    res.json({ ok: true, specialists });
  } catch (err) {
    console.error('Error fetching specialists:', err);
    res.status(500).json({ ok: false, msg: 'Failed to fetch specialists' });
  }
};
