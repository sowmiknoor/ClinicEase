// Translation system for Bengali and English
export const translations = {
  en: {
    // Common
    welcome: "Welcome",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    submit: "Submit",
    search: "Search",
    filter: "Filter",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    approved: "Approved",
    rejected: "Rejected",
    
    // Navigation
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    home: "Home",
    
    // User Roles
    patient: "Patient",
    doctor: "Doctor",
    admin: "Admin",
    
    // Auth
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signUp: "Sign Up",
    signIn: "Sign In",
    welcomeBack: "Welcome Back!",
    signInToContinue: "Sign in to your account to continue",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Enter your password",
    signingIn: "Signing in...",
    createAccount: "Create one now",
    passwordResetSoon: "Password reset feature coming soon!",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    address: "Address",
    
    // Dashboard - Patient
    welcomeMessage: "Welcome back",
    upcomingReminders: "Upcoming Reminders",
    scheduledVisits: "Scheduled Visits",
    adherenceRate: "Adherence Rate",
    healthTip: "Health Tip",
    quickActions: "Quick Actions",
    recentActivity: "Recent Activity",
    myAppointments: "My Appointments",
    myMedications: "My Medications",
    myRecords: "My Records",
    
    // Dashboard - Doctor
    todaysAppointments: "Today's Appointments",
    pendingConsultations: "Pending Consultations",
    totalPatients: "Total Patients",
    recentPatients: "Recent Patients",
    prescriptionsWritten: "Prescriptions Written",
    
    // Dashboard - Admin
    totalUsers: "Total Users",
    totalDoctors: "Total Doctors",
    totalPatients: "Total Patients",
    systemHealth: "System Health",
    recentRegistrations: "Recent Registrations",
    
    // Navigation Items - Patient
    findDoctors: "Find Doctors",
    medications: "Medications",
    symptomCheck: "Symptom Check",
    homeVisitRequests: "Home Visit Requests",
    teleConsult: "Tele-Consult",
    labTests: "Lab Tests",
    records: "Records",
    messages: "Messages",
    notifications: "Notifications",
    communityForum: "Community Forum",
    healthTips: "Health Tips",
    researchPapers: "Research Papers",
    
    // Navigation Items - Doctor
    myProfile: "My Profile",
    myPatients: "My Patients",
    prescriptions: "Prescriptions",
    consultations: "Consultations",
    createMedicalRecord: "Create Medical Record",
    billing: "Billing",
    
    // Navigation Items - Admin
    adminDashboard: "Admin Dashboard",
    userManagement: "User Management",
    systemSettings: "System Settings",
    reports: "Reports",
    
    // Appointments
    bookAppointment: "Book Appointment",
    appointmentDate: "Appointment Date",
    appointmentTime: "Appointment Time",
    appointmentReason: "Reason for Appointment",
    appointmentStatus: "Status",
    appointmentHistory: "Appointment History",
    upcomingAppointments: "Upcoming Appointments",
    pastAppointments: "Past Appointments",
    cancelAppointment: "Cancel Appointment",
    rescheduleAppointment: "Reschedule Appointment",
    
    // Medications
    medicationName: "Medication Name",
    dosage: "Dosage",
    frequency: "Frequency",
    startDate: "Start Date",
    endDate: "End Date",
    instructions: "Instructions",
    addMedication: "Add Medication",
    currentMedications: "Current Medications",
    medicationHistory: "Medication History",
    medicationReminder: "Medication Reminder",
    takeMedication: "Take Medication",
    skipMedication: "Skip Medication",
    
    // Symptom Checker
    checkSymptoms: "Check Symptoms",
    enterSymptoms: "Enter Your Symptoms",
    symptomDescription: "Symptom Description",
    severity: "Severity",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
    duration: "Duration",
    days: "Days",
    weeks: "Weeks",
    months: "Months",
    analyzeSymptoms: "Analyze Symptoms",
    possibleConditions: "Possible Conditions",
    recommendedActions: "Recommended Actions",
    
    // Home Visits
    requestHomeVisit: "Request Home Visit",
    visitDate: "Visit Date",
    visitTime: "Visit Time",
    visitReason: "Reason for Visit",
    visitAddress: "Visit Address",
    visitStatus: "Visit Status",
    scheduled: "Scheduled",
    inProgress: "In Progress",
    
    // Tele Consultation
    startConsultation: "Start Consultation",
    joinConsultation: "Join Consultation",
    endConsultation: "End Consultation",
    consultationNotes: "Consultation Notes",
    consultationHistory: "Consultation History",
    videoCall: "Video Call",
    audioCall: "Audio Call",
    chatOnly: "Chat Only",
    
    // Lab Tests
    bookLabTest: "Book Lab Test",
    testName: "Test Name",
    testDate: "Test Date",
    testResults: "Test Results",
    downloadResults: "Download Results",
    labTestHistory: "Lab Test History",
    upcomingTests: "Upcoming Tests",
    testReports: "Test Reports",
    
    // Medical Records
    medicalHistory: "Medical History",
    allergies: "Allergies",
    chronicConditions: "Chronic Conditions",
    pastSurgeries: "Past Surgeries",
    familyHistory: "Family History",
    immunizations: "Immunizations",
    vitalSigns: "Vital Signs",
    bloodPressure: "Blood Pressure",
    heartRate: "Heart Rate",
    temperature: "Temperature",
    weight: "Weight",
    height: "Height",
    bmi: "BMI",
    
    // Prescriptions
    viewPrescription: "View Prescription",
    downloadPrescription: "Download Prescription",
    prescriptionDate: "Prescription Date",
    prescribedBy: "Prescribed By",
    diagnosis: "Diagnosis",
    medicines: "Medicines",
    tests: "Tests",
    followUp: "Follow-up",
    
    // Billing
    invoices: "Invoices",
    payments: "Payments",
    paymentHistory: "Payment History",
    paymentMethod: "Payment Method",
    amount: "Amount",
    paid: "Paid",
    unpaid: "Unpaid",
    dueDate: "Due Date",
    payNow: "Pay Now",
    downloadInvoice: "Download Invoice",
    
    // Messages
    newMessage: "New Message",
    sendMessage: "Send Message",
    inbox: "Inbox",
    sent: "Sent",
    compose: "Compose",
    recipient: "Recipient",
    subject: "Subject",
    message: "Message",
    
    // Notifications
    markAsRead: "Mark as Read",
    markAllAsRead: "Mark All as Read",
    deleteNotification: "Delete Notification",
    notificationSettings: "Notification Settings",
    
    // Profile
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    oldPassword: "Old Password",
    newPassword: "New Password",
    personalInformation: "Personal Information",
    contactInformation: "Contact Information",
    emergencyContact: "Emergency Contact",
    
    // Settings
    generalSettings: "General Settings",
    privacySettings: "Privacy Settings",
    notificationPreferences: "Notification Preferences",
    language: "Language",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    
    // Community Forum
    createPost: "Create Post",
    postTitle: "Post Title",
    postContent: "Post Content",
    category: "Category",
    replies: "Replies",
    lastActivity: "Last Activity",
    
    // Health Tips
    dailyHealthTip: "Daily Health Tip",
    viewAllTips: "View All Tips",
    tipCategory: "Category",
    
    // Research Papers
    searchPapers: "Search Papers",
    paperTitle: "Title",
    authors: "Authors",
    publishedDate: "Published Date",
    abstract: "Abstract",
    readMore: "Read More",
    
    // Doctor Profile
    specialization: "Specialization",
    experience: "Experience",
    qualifications: "Qualifications",
    availableSlots: "Available Slots",
    consultationFee: "Consultation Fee",
    rating: "Rating",
    reviews: "Reviews",
    
    // Admin Dashboard
    userStatistics: "User Statistics",
    systemActivity: "System Activity",
    recentUsers: "Recent Users",
    manageUsers: "Manage Users",
    manageDoctors: "Manage Doctors",
    systemLogs: "System Logs",
    
    // Health Tips
    healthTipsLabel: "Health Tips",
    healthTips: [
      "💧 Drink water regularly — aim for 8 glasses/day to stay hydrated.",
      "💊 Take medications on time for best results and optimal health.",
      "📝 Keep a log of symptoms for better consultations with your doctor.",
      "🏃 Exercise for at least 30 minutes daily to boost immunity.",
      "🥗 Eat a balanced diet with plenty of fruits and vegetables.",
      "😴 Get 7-8 hours of quality sleep every night for better recovery.",
      "🧘 Practice meditation or deep breathing to reduce stress.",
      "🚭 Avoid smoking and limit alcohol consumption for better health.",
      "🌞 Get some sunlight daily for Vitamin D and better mood.",
      "🩺 Schedule regular health check-ups and screenings.",
      "🧼 Wash your hands frequently to prevent infections.",
      "📱 Limit screen time before bed for better sleep quality."
    ],
    
    // Actions
    viewDetails: "View Details",
    downloadReport: "Download Report",
    printReport: "Print Report",
    shareReport: "Share Report",
    uploadDocument: "Upload Document",
    selectFile: "Select File",
    
    // Status Messages
    successMessage: "Operation completed successfully!",
    errorMessage: "An error occurred. Please try again.",
    noDataFound: "No data found.",
    loadingData: "Loading data...",
    
    // Validation Messages
    requiredField: "This field is required",
    invalidEmail: "Invalid email address",
    passwordMismatch: "Passwords do not match",
    invalidPhone: "Invalid phone number",
    
    // Time
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    
    // Additional
    menu: "Menu",
    patientSubtitle: "Your health at a glance — smart, simple, and secure.",
    doctorSubtitle: "Manage patient care, prescriptions, and consultations.",
    adminSubtitle: "System overview and management dashboard.",
    
    // Register page
    startYourJourney: "Start your healthcare journey today",
    fullNamePlaceholder: "John Doe",
    iAmA: "I am a",
    createStrongPassword: "Create a strong password",
    reEnterPassword: "Re-enter your password",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    veryStrong: "Very Strong",
    agreeToTerms: "I agree to the",
    and: "and",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    creatingAccount: "Creating Account...",
    signInHere: "Sign in here",
    passwordTooShort: "Password must be at least 6 characters long",
    accountCreatedSuccess: "Account created successfully! Logging you in...",
    joinThousands: "Join Thousands of Users",
    registerDescription: "Create your account today and experience the future of healthcare management. Join patients, doctors, and healthcare professionals already using ClinicEase.",
    secureAndPrivate: "Secure and Private",
    access247: "24/7 Access to Records",
    instantNotifications: "Instant Notifications",
    multiPlatform: "Multi-platform Support",
    activeUsers: "Active Users",
    doctors: "Doctors",
    consultations: "Consultations",
    needHelp: "Need help?",
    contactSupport: "Contact Support",
  },
  
  bn: {
    // Common
    welcome: "স্বাগতম",
    loading: "লোড হচ্ছে...",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    delete: "মুছুন",
    edit: "সম্পাদনা",
    view: "দেখুন",
    submit: "জমা দিন",
    search: "খুঁজুন",
    filter: "ফিল্টার",
    back: "পেছনে",
    next: "পরবর্তী",
    previous: "পূর্ববর্তী",
    close: "বন্ধ করুন",
    confirm: "নিশ্চিত করুন",
    yes: "হ্যাঁ",
    no: "না",
    all: "সব",
    active: "সক্রিয়",
    inactive: "নিষ্ক্রিয়",
    pending: "অপেক্ষমাণ",
    completed: "সম্পন্ন",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
    
    // Navigation
    dashboard: "ড্যাশবোর্ড",
    profile: "প্রোফাইল",
    settings: "সেটিংস",
    logout: "লগ আউট",
    home: "হোম",
    
    // User Roles
    patient: "রোগী",
    doctor: "ডাক্তার",
    admin: "অ্যাডমিন",
    
    // Auth
    login: "লগইন",
    register: "নিবন্ধন",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    rememberMe: "আমাকে মনে রাখুন",
    dontHaveAccount: "অ্যাকাউন্ট নেই?",
    alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    signUp: "সাইন আপ",
    signIn: "সাইন ইন",
    welcomeBack: "আবার স্বাগতম!",
    signInToContinue: "চালিয়ে যেতে আপনার অ্যাকাউন্টে সাইন ইন করুন",
    emailPlaceholder: "আপনার@example.com",
    passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
    signingIn: "সাইন ইন হচ্ছে...",
    createAccount: "এখনই তৈরি করুন",
    passwordResetSoon: "পাসওয়ার্ড রিসেট বৈশিষ্ট্য শীঘ্রই আসছে!",
    fullName: "পূর্ণ নাম",
    phoneNumber: "ফোন নম্বর",
    dateOfBirth: "জন্ম তারিখ",
    gender: "লিঙ্গ",
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
    address: "ঠিকানা",
    
    // Dashboard - Patient
    welcomeMessage: "আবার স্বাগতম",
    upcomingReminders: "আসন্ন অনুস্মারক",
    scheduledVisits: "নির্ধারিত ভিজিট",
    adherenceRate: "আনুগত্যের হার",
    healthTip: "স্বাস্থ্য পরামর্শ",
    quickActions: "দ্রুত কর্ম",
    recentActivity: "সাম্প্রতিক কার্যকলাপ",
    myAppointments: "আমার অ্যাপয়েন্টমেন্ট",
    myMedications: "আমার ওষুধ",
    myRecords: "আমার রেকর্ড",
    
    // Dashboard - Doctor
    todaysAppointments: "আজকের অ্যাপয়েন্টমেন্ট",
    pendingConsultations: "অপেক্ষমাণ পরামর্শ",
    totalPatients: "মোট রোগী",
    recentPatients: "সাম্প্রতিক রোগী",
    prescriptionsWritten: "প্রেসক্রিপশন লেখা",
    
    // Dashboard - Admin
    totalUsers: "মোট ব্যবহারকারী",
    totalDoctors: "মোট ডাক্তার",
    totalPatients: "মোট রোগী",
    systemHealth: "সিস্টেম স্বাস্থ্য",
    recentRegistrations: "সাম্প্রতিক নিবন্ধন",
    
    // Navigation Items - Patient
    findDoctors: "ডাক্তার খুঁজুন",
    medications: "ওষুধ",
    symptomCheck: "লক্ষণ পরীক্ষা",
    homeVisitRequests: "হোম ভিজিট অনুরোধ",
    teleConsult: "টেলি-পরামর্শ",
    labTests: "ল্যাব টেস্ট",
    records: "রেকর্ড",
    messages: "বার্তা",
    notifications: "বিজ্ঞপ্তি",
    communityForum: "কমিউনিটি ফোরাম",
    healthTips: "স্বাস্থ্য পরামর্শ",
    researchPapers: "গবেষণা পত্র",
    
    // Navigation Items - Doctor
    myProfile: "আমার প্রোফাইল",
    myPatients: "আমার রোগী",
    prescriptions: "প্রেসক্রিপশন",
    consultations: "পরামর্শ",
    createMedicalRecord: "মেডিকেল রেকর্ড তৈরি করুন",
    billing: "বিলিং",
    
    // Navigation Items - Admin
    adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",
    userManagement: "ব্যবহারকারী ব্যবস্থাপনা",
    systemSettings: "সিস্টেম সেটিংস",
    reports: "রিপোর্ট",
    
    // Appointments
    bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
    appointmentDate: "অ্যাপয়েন্টমেন্ট তারিখ",
    appointmentTime: "অ্যাপয়েন্টমেন্ট সময়",
    appointmentReason: "অ্যাপয়েন্টমেন্টের কারণ",
    appointmentStatus: "অবস্থা",
    appointmentHistory: "অ্যাপয়েন্টমেন্ট ইতিহাস",
    upcomingAppointments: "আসন্ন অ্যাপয়েন্টমেন্ট",
    pastAppointments: "অতীত অ্যাপয়েন্টমেন্ট",
    cancelAppointment: "অ্যাপয়েন্টমেন্ট বাতিল করুন",
    rescheduleAppointment: "অ্যাপয়েন্টমেন্ট পুনর্নির্ধারণ করুন",
    
    // Medications
    medicationName: "ওষুধের নাম",
    dosage: "ডোজ",
    frequency: "ফ্রিকোয়েন্সি",
    startDate: "শুরুর তারিখ",
    endDate: "শেষ তারিখ",
    instructions: "নির্দেশনা",
    addMedication: "ওষুধ যোগ করুন",
    currentMedications: "বর্তমান ওষুধ",
    medicationHistory: "ওষুধের ইতিহাস",
    medicationReminder: "ওষুধ অনুস্মারক",
    takeMedication: "ওষুধ খান",
    skipMedication: "ওষুধ এড়িয়ে যান",
    
    // Symptom Checker
    checkSymptoms: "লক্ষণ পরীক্ষা করুন",
    enterSymptoms: "আপনার লক্ষণ লিখুন",
    symptomDescription: "লক্ষণের বিবরণ",
    severity: "তীব্রতা",
    mild: "হালকা",
    moderate: "মাঝারি",
    severe: "গুরুতর",
    duration: "সময়কাল",
    days: "দিন",
    weeks: "সপ্তাহ",
    months: "মাস",
    analyzeSymptoms: "লক্ষণ বিশ্লেষণ করুন",
    possibleConditions: "সম্ভাব্য অবস্থা",
    recommendedActions: "প্রস্তাবিত পদক্ষেপ",
    
    // Home Visits
    requestHomeVisit: "হোম ভিজিট অনুরোধ করুন",
    visitDate: "ভিজিটের তারিখ",
    visitTime: "ভিজিটের সময়",
    visitReason: "ভিজিটের কারণ",
    visitAddress: "ভিজিটের ঠিকানা",
    visitStatus: "ভিজিটের অবস্থা",
    scheduled: "নির্ধারিত",
    inProgress: "চলমান",
    
    // Tele Consultation
    startConsultation: "পরামর্শ শুরু করুন",
    joinConsultation: "পরামর্শে যোগদান করুন",
    endConsultation: "পরামর্শ শেষ করুন",
    consultationNotes: "পরামর্শ নোট",
    consultationHistory: "পরামর্শের ইতিহাস",
    videoCall: "ভিডিও কল",
    audioCall: "অডিও কল",
    chatOnly: "শুধু চ্যাট",
    
    // Lab Tests
    bookLabTest: "ল্যাব টেস্ট বুক করুন",
    testName: "টেস্টের নাম",
    testDate: "টেস্টের তারিখ",
    testResults: "টেস্টের ফলাফল",
    downloadResults: "ফলাফল ডাউনলোড করুন",
    labTestHistory: "ল্যাব টেস্ট ইতিহাস",
    upcomingTests: "আসন্ন টেস্ট",
    testReports: "টেস্ট রিপোর্ট",
    
    // Medical Records
    medicalHistory: "মেডিকেল ইতিহাস",
    allergies: "অ্যালার্জি",
    chronicConditions: "দীর্ঘস্থায়ী রোগ",
    pastSurgeries: "অতীত অপারেশন",
    familyHistory: "পারিবারিক ইতিহাস",
    immunizations: "টিকা",
    vitalSigns: "প্রাণবন্ত চিহ্ন",
    bloodPressure: "রক্তচাপ",
    heartRate: "হৃদস্পন্দন",
    temperature: "তাপমাত্রা",
    weight: "ওজন",
    height: "উচ্চতা",
    bmi: "বিএমআই",
    
    // Prescriptions
    viewPrescription: "প্রেসক্রিপশন দেখুন",
    downloadPrescription: "প্রেসক্রিপশন ডাউনলোড করুন",
    prescriptionDate: "প্রেসক্রিপশনের তারিখ",
    prescribedBy: "দ্বারা নির্ধারিত",
    diagnosis: "রোগ নির্ণয়",
    medicines: "ওষুধ",
    tests: "টেস্ট",
    followUp: "ফলো-আপ",
    
    // Billing
    invoices: "চালান",
    payments: "পেমেন্ট",
    paymentHistory: "পেমেন্ট ইতিহাস",
    paymentMethod: "পেমেন্ট পদ্ধতি",
    amount: "পরিমাণ",
    paid: "পরিশোধিত",
    unpaid: "অপরিশোধিত",
    dueDate: "নির্ধারিত তারিখ",
    payNow: "এখনই পরিশোধ করুন",
    downloadInvoice: "চালান ডাউনলোড করুন",
    
    // Messages
    newMessage: "নতুন বার্তা",
    sendMessage: "বার্তা পাঠান",
    inbox: "ইনবক্স",
    sent: "পাঠানো",
    compose: "রচনা করুন",
    recipient: "প্রাপক",
    subject: "বিষয়",
    message: "বার্তা",
    
    // Notifications
    markAsRead: "পড়া হিসাবে চিহ্নিত করুন",
    markAllAsRead: "সব পড়া হিসাবে চিহ্নিত করুন",
    deleteNotification: "বিজ্ঞপ্তি মুছুন",
    notificationSettings: "বিজ্ঞপ্তি সেটিংস",
    
    // Profile
    editProfile: "প্রোফাইল সম্পাদনা করুন",
    changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
    oldPassword: "পুরাতন পাসওয়ার্ড",
    newPassword: "নতুন পাসওয়ার্ড",
    personalInformation: "ব্যক্তিগত তথ্য",
    contactInformation: "যোগাযোগের তথ্য",
    emergencyContact: "জরুরি যোগাযোগ",
    
    // Settings
    generalSettings: "সাধারণ সেটিংস",
    privacySettings: "গোপনীয়তা সেটিংস",
    notificationPreferences: "বিজ্ঞপ্তি পছন্দ",
    language: "ভাষা",
    theme: "থিম",
    lightMode: "লাইট মোড",
    darkMode: "ডার্ক মোড",
    
    // Community Forum
    createPost: "পোস্ট তৈরি করুন",
    postTitle: "পোস্ট শিরোনাম",
    postContent: "পোস্ট বিষয়বস্তু",
    category: "ক্যাটেগরি",
    replies: "উত্তর",
    lastActivity: "শেষ কার্যকলাপ",
    
    // Health Tips
    dailyHealthTip: "দৈনিক স্বাস্থ্য পরামর্শ",
    viewAllTips: "সব পরামর্শ দেখুন",
    tipCategory: "ক্যাটেগরি",
    
    // Research Papers
    searchPapers: "পেপার খুঁজুন",
    paperTitle: "শিরোনাম",
    authors: "লেখক",
    publishedDate: "প্রকাশের তারিখ",
    abstract: "সারসংক্ষেপ",
    readMore: "আরও পড়ুন",
    
    // Doctor Profile
    specialization: "বিশেষত্ব",
    experience: "অভিজ্ঞতা",
    qualifications: "যোগ্যতা",
    availableSlots: "উপলব্ধ স্লট",
    consultationFee: "পরামর্শ ফি",
    rating: "রেটিং",
    reviews: "পর্যালোচনা",
    
    // Admin Dashboard
    userStatistics: "ব্যবহারকারী পরিসংখ্যান",
    systemActivity: "সিস্টেম কার্যকলাপ",
    recentUsers: "সাম্প্রতিক ব্যবহারকারী",
    manageUsers: "ব্যবহারকারী ব্যবস্থাপনা",
    manageDoctors: "ডাক্তার ব্যবস্থাপনা",
    systemLogs: "সিস্টেম লগ",
    
    // Health Tips
    healthTipsLabel: "স্বাস্থ্য টিপস",
    healthTips: [
      "💧 নিয়মিত পানি পান করুন — হাইড্রেটেড থাকতে দিনে ৮ গ্লাস পানি পান করুন।",
      "💊 সেরা ফলাফল এবং সর্বোত্তম স্বাস্থ্যের জন্য সময়মতো ওষুধ খান।",
      "📝 আপনার ডাক্তারের সাথে ভাল পরামর্শের জন্য লক্ষণগুলির একটি লগ রাখুন।",
      "🏃 রোগ প্রতিরোধ ক্ষমতা বাড়াতে প্রতিদিন কমপক্ষে ৩০ মিনিট ব্যায়াম করুন।",
      "🥗 প্রচুর ফল এবং সবজি সহ একটি সুষম খাদ্য খান।",
      "😴 ভাল পুনরুদ্ধারের জন্য প্রতি রাতে ৭-৮ ঘন্টা মানসম্পন্ন ঘুম পান।",
      "🧘 চাপ কমাতে ধ্যান বা গভীর শ্বাস-প্রশ্বাস অনুশীলন করুন।",
      "🚭 ভাল স্বাস্থ্যের জন্য ধূমপান এড়িয়ে চলুন এবং অ্যালকোহল সেবন সীমিত করুন।",
      "🌞 ভিটামিন ডি এবং ভাল মেজাজের জন্য প্রতিদিন কিছু সূর্যালোক পান।",
      "🩺 নিয়মিত স্বাস্থ্য পরীক্ষা এবং স্ক্রিনিং নির্ধারণ করুন।",
      "🧼 সংক্রমণ প্রতিরোধ করতে ঘন ঘন হাত ধুয়ে নিন।",
      "📱 ভাল ঘুমের মানের জন্য ঘুমানোর আগে স্ক্রিন সময় সীমিত করুন।"
    ],
    
    // Actions
    viewDetails: "বিস্তারিত দেখুন",
    downloadReport: "রিপোর্ট ডাউনলোড করুন",
    printReport: "রিপোর্ট প্রিন্ট করুন",
    shareReport: "রিপোর্ট শেয়ার করুন",
    uploadDocument: "ডকুমেন্ট আপলোড করুন",
    selectFile: "ফাইল নির্বাচন করুন",
    
    // Status Messages
    successMessage: "অপারেশন সফলভাবে সম্পন্ন হয়েছে!",
    errorMessage: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    noDataFound: "কোনো ডেটা পাওয়া যায়নি।",
    loadingData: "ডেটা লোড হচ্ছে...",
    
    // Validation Messages
    requiredField: "এই ক্ষেত্রটি প্রয়োজনীয়",
    invalidEmail: "অবৈধ ইমেইল ঠিকানা",
    passwordMismatch: "পাসওয়ার্ড মিলছে না",
    invalidPhone: "অবৈধ ফোন নম্বর",
    
    // Time
    today: "আজ",
    yesterday: "গতকাল",
    tomorrow: "আগামীকাল",
    thisWeek: "এই সপ্তাহ",
    thisMonth: "এই মাস",
    lastMonth: "গত মাস",
    
    // Additional
    menu: "মেনু",
    patientSubtitle: "আপনার স্বাস্থ্য এক নজরে — স্মার্ট, সহজ এবং নিরাপদ।",
    doctorSubtitle: "রোগীর যত্ন, প্রেসক্রিপশন এবং পরামর্শ পরিচালনা করুন।",
    adminSubtitle: "সিস্টেম ওভারভিউ এবং ম্যানেজমেন্ট ড্যাশবোর্ড।",
    
    // Register page
    startYourJourney: "আজই আপনার স্বাস্থ্যসেবা যাত্রা শুরু করুন",
    fullNamePlaceholder: "আপনার পুরো নাম",
    iAmA: "আমি একজন",
    createStrongPassword: "একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন",
    reEnterPassword: "আপনার পাসওয়ার্ড পুনরায় লিখুন",
    weak: "দুর্বল",
    fair: "মোটামুটি",
    good: "ভাল",
    strong: "শক্তিশালী",
    veryStrong: "অত্যন্ত শক্তিশালী",
    agreeToTerms: "আমি সম্মত",
    and: "এবং",
    termsOfService: "সেবার শর্তাবলী",
    privacyPolicy: "গোপনীয়তা নীতি",
    creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    signInHere: "এখানে সাইন ইন করুন",
    passwordTooShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
    accountCreatedSuccess: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! আপনাকে লগ ইন করা হচ্ছে...",
    joinThousands: "হাজারো ব্যবহারকারীর সাথে যোগ দিন",
    registerDescription: "আজই আপনার অ্যাকাউন্ট তৈরি করুন এবং স্বাস্থ্যসেবা ব্যবস্থাপনার ভবিষ্যৎ অনুভব করুন। ইতিমধ্যে ClinicEase ব্যবহার করছেন এমন রোগী, ডাক্তার এবং স্বাস্থ্যসেবা পেশাদারদের সাথে যোগ দিন।",
    secureAndPrivate: "নিরাপদ এবং ব্যক্তিগত",
    access247: "রেকর্ডে ২৪/৭ অ্যাক্সেস",
    instantNotifications: "তাৎক্ষণিক বিজ্ঞপ্তি",
    multiPlatform: "মাল্টি-প্ল্যাটফর্ম সাপোর্ট",
    activeUsers: "সক্রিয় ব্যবহারকারী",
    doctors: "ডাক্তার",
    consultations: "পরামর্শ",
    needHelp: "সাহায্য প্রয়োজন?",
    contactSupport: "সাপোর্টের সাথে যোগাযোগ করুন",
  }
};

// Helper function to get translation
export const t = (key, lang = 'en') => {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return translations['en'][key] || key;
    }
  }
  
  return value || key;
};
