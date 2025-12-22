import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import LanguageToggle from './LanguageToggle';
import './Dashboard.css';

export default function Dashboard({ onNavigate }) {
  const { t } = useLanguage();
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const userId = localStorage.getItem('userId');

  // State for patient stats
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [scheduledVisits, setScheduledVisits] = useState(0);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentHealthTip, setCurrentHealthTip] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get dynamic health tips from translations
  const healthTips = t('healthTips');

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
        return `${t('welcomeMessage')}, ${t('doctor')} ${userName}`;
      case 'Admin':
        return `${t('welcome')}, ${t('admin')} ${userName}`;
      default:
        return `${t('welcomeMessage')}, ${userName}`;
    }
  };

  const getSubtitle = () => {
    switch(userRole) {
      case 'Doctor':
        return t('doctorSubtitle') || 'Manage patient care, prescriptions, and consultations.';
      case 'Admin':
        return t('adminSubtitle') || 'System overview and management dashboard.';
      default:
        return t('patientSubtitle') || 'Your health at a glance — smart, simple, and secure.';
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
          <LanguageToggle />
          {userRole === 'Patient' && (
            <>
              <button className="primary" onClick={() => onNavigate('medications')}>{t('medications')}</button>
              <button className="ghost" onClick={() => onNavigate('visits')}>{t('requestHomeVisit')}</button>
            </>
          )}
          {userRole === 'Doctor' && (
            <>
              <button className="primary" onClick={() => onNavigate('prescriptions')}>{t('prescriptions')}</button>
              <button className="ghost" onClick={() => onNavigate('labtests')}>{t('labTests')}</button>
            </>
          )}
          {userRole === 'Admin' && (
            <>
              <button className="primary" onClick={() => onNavigate('prescriptions')}>{t('prescriptions')}</button>
              <button className="ghost" onClick={() => onNavigate('billing')}>{t('billing')}</button>
            </>
          )}
        </div>
      </header>

      <section className="db-grid">
        {userRole === 'Patient' && (
          <>
            <div className="card stats">
              <h3>{t('today')}</h3>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{t('loadingData')}</p>
              ) : (
                <div className="stats-row">
                  <div>
                    <p className="big">{upcomingReminders}</p>
                    <p className="label">{t('upcomingReminders')}</p>
                  </div>
                  <div>
                    <p className="big">{scheduledVisits}</p>
                    <p className="label">{t('scheduledVisits')}</p>
                  </div>
                  <div>
                    <p className="big">{adherenceRate}%</p>
                    <p className="label">{t('adherenceRate')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card quick">
              <h3>{t('quickActions')}</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('medications')}>{t('addMedication')}</button>
                <button onClick={() => onNavigate('symptom')}>{t('checkSymptoms')}</button>
                <button onClick={() => onNavigate('home-visits')}>{t('requestHomeVisit')}</button>
                <button onClick={() => onNavigate('tele')}>{t('teleConsult')}</button>
              </div>
            </div>

            <div className="card tips">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>{t('healthTip')}</h3>
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
              <h3>{t('recentPatients')}</h3>
              <div className="stats-row">
                <div>
                  <p className="big">12</p>
                  <p className="label">{t('totalPatients')}</p>
                </div>
                <div>
                  <p className="big">8</p>
                  <p className="label">{t('pendingConsultations')}</p>
                </div>
                <div>
                  <p className="big">3</p>
                  <p className="label">{t('todaysAppointments')}</p>
                </div>
              </div>
            </div>

            <div className="card quick">
              <h3>{t('quickActions')}</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('prescriptions')}>{t('prescriptions')}</button>
                <button onClick={() => onNavigate('labtests')}>{t('bookLabTest')}</button>
                <button onClick={() => onNavigate('billing')}>{t('billing')}</button>
                <button onClick={() => onNavigate('messages')}>{t('messages')}</button>
              </div>
            </div>

            <div className="card tips">
              <h3>{t('doctor')} {t('quickActions')}</h3>
              <ul>
                <li>{t('medicalHistory')}</li>
                <li>{t('prescriptions')}</li>
                <li>{t('teleConsult')}</li>
              </ul>
            </div>
          </>
        )}

        {userRole === 'Admin' && (
          <>
            <div className="card stats">
              <h3>{t('systemHealth')}</h3>
              <div className="stats-row">
                <div>
                  <p className="big">156</p>
                  <p className="label">{t('totalUsers')}</p>
                </div>
                <div>
                  <p className="big">42</p>
                  <p className="label">{t('totalDoctors')}</p>
                </div>
                <div>
                  <p className="big">₹1.2L</p>
                  <p className="label">{t('amount')}</p>
                </div>
              </div>
            </div>

            <div className="card quick">
              <h3>{t('adminDashboard')}</h3>
              <div className="quick-grid">
                <button onClick={() => onNavigate('prescriptions')}>{t('prescriptions')}</button>
                <button onClick={() => onNavigate('billing')}>{t('reports')}</button>
                <button onClick={() => onNavigate('records')}>{t('medicalRecords')}</button>
                <button onClick={() => onNavigate('messages')}>{t('messages')}</button>
              </div>
            </div>

            <div className="card tips">
              <h3>{t('systemHealth')}</h3>
              <ul>
                <li>Database: {t('active')} ✓</li>
                <li>API Servers: {t('active')} ✓</li>
                <li>User Sessions: 24 {t('active')} ✓</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
