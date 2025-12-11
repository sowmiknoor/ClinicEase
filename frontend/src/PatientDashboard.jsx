import { useState, useEffect } from 'react';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activeMedications: 0,
    pendingLabTests: 0,
    unreadMessages: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchDashboardStats(userData.userId);
  }, []);

  const fetchDashboardStats = async (userId) => {
    try {
      // Fetch appointments
      const apptRes = await fetch(`http://localhost:5001/api/appointments/patient/${userId}`);
      const apptData = await apptRes.json();
      const upcoming = apptData.appointments?.filter(a => 
        a.status === 'accepted' && new Date(a.appointmentDate) >= new Date()
      ).length || 0;

      // Fetch medications
      const medRes = await fetch(`http://localhost:5001/api/medications-new/active/${userId}`);
      const medData = await medRes.json();

      // Fetch lab tests
      const labRes = await fetch(`http://localhost:5001/api/lab-tests-new/patient/${userId}`);
      const labData = await labRes.json();
      const pending = labData.labTests?.filter(t => t.status !== 'completed').length || 0;

      // Fetch unread messages
      const msgRes = await fetch(`http://localhost:5001/api/messages-new/unread-count/${userId}`);
      const msgData = await msgRes.json();

      setStats({
        upcomingAppointments: upcoming,
        activeMedications: medData.medications?.length || 0,
        pendingLabTests: pending,
        unreadMessages: msgData.count || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="sub">Your health dashboard</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcomingAppointments}</div>
            <div className="stat-label">Upcoming Appointments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeMedications}</div>
            <div className="stat-label">Active Medications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingLabTests}</div>
            <div className="stat-label">Pending Lab Tests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✉️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.unreadMessages}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      <div className="quick-actions-grid">
        <a href="/request-appointment" className="action-card">
          <div className="action-icon">🏥</div>
          <h3>Request Appointment</h3>
          <p>Book teleconsultation or home visit</p>
        </a>

        <a href="/symptom-checker" className="action-card">
          <div className="action-icon">🩺</div>
          <h3>Check Symptoms</h3>
          <p>AI-powered symptom analysis</p>
        </a>

        <a href="/my-medications" className="action-card">
          <div className="action-icon">💊</div>
          <h3>My Medications</h3>
          <p>View and manage medications</p>
        </a>

        <a href="/medical-records" className="action-card">
          <div className="action-icon">📋</div>
          <h3>Medical Records</h3>
          <p>View your health records</p>
        </a>

        <a href="/lab-results" className="action-card">
          <div className="action-icon">🔬</div>
          <h3>Lab Results</h3>
          <p>View test results and reports</p>
        </a>

        <a href="/messages" className="action-card">
          <div className="action-icon">💬</div>
          <h3>Messages</h3>
          <p>Chat with your doctor</p>
        </a>
      </div>
    </div>
  );
}
