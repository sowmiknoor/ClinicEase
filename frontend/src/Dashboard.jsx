import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard({ onNavigate }) {
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const userId = localStorage.getItem('userId');

  // State for patient stats
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [scheduledVisits, setScheduledVisits] = useState(0);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentHealthTip, setCurrentHealthTip] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dynamic health tips
  const healthTips = [
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
  ];

  // Fetch patient statistics
  useEffect(() => {
    if (userRole === 'Patient') {
      fetchPatientStats();
    }
    
    // Rotate health tips every 10 seconds
    const tipInterval = setInterval(() => {
      setCurrentHealthTip(prev => (prev + 1) % healthTips.length);
    }, 10000);

    return () => clearInterval(tipInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const fetchPatientStats = async () => {
    try {
      setLoading(true);
      const header = { 'x-user-id': userId };

      // Fetch upcoming medication reminders
      const medRes = await fetch('/api/medications/', { headers: header });
      const medData = await medRes.json();
      if (medData.ok) {
        const activeMeds = medData.medications.filter(m => m.isActive);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Count upcoming reminders today
        let upcomingCount = 0;
        activeMeds.forEach(med => {
          med.reminderTimes.forEach(time => {
            if (time > currentTime) {
              upcomingCount++;
            }
          });
        });
        setUpcomingReminders(upcomingCount);

        // Calculate adherence rate
        let totalDoses = 0;
        let takenDoses = 0;
        activeMeds.forEach(med => {
          if (med.takenDates && med.takenDates.length > 0) {
            totalDoses += med.takenDates.length;
            takenDoses += med.takenDates.filter(t => t.status === 'taken').length;
          }
        });
        const rate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
        setAdherenceRate(rate);
      }

      // Fetch scheduled visits (home visits + tele-consultations)
      const visitRes = await fetch('/api/home-visits/', { headers: header });
      const visitData = await visitRes.json();
      
      const teleRes = await fetch('/api/tele-consultations', { headers: header });
      const teleData = await teleRes.json();

      let visitCount = 0;
      if (visitData.ok) {
        const today = new Date().toISOString().split('T')[0];
        visitCount += visitData.visits.filter(v => 
          v.preferredDate?.startsWith(today) && v.status === 'pending'
        ).length;
      }
      if (teleData.ok) {
        const today = new Date();
        visitCount += teleData.consultations.filter(c => {
          const consultDate = new Date(c.appointmentTime || c.date);
          return consultDate.toDateString() === today.toDateString() && 
                 (c.status === 'scheduled' || c.status === 'pending');
        }).length;
      }
      setScheduledVisits(visitCount);

    } catch (err) {
      console.error('Error fetching patient stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    switch(userRole) {
      case 'Doctor':
        return `Welcome back, Dr. ${userName}`;
      case 'Admin':
        return `Welcome, Administrator ${userName}`;
      default:
        return `Welcome back, ${userName}`;
    }
  };

  const getSubtitle = () => {
    switch(userRole) {
      case 'Doctor':
        return 'Manage patient care, prescriptions, and consultations.';
      case 'Admin':
        return 'System overview and management dashboard.';
      default:
        return 'Your health at a glance — smart, simple, and secure.';
    }
  };

  // Get role-specific theme class
  const getThemeClass = () => {
    switch(userRole) {
      case 'Doctor':
        return 'doctor-theme';
      case 'Admin':
        return 'admin-theme';
      default:
        return 'patient-theme';
    }
  };

  return (
    <div className={`dashboard-root ${getThemeClass()}`}>
      <header className="db-header">
        <div className="db-welcome">
          <h1>{getWelcomeMessage()}</h1>
          <p className="sub">{getSubtitle()}</p>
        </div>
        <div className="db-actions">
          {userRole === 'Patient' && (
            <>
              <button className="primary" onClick={() => onNavigate('medications')}>Manage Medications</button>
              <button className="ghost" onClick={() => onNavigate('visits')}>Request Home Visit</button>
            </>
          )}
          {userRole === 'Doctor' && (
            <>
              <button className="primary" onClick={() => onNavigate('prescriptions')}>Manage Prescriptions</button>
              <button className="ghost" onClick={() => onNavigate('labtests')}>View Lab Tests</button>
            </>
          )}
          {userRole === 'Admin' && (
            <>
              <button className="primary" onClick={() => onNavigate('prescriptions')}>All Prescriptions</button>
              <button className="ghost" onClick={() => onNavigate('billing')}>View Billing</button>
            </>
          )}
        </div>
      </header>

      <section className="db-grid">
        {userRole === 'Patient' && (
          <>
            <div className="card stats">
              <h3>Today</h3>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading stats...</p>
              ) : (
                <div className="stats-row">
                  <div>
                    <p className="big">{upcomingReminders}</p>
                    <p className="label">Upcoming Reminders</p>
                  </div>
                  <div>
                    <p className="big">{scheduledVisits}</p>
                    <p className="label">Scheduled Visits</p>
                  </div>
                  <div>
                    <p className="big">{adherenceRate}%</p>
                    <p className="label">Adherence Rate</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card quick">
              <h3>Quick Actions</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('medications')}>Add Medication</button>
                <button onClick={() => onNavigate('symptom')}>Symptom Check</button>
                <button onClick={() => onNavigate('home-visits')}>Home Visit</button>
                <button onClick={() => onNavigate('tele')}>Tele-Consult</button>
              </div>
            </div>

            <div className="card tips">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>Health Tips</h3>
                <span style={{ fontSize: '12px', color: '#666' }}>Auto-rotating every 10s</span>
              </div>
              <div style={{ 
                minHeight: '80px', 
                display: 'flex', 
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                borderLeft: '4px solid #10b981',
                transition: 'all 0.5s ease'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  lineHeight: '1.6',
                  color: '#047857'
                }}>
                  {healthTips[currentHealthTip]}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '6px', 
                marginTop: '12px' 
              }}>
                {healthTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHealthTip(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: currentHealthTip === index ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {userRole === 'Doctor' && (
          <>
            <div className="card stats">
              <h3>Patient Stats</h3>
              <div className="stats-row">
                <div>
                  <p className="big">12</p>
                  <p className="label">Active Patients</p>
                </div>
                <div>
                  <p className="big">8</p>
                  <p className="label">Pending Prescriptions</p>
                </div>
                <div>
                  <p className="big">3</p>
                  <p className="label">Consultations Today</p>
                </div>
              </div>
            </div>

            <div className="card quick">
              <h3>Quick Management</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('prescriptions')}>New Prescription</button>
                <button onClick={() => onNavigate('labtests')}>Order Lab Test</button>
                <button onClick={() => onNavigate('billing')}>Create Invoice</button>
                <button onClick={() => onNavigate('messages')}>View Messages</button>
              </div>
            </div>

            <div className="card tips">
              <h3>Doctor Tools</h3>
              <ul>
                <li>Review patient medical records and history.</li>
                <li>Create prescriptions and manage medications.</li>
                <li>Schedule and conduct tele-consultations.</li>
              </ul>
            </div>
          </>
        )}

        {userRole === 'Admin' && (
          <>
            <div className="card stats">
              <h3>System Overview</h3>
              <div className="stats-row">
                <div>
                  <p className="big">156</p>
                  <p className="label">Total Users</p>
                </div>
                <div>
                  <p className="big">42</p>
                  <p className="label">Active Doctors</p>
                </div>
                <div>
                  <p className="big">₹1.2L</p>
                  <p className="label">Monthly Revenue</p>
                </div>
              </div>
            </div>

            <div className="card quick">
              <h3>Admin Actions</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('prescriptions')}>All Prescriptions</button>
                <button onClick={() => onNavigate('billing')}>Billing Reports</button>
                <button onClick={() => onNavigate('records')}>Medical Records</button>
                <button onClick={() => onNavigate('messages')}>System Messages</button>
              </div>
            </div>

            <div className="card tips">
              <h3>System Health</h3>
              <ul>
                <li>Database: Healthy ✓</li>
                <li>API Servers: All Online ✓</li>
                <li>User Sessions: 24 Active ✓</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
