// Comprehensive list of Hospitals and Diagnostic Centers in Bangladesh

const bangladeshLabs = [
  // Dhaka - Major Hospitals
  { name: "Square Hospital Ltd.", location: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka 1205", city: "Dhaka", type: "Hospital" },
  { name: "United Hospital Ltd.", location: "Plot 15, Road 71, Gulshan, Dhaka 1212", city: "Dhaka", type: "Hospital" },
  { name: "Apollo Hospitals Dhaka", location: "Plot 81, Block E, Bashundhara R/A, Dhaka 1229", city: "Dhaka", type: "Hospital" },
  { name: "Labaid Specialized Hospital", location: "House 1, Road 4, Dhanmondi, Dhaka 1205", city: "Dhaka", type: "Hospital" },
  { name: "BIRDEM General Hospital", location: "122 Kazi Nazrul Islam Avenue, Shahbag, Dhaka 1000", city: "Dhaka", type: "Hospital" },
  { name: "Popular Medical College Hospital", location: "2, Road 2, Dhanmondi, Dhaka 1205", city: "Dhaka", type: "Hospital" },
  { name: "Ibn Sina Hospital", location: "House 48, Road 9/A, Dhanmondi, Dhaka 1209", city: "Dhaka", type: "Hospital" },
  { name: "Evercare Hospital Dhaka", location: "Plot 81, Block E, Bashundhara, Dhaka 1229", city: "Dhaka", type: "Hospital" },
  { name: "Asgar Ali Hospital", location: "111/1/A Distillery Road, Gandaria, Dhaka 1204", city: "Dhaka", type: "Hospital" },
  { name: "Anwer Khan Modern Medical College Hospital", location: "House 17, Road 8, Dhanmondi, Dhaka 1205", city: "Dhaka", type: "Hospital" },
  
  // Dhaka - Diagnostic Centers
  { name: "Popular Diagnostic Centre Ltd.", location: "House 16, Road 2, Dhanmondi, Dhaka 1205", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Ibn Sina Diagnostic & Consultation Center", location: "House 48, Road 9/A, Dhanmondi, Dhaka 1209", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Labaid Diagnostic", location: "House 6, Road 4, Dhanmondi, Dhaka 1205", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Dr. Lal PathLabs Bangladesh", location: "Green Road, Dhaka 1205", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Medinova Medical Services Ltd.", location: "House 71/A, Road 5/A, Dhanmondi, Dhaka 1209", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Thyrocare Bangladesh", location: "Gulshan Avenue, Dhaka 1212", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Quest Diagnostics Bangladesh", location: "Banani, Dhaka 1213", city: "Dhaka", type: "Diagnostic Center" },
  { name: "ICDDR,B (Clinical Lab)", location: "68 Shaheed Tajuddin Ahmed Sarani, Mohakhali, Dhaka 1212", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Central Hospital Ltd.", location: "House 2, Road 5, Green Road, Dhaka 1205", city: "Dhaka", type: "Diagnostic Center" },
  { name: "Delta Health Care", location: "Mirpur, Dhaka 1216", city: "Dhaka", type: "Diagnostic Center" },
  
  // Chittagong
  { name: "Chittagong Medical College Hospital", location: "K.B. Fazlul Kader Road, Chittagong 4203", city: "Chittagong", type: "Hospital" },
  { name: "Chittagong Maa-O-Shishu Hospital", location: "Agrabad Access Road, Chittagong 4100", city: "Chittagong", type: "Hospital" },
  { name: "Parkview Hospital Chittagong", location: "Lalkhan Bazar, Chittagong 4000", city: "Chittagong", type: "Hospital" },
  { name: "Imperial Hospital Ltd.", location: "2269 O.R. Nizam Road, Chittagong 4100", city: "Chittagong", type: "Hospital" },
  { name: "Popular Diagnostic Centre Chittagong", location: "Agrabad, Chittagong 4100", city: "Chittagong", type: "Diagnostic Center" },
  { name: "Ibn Sina Diagnostic Chittagong", location: "Nasirabad, Chittagong 4200", city: "Chittagong", type: "Diagnostic Center" },
  
  // Sylhet
  { name: "Sylhet MAG Osmani Medical College Hospital", location: "Airport Road, Sylhet 3100", city: "Sylhet", type: "Hospital" },
  { name: "Mount Adora Hospital", location: "Akhalia, Sylhet 3100", city: "Sylhet", type: "Hospital" },
  { name: "Noorjahan Hospital", location: "Pathantula, Sylhet 3100", city: "Sylhet", type: "Hospital" },
  { name: "Popular Diagnostic Centre Sylhet", location: "Zindabazar, Sylhet 3100", city: "Sylhet", type: "Diagnostic Center" },
  
  // Rajshahi
  { name: "Rajshahi Medical College Hospital", location: "Laxmipur, Rajshahi 6100", city: "Rajshahi", type: "Hospital" },
  { name: "Islami Bank Hospital Rajshahi", location: "Shaheb Bazar, Rajshahi 6100", city: "Rajshahi", type: "Hospital" },
  { name: "Popular Diagnostic Centre Rajshahi", location: "Saheb Bazar, Rajshahi 6100", city: "Rajshahi", type: "Diagnostic Center" },
  
  // Khulna
  { name: "Khulna Medical College Hospital", location: "Sonadanga, Khulna 9100", city: "Khulna", type: "Hospital" },
  { name: "Gazi Medical College Hospital", location: "Khulna 9100", city: "Khulna", type: "Hospital" },
  { name: "Popular Diagnostic Centre Khulna", location: "Khan Jahan Ali Road, Khulna 9100", city: "Khulna", type: "Diagnostic Center" },
  
  // Barishal
  { name: "Sher-e-Bangla Medical College Hospital", location: "Band Road, Barishal 8200", city: "Barishal", type: "Hospital" },
  { name: "Popular Diagnostic Centre Barishal", location: "Nathullabad, Barishal 8200", city: "Barishal", type: "Diagnostic Center" },
  
  // Mymensingh
  { name: "Mymensingh Medical College Hospital", location: "Charpara, Mymensingh 2200", city: "Mymensingh", type: "Hospital" },
  { name: "Community Based Medical College Hospital", location: "Mymensingh 2200", city: "Mymensingh", type: "Hospital" },
  
  // Rangpur
  { name: "Rangpur Medical College Hospital", location: "Medical College Road, Rangpur 5400", city: "Rangpur", type: "Hospital" },
  { name: "Popular Diagnostic Centre Rangpur", location: "Station Road, Rangpur 5400", city: "Rangpur", type: "Diagnostic Center" },
  
  // Comilla
  { name: "Comilla Medical College Hospital", location: "Comilla 3500", city: "Comilla", type: "Hospital" },
  { name: "Popular Diagnostic Centre Comilla", location: "Kandirpar, Comilla 3500", city: "Comilla", type: "Diagnostic Center" },
  
  // Other Major Cities
  { name: "Faridpur Medical College Hospital", location: "Faridpur 7800", city: "Faridpur", type: "Hospital" },
  { name: "Jessore Medical College Hospital", location: "Jessore 7400", city: "Jessore", type: "Hospital" },
  { name: "Bogra Medical College Hospital", location: "Bogra 5800", city: "Bogra", type: "Hospital" },
  { name: "Pabna Medical College Hospital", location: "Pabna 6600", city: "Pabna", type: "Hospital" },
  { name: "Dinajpur Medical College Hospital", location: "Dinajpur 5200", city: "Dinajpur", type: "Hospital" },
  
  // Specialized Centers
  { name: "National Institute of Cardiovascular Diseases (NICVD)", location: "Sher-e-Bangla Nagar, Dhaka 1207", city: "Dhaka", type: "Specialized Hospital" },
  { name: "National Institute of Cancer Research & Hospital", location: "Mohakhali, Dhaka 1212", city: "Dhaka", type: "Specialized Hospital" },
  { name: "National Institute of Kidney Diseases & Urology", location: "Sher-e-Bangla Nagar, Dhaka 1207", city: "Dhaka", type: "Specialized Hospital" },
  { name: "Bangladesh Eye Hospital", location: "Mirpur, Dhaka 1216", city: "Dhaka", type: "Specialized Hospital" },
  { name: "National Institute of Neurosciences & Hospital", location: "Sher-e-Bangla Nagar, Dhaka 1207", city: "Dhaka", type: "Specialized Hospital" },
];

module.exports = bangladeshLabs;
