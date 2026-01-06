const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HealthTip = require('./models/HealthTip');
const ResearchPaper = require('./models/ResearchPaper');

dotenv.config();

const MONGO = process.env.MONGO_URI ;

// Sample Health Tips
const healthTips = [
  {
    category: 'Nutrition',
    title: 'Stay Hydrated Throughout the Day',
    icon: '💧',
    content: 'Drink at least 8-10 glasses of water daily. Proper hydration helps maintain body temperature, keeps joints lubricated, prevents infections, delivers nutrients to cells, and keeps organs functioning properly.',
    tips: [
      'Start your day with a glass of water',
      'Keep a water bottle with you',
      'Drink before you feel thirsty',
      'Eat water-rich foods like cucumber and watermelon'
    ],
    isPublished: true
  },
  {
    category: 'Nutrition',
    title: 'Eat a Rainbow of Fruits and Vegetables',
    icon: '🥗',
    content: 'Different colored fruits and vegetables provide different nutrients. Aim for at least 5 servings of fruits and vegetables daily to get a wide range of vitamins, minerals, and antioxidants.',
    tips: [
      'Include leafy greens in your meals',
      'Snack on fresh fruits',
      'Try new vegetables each week',
      'Local seasonal produce is best and affordable'
    ],
    isPublished: true
  },
  {
    category: 'Exercise',
    title: 'Exercise at Least 30 Minutes Daily',
    icon: '🏃',
    content: 'Regular physical activity strengthens your heart, improves circulation, helps maintain a healthy weight, and reduces the risk of chronic diseases. Even light exercise is beneficial.',
    tips: [
      'Take a brisk walk after meals',
      'Use stairs instead of elevators',
      'Try yoga or stretching exercises',
      'Join a local sports club or gym'
    ],
    isPublished: true
  },
  {
    category: 'Mental Health',
    title: 'Practice Mindfulness and Meditation',
    icon: '🧘',
    content: 'Regular meditation reduces stress, anxiety, and depression. Just 10-15 minutes daily can improve focus, emotional well-being, and overall mental health.',
    tips: [
      'Start with 5 minutes of deep breathing',
      'Use meditation apps or YouTube videos',
      'Find a quiet space for practice',
      'Be consistent with your practice'
    ],
    isPublished: true
  },
  {
    category: 'Sleep',
    title: 'Get 7-8 Hours of Quality Sleep',
    icon: '😴',
    content: 'Adequate sleep is crucial for physical health, mental well-being, and cognitive function. Poor sleep is linked to obesity, heart disease, and reduced immunity.',
    tips: [
      'Maintain a consistent sleep schedule',
      'Create a dark, quiet sleeping environment',
      'Avoid caffeine after 2 PM',
      'Keep bedroom temperature cool'
    ],
    isPublished: true
  }
];

// Sample Research Papers
const researchPapers = [
  {
    category: 'Cardiology',
    title: 'Impact of Mediterranean Diet on Cardiovascular Health',
    authors: 'Dr. Rahman Ahmed, Dr. Fatima Sultana, Dr. Kamal Hassan',
    journal: 'Bangladesh Journal of Cardiology',
    year: 2024,
    abstract: 'This comprehensive study examines the effects of Mediterranean diet patterns on cardiovascular health outcomes in South Asian populations. Our research involved 1,200 participants over a 5-year period, showing significant reduction in cardiovascular events, improved lipid profiles, and better blood pressure control.',
    keywords: ['Mediterranean Diet', 'Cardiovascular Disease', 'Prevention', 'Nutrition'],
    doi: '10.1234/bjc.2024.001',
    citations: 45,
    link: '#',
    keyFindings: [
      '32% reduction in major cardiovascular events',
      'Significant improvement in HDL cholesterol levels',
      'Better blood pressure control in 67% of participants',
      'Reduced inflammation markers'
    ],
    isPublished: true
  },
  {
    category: 'Diabetes',
    title: 'Prevalence and Management of Type 2 Diabetes in Bangladesh',
    authors: 'Dr. Nusrat Jahan, Dr. Imran Khan, Dr. Shabana Akter',
    journal: 'Diabetes Research International',
    year: 2024,
    abstract: 'A nationwide study analyzing the prevalence, risk factors, and management strategies for Type 2 Diabetes Mellitus in Bangladesh. The study covers 15,000 adults across urban and rural areas, revealing alarming trends and proposing community-based intervention strategies.',
    keywords: ['Type 2 Diabetes', 'Prevalence', 'Bangladesh', 'Public Health'],
    doi: '10.5678/dri.2024.012',
    citations: 78,
    link: '#',
    keyFindings: [
      '12.4% prevalence in adults aged 20-79',
      'Higher rates in urban areas (15.2%) vs rural (9.8%)',
      'Only 45% of diagnosed patients achieve glycemic control',
      'Community health workers improve outcomes by 28%'
    ],
    isPublished: true
  },
  {
    category: 'Public Health',
    title: 'Maternal and Child Health Outcomes in Rural Bangladesh',
    authors: 'Dr. Roksana Begum, Dr. Abdul Latif, Dr. Yasmin Ara',
    journal: 'South Asian Journal of Public Health',
    year: 2024,
    abstract: 'A comprehensive analysis of maternal and child health indicators in rural Bangladesh, examining the impact of community health initiatives, skilled birth attendance, and nutrition programs on health outcomes.',
    keywords: ['Maternal Health', 'Child Health', 'Rural Health', 'Bangladesh'],
    doi: '10.3456/sajph.2024.034',
    citations: 56,
    link: '#',
    keyFindings: [
      'Maternal mortality reduced by 35% in intervention areas',
      'Skilled birth attendance increased to 78%',
      'Childhood malnutrition decreased by 22%',
      'Immunization coverage reached 92%'
    ],
    isPublished: true
  }
];

async function seedData() {
  try {
    await mongoose.connect(MONGO);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await HealthTip.deleteMany({});
    await ResearchPaper.deleteMany({});
    console.log('Cleared existing data');

    // Insert health tips
    const insertedTips = await HealthTip.insertMany(healthTips);
    console.log(`Inserted ${insertedTips.length} health tips`);

    // Insert research papers
    const insertedPapers = await ResearchPaper.insertMany(researchPapers);
    console.log(`Inserted ${insertedPapers.length} research papers`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedData();
