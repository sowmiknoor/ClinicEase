import { useState, useEffect } from 'react';
import './MedicationReminder.css';

export default function MedicationReminder() {
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [adherenceReport, setAdherenceReport] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);

  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Once daily',
    reminderTimes: ['08:00'],
    startDate: '',
    endDate: '',
    prescribedBy: '',
    reason: '',
    sideEffects: [],
    notes: ''
  });

  const userId = localStorage.getItem('userId');

  // Fetch medications
  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/medications/', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setMedications(data.medications);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherenceReport = async () => {
    try {
      const response = await fetch('/api/medications/report/adherence', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setAdherenceReport(data.report);
        setActiveTab('report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRemindersChange = (index, value) => {
    const newTimes = [...formData.reminderTimes];
    newTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      reminderTimes: newTimes
    }));
  };

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, '12:00']
    }));
  };

  const removeReminderTime = (index) => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/medications/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.ok) {
        alert('Medication added successfully!');
        setFormData({
          medicationName: '',
          dosage: '',
          frequency: 'Once daily',
          reminderTimes: ['08:00'],
          startDate: '',
          endDate: '',
          prescribedBy: '',
          reason: '',
          sideEffects: [],
          notes: ''
        });
        setShowForm(false);
        fetchMedications();
      } else {
        alert('Error adding medication: ' + data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding medication');
    }
  };

  const markAsTaken = async (medicationId) => {
    try {
      const response = await fetch(`/api/medications/${medicationId}/taken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.ok) {
        alert('Marked as taken!');
        fetchMedications();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const markAsMissed = async (medicationId) => {
    try {
      const response = await fetch(`/api/medications/${medicationId}/missed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.ok) {
        alert('Marked as missed!');
        fetchMedications();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deactivateMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to deactivate this medication?')) {
      try {
        const response = await fetch(`/api/medications/${medicationId}/deactivate`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          }
        });
        const data = await response.json();
        if (data.ok) {
          alert('Medication deactivated!');
          fetchMedications();
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const deleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const response = await fetch(`/api/medications/${medicationId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': userId }
        });
        const data = await response.json();
        if (data.ok) {
          alert('Medication deleted!');
          fetchMedications();
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const activeMeds = medications.filter(m => m.isActive);
  const inactiveMeds = medications.filter(m => !m.isActive);

  return (
    <div className="medication-reminder-container">
      <h1>💊 Medication Reminder System</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Medications
        </button>
        <button
          className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          Inactive ({inactiveMeds.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={fetchAdherenceReport}
        >
          Adherence Report
        </button>
      </div>

      {/* Online Medicine Store Banner */}
      <div style={{
        backgroundColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>
            🛒 Order Your Medicines Online
          </h3>
          <p style={{ margin: '0', opacity: '0.95', fontSize: '14px' }}>
            Get your prescribed medications delivered to your doorstep with Arogga - Bangladesh's trusted online pharmacy
          </p>
        </div>
        <a 
          href="https://www.arogga.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            backgroundColor: 'white',
            color: '#059669',
            padding: '12px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
          }}
        >
          Visit Arogga Store →
        </a>
      </div>

      {activeTab === 'active' && (
        <div className="tab-content">
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Medication'}
          </button>

          {showForm && (
            <form className="medication-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="medicationName"
                  placeholder="Medication Name *"
                  value={formData.medicationName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="dosage"
                  placeholder="Dosage (e.g., 500mg) *"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Thrice daily</option>
                  <option>Every 4 hours</option>
                  <option>Every 6 hours</option>
                  <option>Every 8 hours</option>
                  <option>Every 12 hours</option>
                  <option>As needed</option>
                </select>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="reminder-times">
                <label>Reminder Times *</label>
                {formData.reminderTimes.map((time, index) => (
                  <div key={index} className="time-input-group">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleRemindersChange(index, e.target.value)}
                      required
                    />
                    {formData.reminderTimes.length > 1 && (
                      <button
                        type="button"
                        className="remove-time-btn"
                        onClick={() => removeReminderTime(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-time-btn"
                  onClick={addReminderTime}
                >
                  + Add Time
                </button>
              </div>

              <div className="form-row">
                <input
                  type="date"
                  name="endDate"
                  placeholder="End Date (Optional)"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="prescribedBy"
                  placeholder="Prescribed By"
                  value={formData.prescribedBy}
                  onChange={handleInputChange}
                />
              </div>

              <textarea
                name="reason"
                placeholder="Reason for medication"
                value={formData.reason}
                onChange={handleInputChange}
                rows="2"
              />

              <textarea
                name="notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
              />

              <button type="submit" className="submit-btn">
                Save Medication
              </button>
            </form>
          )}

          {loading ? (
            <p className="loading">Loading medications...</p>
          ) : activeMeds.length > 0 ? (
            <div className="medications-grid">
              {activeMeds.map(med => (
                <div key={med._id} className="medication-card">
                  <div className="med-header">
                    <h3>{med.medicationName}</h3>
                    <span className="badge">{med.frequency}</span>
                  </div>
                  <div className="med-details">
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    <p><strong>Times:</strong> {med.reminderTimes.join(', ')}</p>
                    {med.prescribedBy && (
                      <p><strong>Prescribed by:</strong> {med.prescribedBy}</p>
                    )}
                    {med.reason && (
                      <p><strong>Reason:</strong> {med.reason}</p>
                    )}
                    <p className="start-date">
                      <strong>Started:</strong> {new Date(med.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="med-actions">
                    <button
                      className="action-btn taken"
                      onClick={() => markAsTaken(med._id)}
                    >
                      ✓ Taken
                    </button>
                    <button
                      className="action-btn missed"
                      onClick={() => markAsMissed(med._id)}
                    >
                      ✗ Missed
                    </button>
                    <a
                      href={`https://www.arogga.com/search?q=${encodeURIComponent(med.medicationName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn order-online"
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      🛒 Order
                    </a>
                    <button
                      className="action-btn deactivate"
                      onClick={() => deactivateMedication(med._id)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No active medications. Add one to get started!</p>
          )}
        </div>
      )}

      {activeTab === 'inactive' && (
        <div className="tab-content">
          {inactiveMeds.length > 0 ? (
            <div className="medications-grid">
              {inactiveMeds.map(med => (
                <div key={med._id} className="medication-card inactive">
                  <div className="med-header">
                    <h3>{med.medicationName}</h3>
                    <span className="badge inactive">Inactive</span>
                  </div>
                  <div className="med-details">
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    <p><strong>Frequency:</strong> {med.frequency}</p>
                  </div>
                  <div className="med-actions">
                    <button
                      className="action-btn delete"
                      onClick={() => deleteMedication(med._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No inactive medications.</p>
          )}
        </div>
      )}

      {activeTab === 'report' && adherenceReport && (
        <div className="tab-content">
          <div className="adherence-report">
            <h2>Medication Adherence Report</h2>
            <div className="report-grid">
              {adherenceReport.map(med => (
                <div key={med.medicationId} className="report-card">
                  <h3>{med.medicationName}</h3>
                  <p className="dosage">{med.dosage}</p>
                  <div className="adherence-stats">
                    <div className="stat">
                      <span className="label">Total Records:</span>
                      <span className="value">{med.totalRecords}</span>
                    </div>
                    <div className="stat taken">
                      <span className="label">✓ Taken:</span>
                      <span className="value">{med.taken}</span>
                    </div>
                    <div className="stat missed">
                      <span className="label">✗ Missed:</span>
                      <span className="value">{med.missed}</span>
                    </div>
                    <div className="stat skipped">
                      <span className="label">⊘ Skipped:</span>
                      <span className="value">{med.skipped}</span>
                    </div>
                  </div>
                  <div className="adherence-rate">
                    <span className="rate">{med.adherenceRate}</span>
                    <span className="label">Adherence Rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
