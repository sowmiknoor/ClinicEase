import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './MedicationReminder.css';

export default function MedicationReminder() {
  const { t } = useLanguage();
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineResults, setMedicineResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Once daily',
    timesPerDay: 1,
    reminderTimes: ['08:00'],
    startDate: '',
    endDate: '',
    prescribedBy: '',
    reason: '',
    notes: ''
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchMedications();
  }, []);

  // Search medicines from database
  const searchMedicines = async (query) => {
    if (query.length < 2) {
      setMedicineResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.ok && data.medicines) {
        setMedicineResults(data.medicines.slice(0, 10)); // Show top 10 results
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);
    }
  };

  const selectMedicine = (medicine) => {
    setFormData(prev => ({
      ...prev,
      medicationName: medicine.name,
      dosage: medicine.strength || ''
    }));
    setMedicineSearch(medicine.name);
    setShowSearchResults(false);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update reminder times based on frequency
    if (name === 'timesPerDay') {
      const times = parseInt(value) || 1;
      const defaultTimes = generateDefaultTimes(times);
      setFormData(prev => ({
        ...prev,
        reminderTimes: defaultTimes
      }));
    }
  };

  const generateDefaultTimes = (count) => {
    const times = [];
    const hoursGap = Math.floor(24 / count);
    for (let i = 0; i < count; i++) {
      const hour = (8 + (i * hoursGap)) % 24;
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
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
      reminderTimes: [...prev.reminderTimes, '12:00'],
      timesPerDay: prev.reminderTimes.length + 1
    }));
  };

  const removeReminderTime = (index) => {
    if (formData.reminderTimes.length > 1) {
      setFormData(prev => ({
        ...prev,
        reminderTimes: prev.reminderTimes.filter((_, i) => i !== index),
        timesPerDay: prev.reminderTimes.length - 1
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medicationName || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/medications/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          ...formData,
          taken: 0,
          missed: 0,
          isActive: true
        })
      });
      const data = await response.json();
      if (data.ok) {
        alert('Medication added successfully!');
        setFormData({
          medicationName: '',
          dosage: '',
          frequency: 'Once daily',
          timesPerDay: 1,
          reminderTimes: ['08:00'],
          startDate: '',
          endDate: '',
          prescribedBy: '',
          reason: '',
          notes: ''
        });
        setMedicineSearch('');
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
        body: JSON.stringify({ timestamp: new Date() })
      });
      const data = await response.json();
      if (data.ok) {
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
        body: JSON.stringify({ timestamp: new Date() })
      });
      const data = await response.json();
      if (data.ok) {
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

  // Calculate adherence percentage
  const calculateAdherence = (med) => {
    const total = (med.taken || 0) + (med.missed || 0);
    if (total === 0) return 0;
    return Math.round((med.taken / total) * 100);
  };

  // Calculate expected doses
  const calculateExpectedDoses = (med) => {
    const start = new Date(med.startDate);
    const now = new Date();
    const end = new Date(med.endDate);
    
    const currentDate = now < end ? now : end;
    const daysPassed = Math.ceil((currentDate - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return daysPassed * (med.timesPerDay || med.reminderTimes?.length || 1);
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return '#10b981'; // Green
    if (percentage >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const activeMeds = medications.filter(m => m.isActive);
  const inactiveMeds = medications.filter(m => !m.isActive);

  return (
    <div className="medication-reminder-container">
      <div className="medication-header">
        <h1>💊 Medication Tracker</h1>
        <button 
          className="add-medication-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Medication'}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Medications ({activeMeds.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          Deactivated ({inactiveMeds.length})
        </button>
      </div>

      {/* Add Medication Form */}
      {showForm && (
        <div className="medication-form-card">
          <h2>Add New Medication</h2>
          <form onSubmit={handleSubmit} className="medication-form">
            {/* Medicine Search with Autocomplete */}
            <div className="form-group-full">
              <label>Medicine Name *</label>
              <div className="medicine-search-wrapper">
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => {
                    setMedicineSearch(e.target.value);
                    searchMedicines(e.target.value);
                    setFormData(prev => ({ ...prev, medicationName: e.target.value }));
                  }}
                  placeholder="Search medicine (e.g., Napa, Paracetamol)"
                  required
                  autoComplete="off"
                />
                {showSearchResults && medicineResults.length > 0 && (
                  <div className="medicine-search-results">
                    {medicineResults.map((medicine, index) => (
                      <div
                        key={index}
                        className="medicine-result-item"
                        onClick={() => selectMedicine(medicine)}
                      >
                        <div className="medicine-result-name">{medicine.name}</div>
                        <div className="medicine-result-details">
                          {medicine.strength && <span>{medicine.strength}</span>}
                          {medicine.genericName && <span className="generic">({medicine.genericName})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dosage (e.g., 500mg) *</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="500mg"
                  required
                />
              </div>

              <div className="form-group">
                <label>Times Per Day *</label>
                <select
                  name="timesPerDay"
                  value={formData.timesPerDay}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">Once daily</option>
                  <option value="2">Twice daily</option>
                  <option value="3">Three times daily</option>
                  <option value="4">Four times daily</option>
                  <option value="6">Six times daily</option>
                </select>
              </div>
            </div>

            {/* Reminder Times */}
            <div className="form-group-full">
              <label>Reminder Times *</label>
              <div className="reminder-times-list">
                {formData.reminderTimes.map((time, index) => (
                  <div key={index} className="reminder-time-input">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleRemindersChange(index, e.target.value)}
                      required
                    />
                    {formData.reminderTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReminderTime(index)}
                        className="remove-time-btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReminderTime}
                  className="add-time-btn"
                >
                  + Add Time
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prescribed By</label>
                <input
                  type="text"
                  name="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={handleInputChange}
                  placeholder="Dr. Smith"
                />
              </div>

              <div className="form-group">
                <label>Reason for medication</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Fever, Pain, etc."
                />
              </div>
            </div>

            <div className="form-group-full">
              <label>Additional notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Take with food, avoid alcohol, etc."
                rows="3"
              />
            </div>

            <button type="submit" className="save-medication-btn">
              💾 Save Medication
            </button>
          </form>
        </div>
      )}

      {/* Active Medications List */}
      {activeTab === 'active' && (
        <div className="medications-grid">
          {loading ? (
            <p>Loading medications...</p>
          ) : activeMeds.length === 0 ? (
            <div className="empty-state">
              <p>No active medications found.</p>
              <p>Click "Add Medication" to get started!</p>
            </div>
          ) : (
            activeMeds.map((med) => {
              const adherence = calculateAdherence(med);
              const expected = calculateExpectedDoses(med);
              const actual = (med.taken || 0) + (med.missed || 0);
              
              return (
                <div key={med._id} className="medication-card">
                  <div className="medication-card-header">
                    <h3>{med.medicationName}</h3>
                    <span className="dosage-badge">{med.dosage}</span>
                  </div>

                  <div className="medication-details">
                    <div className="detail-row">
                      <span className="label">Schedule:</span>
                      <span className="value">{med.timesPerDay || med.reminderTimes?.length} times/day</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Times:</span>
                      <span className="value">{med.reminderTimes?.join(', ')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Duration:</span>
                      <span className="value">
                        {new Date(med.startDate).toLocaleDateString()} - {new Date(med.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {med.prescribedBy && (
                      <div className="detail-row">
                        <span className="label">Prescribed by:</span>
                        <span className="value">{med.prescribedBy}</span>
                      </div>
                    )}
                    {med.reason && (
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span className="value">{med.reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Tracking Stats */}
                  <div className="tracking-stats">
                    <div className="stat-box taken">
                      <div className="stat-value">{med.taken || 0}</div>
                      <div className="stat-label">Taken</div>
                    </div>
                    <div className="stat-box missed">
                      <div className="stat-value">{med.missed || 0}</div>
                      <div className="stat-label">Missed</div>
                    </div>
                    <div className="stat-box expected">
                      <div className="stat-value">{expected}</div>
                      <div className="stat-label">Expected</div>
                    </div>
                  </div>

                  {/* Adherence Progress */}
                  <div className="adherence-section">
                    <div className="adherence-header">
                      <span>Adherence Rate</span>
                      <span className="adherence-percentage" style={{ color: getAdherenceColor(adherence) }}>
                        {adherence}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${adherence}%`,
                          backgroundColor: getAdherenceColor(adherence)
                        }}
                      />
                    </div>
                    <div className="adherence-message">
                      {adherence >= 90 && <span className="excellent">🎉 Excellent adherence!</span>}
                      {adherence >= 70 && adherence < 90 && <span className="good">👍 Good adherence</span>}
                      {adherence < 70 && <span className="needs-improvement">⚠️ Needs improvement</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="medication-actions">
                    <button 
                      className="action-btn taken-btn"
                      onClick={() => markAsTaken(med._id)}
                    >
                      ✓ Taken
                    </button>
                    <button 
                      className="action-btn missed-btn"
                      onClick={() => markAsMissed(med._id)}
                    >
                      ✗ Missed
                    </button>
                    <button 
                      className="action-btn deactivate-btn"
                      onClick={() => deactivateMedication(med._id)}
                    >
                      🚫 Deactivate
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Inactive Medications */}
      {activeTab === 'inactive' && (
        <div className="medications-grid">
          {inactiveMeds.length === 0 ? (
            <div className="empty-state">
              <p>No deactivated medications.</p>
            </div>
          ) : (
            inactiveMeds.map((med) => {
              const adherence = calculateAdherence(med);
              
              return (
                <div key={med._id} className="medication-card inactive">
                  <div className="medication-card-header">
                    <h3>{med.medicationName}</h3>
                    <span className="status-badge inactive">Deactivated</span>
                  </div>

                  <div className="medication-details">
                    <div className="detail-row">
                      <span className="label">Dosage:</span>
                      <span className="value">{med.dosage}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Final Adherence:</span>
                      <span className="value" style={{ color: getAdherenceColor(adherence) }}>
                        {adherence}%
                      </span>
                    </div>
                    <div className="tracking-stats small">
                      <div className="stat-box">
                        <span className="stat-value">{med.taken || 0}</span>
                        <span className="stat-label">Taken</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-value">{med.missed || 0}</span>
                        <span className="stat-label">Missed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
