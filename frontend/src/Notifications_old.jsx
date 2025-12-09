import { useEffect, useState } from 'react';
import './Care.css';

export default function Notifications() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all'); // all, medication, telehealth, labtest
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications', { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.notifications || []);
  };

  const checkMedicationReminders = async () => {
    try {
      const res = await fetch('/api/medications', { headers: header });
      const data = await res.json();
      if (data.ok && data.medications) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        data.medications.forEach(med => {
          const [hour, minute] = med.time.split(':').map(Number);
          const timeDiff = (hour * 60 + minute) - (currentHour * 60 + currentMinute);
          
          // Notify 30 minutes before medication time
          if (timeDiff === 30) {
            createAutoNotification(
              '💊 Medication Reminder',
              `Time to take ${med.name} in 30 minutes (${med.dosage})`,
              'medication'
            );
          }
          // Notify if medication is missed (15 minutes after scheduled time)
          if (timeDiff === -15) {
            createAutoNotification(
              '⚠️ Medication Missed',
              `You missed your ${med.name} dose at ${med.time}. Please take it as soon as possible.`,
              'medication'
            );
          }
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
          const consultDate = new Date(consult.date);
          const timeDiff = consultDate - now;
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Notify 1 hour before consultation
          if (hoursDiff > 0 && hoursDiff <= 1) {
            createAutoNotification(
              '🩺 Tele-Consultation Reminder',
              `Your consultation with Dr. ${consult.doctorName || 'Unknown'} is in ${Math.round(hoursDiff * 60)} minutes`,
              'telehealth'
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
      if (data.ok && data.tests) {
        data.tests.forEach(test => {
          if (test.status === 'completed' && !test.notified) {
            createAutoNotification(
              '🧪 Lab Test Result Ready',
              `Your ${test.testName} results are ready. Please check your Lab Tests section.`,
              'labtest'
            );
          }
        });
      }
    } catch (err) {
      console.error('Error checking lab tests:', err);
    }
  };

  const createAutoNotification = async (title, body, category) => {
    // Check if similar notification already exists in last hour
    const recentNotif = list.find(n => 
      n.title === title && 
      new Date(n.createdAt) > new Date(Date.now() - 3600000)
    );
    
    if (recentNotif) return; // Don't duplicate
    
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: header,
        body: JSON.stringify({ title, body, userId, category })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    if (userRole === 'Patient') {
      // Initial checks
      checkMedicationReminders();
      checkTeleConsultations();
      checkLabTestResults();
      
      // Set up periodic checks
      const medicationInterval = setInterval(checkMedicationReminders, 60000); // Every minute
      const consultInterval = setInterval(checkTeleConsultations, 300000); // Every 5 minutes
      const labInterval = setInterval(checkLabTestResults, 600000); // Every 10 minutes
      
      return () => {
        clearInterval(medicationInterval);
        clearInterval(consultInterval);
        clearInterval(labInterval);
      };
    }
  }, []);

  const send = async (e) => {
    e.preventDefault();
    const payload = { title, body, userId: targetUser || userId };
    const res = await fetch('/api/notifications', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setTitle(''); setBody(''); setTargetUser(''); fetchNotifications(); }
  };

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: header });
    fetchNotifications();
  };

  const filteredList = filter === 'all' 
    ? list 
    : list.filter(n => n.category === filter || (!n.category && filter === 'all'));

  const markAllRead = async () => {
    const unreadIds = list.filter(n => !n.read).map(n => n._id);
    for (const id of unreadIds) {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: header });
    }
    fetchNotifications();
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
            <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
            <input className="input" placeholder="Target User ID (opt.)" value={targetUser} onChange={e=>setTargetUser(e.target.value)} />
          </div>
          <textarea className="input" placeholder="Message" value={body} onChange={e=>setBody(e.target.value)} required />
          <button className="btn" type="submit">Send</button>
        </form>
      )}

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
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
            className={`filter-btn ${filter === 'telehealth' ? 'active' : ''}`}
            onClick={() => setFilter('telehealth')}
          >
            🩺 Tele-Consult
          </button>
          <button 
            className={`filter-btn ${filter === 'labtest' ? 'active' : ''}`}
            onClick={() => setFilter('labtest')}
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
                <button className="btn-outline" onClick={()=>markRead(n._id)}>Mark Read</button>
              )}
            </li>
          ))}
          {filteredList.length===0 && <li className="empty">No notifications in this category.</li>}
        </ul>
      </div>
    </div>
  );
}
