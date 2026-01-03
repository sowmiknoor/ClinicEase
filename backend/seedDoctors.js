const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-ease';

// Comprehensive list of medical specializations
const specializations = [
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

// Doctor designations
const designations = [
  'Senior Consultant',
  'Chief Physician',
  'Associate Professor',
  'Professor',
  'Consultant',
  'Specialist',
  'Head of Department',
  'Medical Director'
];

// Common medical degrees by specialization
const degreesBySpecialization = {
  'General Physician': ['MBBS', 'MD (Internal Medicine)'],
  'Cardiologist': ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)'],
  'Dermatologist': ['MBBS', 'MD (Dermatology)', 'DDV'],
  'Neurologist': ['MBBS', 'MD (Neurology)', 'DM (Neurology)'],
  'Orthopedic': ['MBBS', 'MS (Orthopedics)', 'DNB (Orthopedics)'],
  'Pediatrician': ['MBBS', 'MD (Pediatrics)', 'DCH'],
  'Psychiatrist': ['MBBS', 'MD (Psychiatry)', 'DPM'],
  'Gynecologist': ['MBBS', 'MD (Gynecology)', 'DGO'],
  'ENT Specialist': ['MBBS', 'MS (ENT)', 'DNB (ENT)'],
  'Ophthalmologist': ['MBBS', 'MS (Ophthalmology)', 'DO'],
  'Dentist': ['BDS', 'MDS', 'FCPS (Dental Surgery)'],
  'Pulmonologist': ['MBBS', 'MD (Pulmonology)', 'DTCD'],
  'Gastroenterologist': ['MBBS', 'MD (Gastroenterology)', 'DM (Gastroenterology)'],
  'Urologist': ['MBBS', 'MS (Urology)', 'MCh (Urology)'],
  'Oncologist': ['MBBS', 'MD (Oncology)', 'DM (Oncology)'],
  'Endocrinologist': ['MBBS', 'MD (Endocrinology)', 'DM (Endocrinology)'],
  'Nephrologist': ['MBBS', 'MD (Nephrology)', 'DM (Nephrology)'],
  'Rheumatologist': ['MBBS', 'MD (Rheumatology)', 'DM (Rheumatology)'],
  'Radiologist': ['MBBS', 'MD (Radiology)', 'DMRD'],
  'Anesthesiologist': ['MBBS', 'MD (Anesthesiology)', 'DA']
};

// Bangladeshi first and last names
const firstNames = [
  'Kamal', 'Rahman', 'Salim', 'Nasrin', 'Farhana', 'Mahmud', 'Sultana', 'Habib',
  'Ayesha', 'Rashid', 'Fatima', 'Imran', 'Nusrat', 'Jahangir', 'Roksana', 'Abdul',
  'Taslima', 'Rahim', 'Shahin', 'Masud', 'Jasmin', 'Monir', 'Dilara', 'Aziz',
  'Shireen', 'Kamrul', 'Rehana', 'Saiful', 'Nazneen', 'Mizanur', 'Shamima', 'Rafiq',
  'Khaleda', 'Morshed', 'Anjuman', 'Delwar', 'Sabina', 'Alamgir', 'Parveen', 'Shamsul',
  'Rowshan', 'Iqbal', 'Shahana', 'Mostafa', 'Laila', 'Zahedul', 'Nasima', 'Shahed',
  'Farida', 'Mahbub', 'Selina', 'Golam', 'Amina', 'Khondkar', 'Rabeya', 'Nurul',
  'Hosne', 'Siddique', 'Shahida', 'Khaled', 'Maksuda', 'Lokman', 'Razia', 'Atiqur',
  'Shamim', 'Ashraf', 'Rokeya', 'Shahadat', 'Mumtaz', 'Anwar', 'Jesmin', 'Zakir',
  'Sharmin', 'Manjur', 'Halima', 'Badrul', 'Syeda', 'Shafiq', 'Parvin', 'Monirul'
];

