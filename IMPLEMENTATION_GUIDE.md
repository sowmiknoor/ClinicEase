# ClinicEase - Comprehensive Healthcare Management System

## 🎯 Overview
ClinicEase is a full-featured healthcare management platform with role-based access for Patients, Doctors, and Administrators.

## 👥 User Roles & Features

### 🧑‍⚕️ PATIENT Features
1. **Medications Management**
   - View active medications
   - Track medication schedule
   - Receive reminders
   - View medication history

2. **AI Symptom Checker**
   - Describe symptoms
   - Get AI-powered analysis
   - Receive health recommendations

3. **Request Appointments**
   - **Teleconsultation**: Video call with doctor
   - **Home Visit**: Request doctor to visit your home
   - Choose doctor
   - Select date/time
   - Describe symptoms

4. **Medical Records**
   - View all medical records prescribed by doctors
   - See diagnosis, prescriptions, medications
   - Access historical health data

5. **Lab Test Results**
   - View lab tests requested by doctors
   - Check test status (ordered, in-progress, completed)
   - Access test results and reports

6. **Messaging System**
   - Send messages to specific doctors
   - View message history
   - Real-time communication

### 👨‍⚕️ DOCTOR Features
1. **Appointment Management**
   - View incoming teleconsultation requests
   - View home visit requests
   - **Accept or Reject** appointments
   - Add notes/completion details

2. **Request Lab Tests**
   - Request lab tests for patients
   - Specify test type and urgency
   - Track test status
   - View results

3. **Issue Medical Records**
   - Create medical records for patients
   - Add diagnosis and prescription
   - Prescribe medications
   - Recommend lab tests
   - Set follow-up dates

4. **Patient History**
   - View complete patient medical history
   - Access previous consultations
   - Review past prescriptions and lab results

5. **Messaging**
   - Receive messages from patients
   - Reply to patient inquiries
   - Maintain communication logs

6. **Dashboard**
   - View appointment statistics
   - Track patient counts
   - Monitor pending requests

### 👔 ADMIN Features
1. **User Management**
   - View all patients and doctors
   - Monitor user activity
   - Activate/deactivate users
   - Delete users if needed

2. **System Monitoring**
   - Total patients count
   - Total doctors count
   - Total appointments (pending/completed)
   - Medical records count
   - Lab tests statistics
   - Messages overview

3. **Records Access**
   - View ALL medical records in system
   - Access all appointments
   - Monitor all lab tests
   - View all messages

4. **Analytics Dashboard**
   - System-wide statistics
   - Activity metrics
   - Performance tracking

