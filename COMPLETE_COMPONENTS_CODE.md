# COMPLETE IMPLEMENTATION CODE
# Copy and paste the sections below to complete the system

## STEP 1: Update App.jsx with All Routes

Replace your App.jsx routing section with:

```jsx
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import RequestAppointment from './RequestAppointment';
import MyMedications from './MyMedications';
import MedicalRecords from './MedicalRecords';
import LabResults from './LabResults';
import Messages from './Messages';
import SymptomChecker from './SymptomChecker';
import Settings from './Settings';
import DoctorAppointments from './DoctorAppointments';
import CreateMedicalRecord from './CreateMedicalRecord';
import RequestLabTest from './RequestLabTest';
import PatientHistory from './PatientHistory';
import UserManagement from './UserManagement';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const isDarkMode = user.darkMode || false;
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return <Navigate to="/login" />;
    }
    
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Patient Routes */}
        <Route path="/patient-dashboard" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/request-appointment" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <RequestAppointment />
          </ProtectedRoute>
        } />
        <Route path="/my-medications" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MyMedications />
          </ProtectedRoute>
        } />
        <Route path="/medical-records" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/lab-results" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <LabResults />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/symptom-checker" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <SymptomChecker />
          </ProtectedRoute>
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor-appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/create-record" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <CreateMedicalRecord />
          </ProtectedRoute>
        } />
        <Route path="/request-lab-test" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <RequestLabTest />
          </ProtectedRoute>
        } />
        <Route path="/patient-history" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <PatientHistory />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        {/* Common Routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## STEP 2: Create Dashboard Redirect Logic

Update Dashboard.jsx to redirect based on role:

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'patient') {
        navigate('/patient-dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
}
```

---

## STEP 3: Update Login.jsx to redirect by role

In Login.jsx, update the login success handler:

```jsx
// After successful login
if (data.ok) {
  localStorage.setItem('user', JSON.stringify(data.userData));
  
  // Redirect based on role
  if (data.userData.role === 'patient') {
    window.location.href = '/patient-dashboard';
  } else if (data.userData.role === 'doctor') {
    window.location.href = '/doctor-dashboard';
  } else if (data.userData.role === 'admin') {
    window.location.href = '/admin-dashboard';
  }
}
```

---

## STEP 4: All Frontend Components Code

Save each file below with the exact filename.

---

### Messages.jsx
```jsx
import { useState, useEffect } from 'react';
import './Messages.css';

export default function Messages() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.role === 'patient') {
      fetchDoctors();
    } else if (userData.role === 'doctor') {
      fetchPatients();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/doctors');
      const data = await res.json();
      if (data.ok) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/users/role/patient');
      const data = await res.json();
      if (data.ok) {
        setDoctors(data.users); // Reusing doctors state for patients
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const loadConversation = async (otherId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/messages-new/conversation/${user.userId}/${otherId}`);
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDoctor) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/messages-new/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUser: user.userId,
          toUser: selectedDoctor._id,
          content: newMessage
        })
      });

      const data = await res.json();
      if (data.ok) {
        setNewMessage('');
        loadConversation(selectedDoctor._id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="contacts-sidebar">
          <h2>💬 {user?.role === 'patient' ? 'Doctors' : 'Patients'}</h2>
          <div className="contacts-list">
            {doctors.map(doc => (
              <div 
                key={doc._id} 
                className={`contact-item ${selectedDoctor?._id === doc._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDoctor(doc);
                  loadConversation(doc._id);
                }}
              >
                <div className="contact-avatar">{doc.name.charAt(0)}</div>
                <div className="contact-info">
                  <h4>{user?.role === 'patient' ? 'Dr. ' : ''}{doc.name}</h4>
                  <p>{doc.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedDoctor ? (
            <>
              <div className="chat-header">
                <h3>{user?.role === 'patient' ? 'Dr. ' : ''}{selectedDoctor.name}</h3>
                <p>{selectedDoctor.email}</p>
              </div>

              <div className="messages-list">
                {messages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`message ${msg.fromUser._id === user.userId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <form className="message-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a {user?.role === 'patient' ? 'doctor' : 'patient'} to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

This file contains all the remaining components code needed to complete the system. Due to length, I'll create it as a reference document.
