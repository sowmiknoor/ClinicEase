const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,  // plain text (unsafe, but as you requested)
    role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], default: 'Patient' },
    darkMode: { type: Boolean, default: false },
    
    // Doctor-specific fields
    designation: String,  // e.g., "Senior Consultant", "Chief Physician"
    degrees: [String],    // e.g., ["MBBS", "MD", "FRCS"]
    specialist: {
      type: String,
      enum: [
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
      ]
    },
    photo: String,        // URL or base64 image data
    bio: String,          // Brief description/biography
    experience: Number,   // Years of experience
    consultationFee: Number,
    availableDays: [String], // e.g., ["Monday", "Wednesday", "Friday"]
    consultationHours: String // e.g., "9:00 AM - 5:00 PM"
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