const lastNames = [
  'Ahmed', 'Hossain', 'Rahman', 'Khan', 'Ali', 'Islam', 'Akter', 'Begum',
  'Chowdhury', 'Hassan', 'Sultana', 'Uddin', 'Khatun', 'Haque', 'Miah', 'Roy',
  'Talukder', 'Saha', 'Das', 'Bhuiyan', 'Sarkar', 'Mondal', 'Paul', 'Biswas',
  'Barua', 'Sikder', 'Podder', 'Mazumder', 'Kundu', 'Ghosh', 'Dey', 'Sen',
  'Chakraborty', 'Nath', 'Sharma', 'Amin', 'Azad', 'Kabir', 'Karim', 'Malik'
];

// Days of week
const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Consultation hours options
const consultationHours = [
  '9:00 AM - 2:00 PM',
  '3:00 PM - 8:00 PM',
  '9:00 AM - 5:00 PM',
  '10:00 AM - 6:00 PM',
  '2:00 PM - 9:00 PM',
  '8:00 AM - 1:00 PM'
];

// Generate random items from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate doctor bio
function generateBio(name, specialization, experience) {
  const bios = [
    `Dr. ${name} is a highly experienced ${specialization} with ${experience} years of practice. Committed to providing exceptional patient care and staying updated with the latest medical advancements.`,
    `With ${experience} years of expertise in ${specialization.toLowerCase()}, Dr. ${name} has helped thousands of patients achieve better health outcomes. Known for compassionate care and evidence-based treatment.`,
    `Dr. ${name} specializes in ${specialization.toLowerCase()} and has been practicing for ${experience} years. Dedicated to patient-centered care and continuous professional development.`,
    `An accomplished ${specialization} with ${experience} years of clinical experience, Dr. ${name} is known for precise diagnosis and effective treatment plans.`,
    `Dr. ${name} brings ${experience} years of expertise in ${specialization.toLowerCase()} to every patient interaction. Passionate about preventive care and holistic treatment approaches.`
  ];
  return randomItem(bios);
}

// Generate 100 doctors
function generateDoctors() {
  const doctors = [];
  
  for (let i = 1; i <= 100; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const fullName = `Dr. ${firstName} ${lastName}`;
    const specialization = randomItem(specializations);
    const designation = randomItem(designations);
    const degrees = degreesBySpecialization[specialization] || ['MBBS', 'MD'];
    const experience = Math.floor(Math.random() * 25) + 5; // 5-30 years
    const consultationFee = 0; // Doctors will set their own fees
    const availableDays = randomItems(allDays, Math.floor(Math.random() * 4) + 3); // 3-6 days
    const hours = randomItem(consultationHours);
    
    doctors.push({
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@clinicease.com`,
      phone: `+880-1${Math.floor(Math.random() * 900000000) + 100000000}`,
      password: 'doctor123', // Default password
      role: 'Doctor',
      designation: designation,
      degrees: degrees,
      specialist: specialization,
      bio: generateBio(fullName, specialization, experience),
      experience: experience,
      consultationFee: consultationFee,
      availableDays: availableDays,
      consultationHours: hours,
      darkMode: false
    });
  }
  
  return doctors;
}

async function seedDoctors() {
  try {
    await mongoose.connect(MONGO);
    console.log('MongoDB connected for seeding doctors...');

    // Remove existing doctors (optional - comment out if you want to keep existing)
    const deleteResult = await User.deleteMany({ role: 'Doctor' });
    console.log(`Removed ${deleteResult.deletedCount} existing doctors`);

    // Generate and insert 100 doctors
    const doctors = generateDoctors();
    const insertedDoctors = await User.insertMany(doctors);
    
    console.log(`\n✅ Successfully inserted ${insertedDoctors.length} doctors!`);
    
    // Show summary by specialization
    const summary = {};
    insertedDoctors.forEach(doc => {
      summary[doc.specialist] = (summary[doc.specialist] || 0) + 1;
    });
    
    console.log('\n📊 Doctors by Specialization:');
    Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([spec, count]) => {
      console.log(`   ${spec}: ${count}`);
    });
    
    console.log('\n💰 Consultation Fee: ৳0 (Doctors will set their own fees)');
    console.log('⏰ Various consultation hours available');
    console.log('📅 Doctors available 3-6 days per week');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding doctors:', err);
    process.exit(1);
  }
}

seedDoctors();
