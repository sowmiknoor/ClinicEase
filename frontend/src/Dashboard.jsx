import './Dashboard.css';

export default function Dashboard({ onNavigate }) {
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="dashboard-root">
      <header className="db-header">
        <div className="db-welcome">
          <h1>Welcome back, <span className="accent">{userName}</span></h1>
          <p className="sub">Your health at a glance — smart, simple, and secure.</p>
        </div>
        <div className="db-actions">
          <button className="primary" onClick={() => onNavigate('medications')}>Manage Medications</button>
          <button className="ghost" onClick={() => onNavigate('visits')}>Request Home Visit</button>
        </div>
      </header>

      <section className="db-grid">
        <div className="card stats">
          <h3>Today</h3>
          <div className="stats-row">
            <div>
              <p className="big">2</p>
              <p className="label">Upcoming Reminders</p>
            </div>
            <div>
              <p className="big">1</p>
              <p className="label">Scheduled Visits</p>
            </div>
            <div>
              <p className="big">89%</p>
              <p className="label">Adherence Rate</p>
            </div>
          </div>
        </div>

        <div className="card quick">
          <h3>Quick Actions</h3>
          <div className="quick-grid">
            <button onClick={() => onNavigate('medications')}>Add Medication</button>
            <button onClick={() => onNavigate('symptom')}>Run Symptom Checker</button>
            <button onClick={() => onNavigate('visits')}>Request Home Visit</button>
            <button onClick={() => onNavigate('reports')}>View Reports</button>
          </div>
        </div>

        <div className="card tips">
          <h3>Health Tips</h3>
          <ul>
            <li>Drink water regularly — aim for 8 glasses/day.</li>
            <li>Take medications on time for best results.</li>
            <li>Keep a log of symptoms for tele-consultations.</li>
          </ul>
        </div>

        <div className="card promo">
          <h3>Nearby Services</h3>
          <p>Send prescriptions to local pharmacies and get deliveries.</p>
          <div className="card-cta">
            <button onClick={() => onNavigate('pharmacy')}>Send Prescription</button>
          </div>
        </div>
      </section>
    </div>
  );
}