## 🔐 Authentication & Security
- Secure user registration and login
- Role-based access control (RBAC)
- JWT token authentication
- Password encryption
- Per-user dark mode preferences

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
POST /api/auth/update-settings - Update user settings
```

### Appointments
```
POST /api/appointments/create - Create appointment request
GET /api/appointments/patient/:patientId - Get patient appointments
GET /api/appointments/doctor/:doctorId - Get doctor appointments
PUT /api/appointments/update-status/:appointmentId - Accept/reject appointment
GET /api/appointments/all - Get all appointments (Admin)
PUT /api/appointments/cancel/:appointmentId - Cancel appointment
```

### Medical Records
```
POST /api/medical-records/create - Create medical record (Doctor)
GET /api/medical-records/patient/:patientId - Get patient records
GET /api/medical-records/doctor/:doctorId - Get records by doctor
GET /api/medical-records/all - Get all records (Admin)
PUT /api/medical-records/update/:recordId - Update record
```

### Lab Tests
```
POST /api/lab-tests-new/request - Request lab test (Doctor)
GET /api/lab-tests-new/patient/:patientId - Get patient lab tests
GET /api/lab-tests-new/doctor/:doctorId - Get doctor's requested tests
GET /api/lab-tests-new/all - Get all lab tests (Admin)
PUT /api/lab-tests-new/update/:testId - Update test status
```

### Messages
```
POST /api/messages-new/send - Send message
GET /api/messages-new/inbox/:userId - Get inbox messages
GET /api/messages-new/sent/:userId - Get sent messages
GET /api/messages-new/conversation/:userId1/:userId2 - Get conversation
PUT /api/messages-new/read/:messageId - Mark as read
GET /api/messages-new/unread-count/:userId - Get unread count
```

### Medications
```
POST /api/medications-new/add - Add medication
GET /api/medications-new/patient/:userId - Get patient medications
GET /api/medications-new/active/:userId - Get active medications
PUT /api/medications-new/update/:medicationId - Update medication
DELETE /api/medications-new/delete/:medicationId - Delete medication
POST /api/medications-new/record/:medicationId - Record medication taken
```

### Admin
```
GET /api/admin/users/all - Get all users
GET /api/admin/users/role/:role - Get users by role
GET /api/admin/doctors - Get all doctors
GET /api/admin/stats - Get system statistics
PUT /api/admin/users/status/:userId - Update user status
DELETE /api/admin/users/delete/:userId - Delete user
```

## 🗄️ Database Models

### User
- name, email, phone, password
- role: 'patient' | 'doctor' | 'admin'
- darkMode preference

### Appointment
- patientId, doctorId
- type: 'teleconsultation' | 'home-visit'
- status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
- appointmentDate, appointmentTime
- symptoms, address, notes

### MedicalRecord
- patientId, doctorId
- diagnosis, prescription
- medications[], labTestsRecommended[]
- followUpDate, notes

### LabTest
- patientId, doctorId
- testType, category
- status: 'ordered' | 'scheduled' | 'in_progress' | 'completed'
- scheduledDate, completedDate
- testResults, resultUrl

### Message
- fromUser, toUser
- content
- read: boolean

### Medication
- userId
- medicationName, dosage, frequency
- reminderTimes[]
- startDate, endDate
- prescribedBy, isActive

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# PORT=5001
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎨 Design Features
- Modern, professional healthcare UI
- Cyan/teal color scheme (#0ea5e9, #06b6d4)
- Responsive design for mobile, tablet, and desktop
- Dark mode support (per-user)
- Touch-optimized for mobile devices
- Smooth animations and transitions

## 📱 Mobile Responsive
- Breakpoints: 1024px, 768px, 480px
- Touch targets: Minimum 44px
- Mobile-first approach
- Prevents iOS zoom on inputs
- Optimized layouts for all screen sizes

## 🔄 Workflow

### Patient Journey
1. Register/Login → Patient Dashboard
2. Check Symptoms (AI Symptom Checker)
3. Request Appointment (Teleconsultation/Home Visit)
4. Doctor Reviews and Accepts
5. Consultation Happens
6. Doctor Issues Medical Record
7. Doctor Requests Lab Tests
8. Patient Views Records and Lab Results
9. Patient Messages Doctor for Follow-up

### Doctor Journey
1. Login → Doctor Dashboard
2. View Appointment Requests
3. Accept/Reject Appointments
4. Conduct Consultation
5. Create Medical Record
6. Request Lab Tests for Patient
7. View Patient History
8. Respond to Messages

### Admin Journey
1. Login → Admin Dashboard
2. Monitor System Statistics
3. View All Users (Patients/Doctors)
4. View All Records
5. Manage User Accounts
6. Track System Activity

## 🛠️ Technology Stack
- **Frontend**: React, Vite, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **State Management**: React Hooks + LocalStorage
- **Styling**: Custom CSS with responsive design

## 📊 Key Statistics Dashboard

### Patient Dashboard Shows:
- Upcoming Appointments
- Active Medications
- Pending Lab Tests
- Unread Messages

### Doctor Dashboard Shows:
- Pending Appointments
- Today's Consultations
- Total Patients
- Recent Messages

### Admin Dashboard Shows:
- Total Patients
- Total Doctors
- Total Appointments
- Medical Records Count
- Lab Tests Count
- System Messages

## 🎯 Next Steps for Development

### Frontend Components Needed:
1. ✅ PatientDashboard.jsx
2. ✅ RequestAppointment.jsx
3. 📝 MyMedications.jsx
4. 📝 MedicalRecords.jsx (Patient view)
5. 📝 LabResults.jsx
6. 📝 Messages.jsx
7. 📝 DoctorDashboard.jsx
8. 📝 DoctorAppointments.jsx
9. 📝 CreateMedicalRecord.jsx
10. 📝 RequestLabTest.jsx
11. 📝 PatientHistory.jsx
12. 📝 AdminDashboard.jsx
13. 📝 UserManagement.jsx
14. 📝 SystemStats.jsx

### App.jsx Routes to Add:
```jsx
// Patient routes
<Route path="/patient-dashboard" element={<PatientDashboard />} />
<Route path="/request-appointment" element={<RequestAppointment />} />
<Route path="/my-medications" element={<MyMedications />} />
<Route path="/medical-records" element={<MedicalRecords />} />
<Route path="/lab-results" element={<LabResults />} />
<Route path="/messages" element={<Messages />} />

// Doctor routes
<Route path="/doctor-dashboard" element={<DoctorDashboard />} />
<Route path="/doctor-appointments" element={<DoctorAppointments />} />
<Route path="/create-record" element={<CreateMedicalRecord />} />
<Route path="/request-lab-test" element={<RequestLabTest />} />
<Route path="/patient-history" element={<PatientHistory />} />

// Admin routes
<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/user-management" element={<UserManagement />} />
<Route path="/system-stats" element={<SystemStats />} />
```

## 📝 Notes
- All appointments start with 'pending' status
- Doctors can accept/reject appointment requests
- Medical records are created AFTER consultations
- Lab tests flow: Doctor requests → Patient receives → Test completed
- Messages are one-to-one between patient and doctor
- Admin has read-only access to all data
- Dark mode is stored per-user in database

## 🔒 Security Considerations
- Validate user roles on backend
- Sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting
- Add CORS restrictions
- Secure file uploads for lab results
- Encrypt sensitive medical data
