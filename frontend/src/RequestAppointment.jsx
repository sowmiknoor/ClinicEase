import { useState, useEffect } from 'react';
import './RequestAppointment.css';

export default function RequestAppointment() {
  const [appointmentType, setAppointmentType] = useState('teleconsultation');
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    address: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors');
      const data = await res.json();
      if (data.ok) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: user.userId,
          type: appointmentType
        })
      });

      const data = await res.json();
      
      if (data.ok) {
        setMessage('success:Appointment request sent successfully!');
        setFormData({
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          symptoms: '',
          address: '',
          notes: ''
        });
      } else {
        setMessage('error:' + data.message);
      }
    } catch (err) {
      setMessage('error:Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-appointment">
      <div className="appointment-header">
        <h1>Request Appointment</h1>
        <p>Book a teleconsultation or request a home visit</p>
      </div>

      <div className="appointment-type-selector">
        <button
          className={`type-btn ${appointmentType === 'teleconsultation' ? 'active' : ''}`}
          onClick={() => setAppointmentType('teleconsultation')}
        >
          <span className="type-icon">💻</span>
          <span>Teleconsultation</span>
        </button>
        <button
          className={`type-btn ${appointmentType === 'home-visit' ? 'active' : ''}`}
          onClick={() => setAppointmentType('home-visit')}
        >
          <span className="type-icon">🏠</span>
          <span>Home Visit</span>
        </button>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Doctor *</label>
          <select
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.name} - {doc.email}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Preferred Date *</label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Time *</label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Symptoms / Reason for Visit *</label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="Describe your symptoms or reason for consultation..."
            rows="4"
            required
          />
        </div>

        {appointmentType === 'home-visit' && (
          <div className="form-group">
            <label>Your Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your complete address for home visit..."
              rows="3"
              required={appointmentType === 'home-visit'}
            />
          </div>
        )}

        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information you'd like to share..."
            rows="3"
          />
        </div>

        {message && (
          <div className={`message ${message.startsWith('success') ? 'success' : 'error'}`}>
            {message.split(':')[1]}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Sending Request...' : 'Send Request'}
        </button>
      </form>

      <div className="info-box">
        <h3>📌 Important Information</h3>
        <ul>
          <li>Your appointment request will be sent to the selected doctor</li>
          <li>The doctor will review and accept/reject your request</li>
          <li>You'll be notified once the doctor responds</li>
          <li>Teleconsultations are conducted via video call</li>
          <li>Home visit availability depends on doctor and location</li>
        </ul>
      </div>
    </div>
  );
}
