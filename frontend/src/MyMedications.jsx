import { useState, useEffect } from 'react';
import './MyMedications.css';

export default function MyMedications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchMedications(userData.userId);
  }, []);

  const fetchMedications = async (userId) => {
    try {
      const res = await fetch(`/api/medications-new/patient/${userId}`);
      const data = await res.json();
      if (data.ok) {
        setMedications(data.medications || []);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isActive = (med) => {
    if (!med.isActive) return false;
    if (med.endDate && new Date(med.endDate) < new Date()) return false;
    return true;
  };

  if (loading) {
    return <div className="medications-loading">Loading medications...</div>;
  }

  return (
    <div className="my-medications">
      <div className="medications-header">
        <h1>💊 My Medications</h1>
        <p>Manage your prescribed medications and treatment plan</p>
      </div>

      {/* Online Pharmacy Section */}
      <div className="online-pharmacy-section">
        <div className="pharmacy-card">
          <div className="pharmacy-header">
            <h2>🏪 Order Medicines Online</h2>
            <p>Get your prescribed medications delivered to your doorstep</p>
          </div>
          <div className="pharmacy-content">
            <a 
              href="https://www.arogga.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pharmacy-link arogga"
            >
              <div className="pharmacy-logo">
                <div className="logo-circle arogga-logo">
                  <span className="logo-text">A</span>
                </div>
              </div>
              <div className="pharmacy-info">
                <h3>Arogga</h3>
                <p>Order medicines from Bangladesh's trusted online pharmacy</p>
                <div className="pharmacy-features">
                  <span className="feature">🚚 Home Delivery</span>
                  <span className="feature">💳 Cash on Delivery</span>
                  <span className="feature">✅ Verified Medicines</span>
                </div>
              </div>
              <div className="pharmacy-arrow">→</div>
            </a>
          </div>
        </div>
      </div>

      {medications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>No Medications Yet</h3>
          <p>Your prescribed medications will appear here once your doctor adds them.</p>
        </div>
      ) : (
        <>
          <div className="medications-grid">
            {medications.filter(isActive).length > 0 && (
              <div className="medication-section">
                <h2 className="section-title">Active Medications</h2>
                {medications.filter(isActive).map(med => (
                  <div key={med._id} className="medication-card active">
                    <div className="med-header">
                      <div>
                        <h3>{med.medicationName}</h3>
                        <span className="status-badge active">Active</span>
                      </div>
                      <div className="med-dosage">{med.dosage}</div>
                    </div>
                    
                    <div className="med-details">
                      <div className="detail-item">
                        <span className="label">Frequency:</span>
                        <span className="value">{med.frequency}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Start Date:</span>
                        <span className="value">{formatDate(med.startDate)}</span>
                      </div>
                      {med.endDate && (
                        <div className="detail-item">
                          <span className="label">End Date:</span>
                          <span className="value">{formatDate(med.endDate)}</span>
                        </div>
                      )}
                      {med.prescribedBy && (
                        <div className="detail-item">
                          <span className="label">Prescribed By:</span>
                          <span className="value">{med.prescribedBy}</span>
                        </div>
                      )}
                    </div>

                    {med.reminderTimes && med.reminderTimes.length > 0 && (
                      <div className="reminder-times">
                        <span className="label">⏰ Reminder Times:</span>
                        <div className="times">
                          {med.reminderTimes.map((time, idx) => (
                            <span key={idx} className="time-badge">{time}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {med.instructions && (
                      <div className="med-instructions">
                        <span className="label">Instructions:</span>
                        <p>{med.instructions}</p>
                      </div>
                    )}

                    {med.reason && (
                      <div className="med-reason">
                        <span className="label">Reason:</span>
                        <p>{med.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {medications.filter(med => !isActive(med)).length > 0 && (
              <div className="medication-section">
                <h2 className="section-title">Completed/Inactive Medications</h2>
                {medications.filter(med => !isActive(med)).map(med => (
                  <div key={med._id} className="medication-card inactive">
                    <div className="med-header">
                      <div>
                        <h3>{med.medicationName}</h3>
                        <span className="status-badge inactive">Completed</span>
                      </div>
                      <div className="med-dosage">{med.dosage}</div>
                    </div>
                    
                    <div className="med-details">
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">
                          {formatDate(med.startDate)} - {med.endDate ? formatDate(med.endDate) : 'Ongoing'}
                        </span>
                      </div>
                      {med.prescribedBy && (
                        <div className="detail-item">
                          <span className="label">Prescribed By:</span>
                          <span className="value">{med.prescribedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
