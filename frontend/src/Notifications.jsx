import { useEffect, useState } from 'react';
import './Care.css';

export default function Notifications() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all'); // all, medication, tele-consult, lab-test
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: header });
      const data = await res.json();
      if (data.ok) setList(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const createAutoNotification = async (title, body, category) => {
    try {
      // Check if notification exists (prevent duplicates within 1 hour)
      const hour = 1000 * 60 * 60;
      const recentNotif = list.find(
        n => n.title === title && new Date(n.createdAt) > new Date(Date.now() - hour)
      );
      if (recentNotif) return; // Skip duplicate

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: header,
        body: JSON.stringify({ title, body, category })
      });
      const data = await res.json();
      if (data.ok) {
        setList(prev => [data.notification, ...prev]);
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  const checkMedicationReminders = async () => {
    try {
      const res = await fetch('/api/medications', { headers: header });
      const data = await res.json();
      if (data.ok && data.medications) {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        data.medications.forEach(med => {
          if (!med.isActive) return;

          med.reminderTimes.forEach(reminderTime => {
            // Check for exact time match (within 1 minute window)
            if (reminderTime === currentTime) {
              // Check if already taken today
              const today = new Date().toISOString().split('T')[0];
              const takenToday = med.takenDates?.some(
                t => new Date(t.date).toISOString().split('T')[0] === today && t.status === 'taken'
              );

              if (!takenToday) {
                createAutoNotification(
                  '💊 Medication Time',
                  `Time to take ${med.medicationName} (${med.dosage}) at ${reminderTime}`,
                  'medication'
                );
              }
            }

            // Check for missed medication (15 minutes after scheduled time)
            const [medHour, medMin] = reminderTime.split(':').map(Number);
            const [nowHour, nowMin] = currentTime.split(':').map(Number);
            const medTotalMin = medHour * 60 + medMin;
            const nowTotalMin = nowHour * 60 + nowMin;
            const diff = nowTotalMin - medTotalMin;

            if (diff === 15) {
              const today = new Date().toISOString().split('T')[0];
              const recordedToday = med.takenDates?.some(
                t => new Date(t.date).toISOString().split('T')[0] === today
              );

              if (!recordedToday) {
                createAutoNotification(
                  '⚠️ Missed Medication',
                  `You missed ${med.medicationName} at ${reminderTime}. Please take it now if possible.`,
                  'medication'
                );
              }
            }
          });
        });
      }
    } catch (err) {
      console.error('Error checking medications:', err);
    }
  };

  const checkTeleConsultations = async () => {
    try {
      const res = await fetch('/api/tele-consultations', { headers: header });
      const data = await res.json();
      if (data.ok && data.consultations) {
        const now = new Date();
        data.consultations.forEach(consult => {
          const consultDate = new Date(consult.appointmentTime || consult.date);
          const timeDiff = consultDate - now;
          const minutesDiff = timeDiff / (1000 * 60);

          // Notify 60 minutes before consultation
          if (minutesDiff > 0 && minutesDiff <= 60) {
            createAutoNotification(
              '🩺 Tele-Consultation Reminder',
              `Your consultation with Dr. ${consult.doctorName || consult.doctor || 'Unknown'} is in ${Math.round(minutesDiff)} minutes`,
              'tele-consult'
            );
          }
        });
      }
    } catch (err) {
      console.error('Error checking consultations:', err);
    }
  };

  const checkLabTestResults = async () => {
    try {
      const res = await fetch('/api/lab-tests', { headers: header });
      const data = await res.json();
      if (data.ok && data.labTests) {
        data.labTests.forEach(test => {
          if (test.status === 'completed') {
            const updatedAt = new Date(test.updatedAt);
            const now = new Date();
            const minutesDiff = (now - updatedAt) / (1000 * 60);

            // Notify if results just completed (within last 5 minutes)
            if (minutesDiff >= 0 && minutesDiff < 5) {
              createAutoNotification(
                '🧪 Lab Test Results Ready',
                `Your ${test.testName || 'lab test'} results are now available.`,
                'lab-test'
              );
            }
          }
        });
      }
    } catch (err) {
      console.error('Error checking lab tests:', err);
    }
  };

  // Setup automatic checks
  useEffect(() => {
    fetchNotifications();

    if (userRole === 'Patient') {
      // Initial checks
      checkMedicationReminders();
      checkTeleConsultations();
      checkLabTestResults();

      // Check medications every minute
      const medInterval = setInterval(checkMedicationReminders, 60000);
      // Check consultations every 5 minutes
      const consultInterval = setInterval(checkTeleConsultations, 300000);
      // Check lab tests every 10 minutes
      const labInterval = setInterval(checkLabTestResults, 600000);

      return () => {
        clearInterval(medInterval);
        clearInterval(consultInterval);
        clearInterval(labInterval);
      };
    }
  }, []);

  const send = async (e) => {
    e.preventDefault();
    const payload = { title, body, userId: targetUser || userId };
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        setTitle('');
        setBody('');
        setTargetUser('');
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: header });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const filteredList = filter === 'all'
    ? list
    : list.filter(n => n.category === filter);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { 
        method: 'PATCH', 
        headers: header 
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>🔔 Notifications</h2>
          <p className="subtitle">Stay updated with medication reminders, appointments, and test results.</p>
        </div>
      </div>

      {userRole !== 'Patient' && (
        <form className="card" onSubmit={send}>
          <h4>Send Notification</h4>
          <div className="row">
            <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <input className="input" placeholder="Target User ID (optional)" value={targetUser} onChange={e => setTargetUser(e.target.value)} />
          </div>
          <textarea className="input" placeholder="Message" value={body} onChange={e => setBody(e.target.value)} required rows="3" />
          <button className="btn" type="submit">Send</button>
        </form>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4>Your Notifications ({list.filter(n => !n.read).length} unread)</h4>
          {list.some(n => !n.read) && (
            <button className="btn-outline" onClick={markAllRead}>Mark All Read</button>
          )}
        </div>

        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'medication' ? 'active' : ''}`}
            onClick={() => setFilter('medication')}
          >
            💊 Medications
          </button>
          <button
            className={`filter-btn ${filter === 'tele-consult' ? 'active' : ''}`}
            onClick={() => setFilter('tele-consult')}
          >
            🩺 Tele-Consult
          </button>
          <button
            className={`filter-btn ${filter === 'lab-test' ? 'active' : ''}`}
            onClick={() => setFilter('lab-test')}
          >
            🧪 Lab Tests
          </button>
        </div>

        <ul className="list notification-list">
          {filteredList.map(n => (
            <li key={n._id} className={`list-item notification-item ${n.read ? 'read' : 'unread'}`}>
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-status">{n.read ? '✓' : '●'}</span>
                  <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <div className="notification-title">{n.title}</div>
                <div className="notification-body">{n.body}</div>
              </div>
              {!n.read && (
                <button className="btn-outline" onClick={() => markRead(n._id)}>Mark Read</button>
              )}
            </li>
          ))}
          {filteredList.length === 0 && <li className="empty">No notifications in this category.</li>}
        </ul>
      </div>
    </div>
  );
}
