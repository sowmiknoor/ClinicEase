import './Dashboard.css';

export default function Dashboard({ onNavigate }) {
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Patient';

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

  return (
    <div className="dashboard-root">
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
                <button onClick={() => onNavigate('symptom')}>Symptom Check</button>
                <button onClick={() => onNavigate('visits')}>Home Visit</button>
                <button onClick={() => onNavigate('tele')}>Tele-Consult</button>
              </div>
            </div>

            <div className="card tips">
              <h3>Health Tips</h3>
              <ul>
                <li>Drink water regularly — aim for 8 glasses/day.</li>
                <li>Take medications on time for best results.</li>
                <li>Keep a log of symptoms for consultations.</li>
              </ul>
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
