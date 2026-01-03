import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './Appointments.css';

export default function Appointments() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  const [formData, setFormData] = useState({
    doctorId: '',
    type: 'general',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    address: '',
    notes: ''
  });
  const [doctorSearch, setDoctorSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
    if (userRole === 'Patient') {
      fetchDoctors();
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const endpoint = userRole === 'Doctor' 
        ? `/api/appointments/doctor/${userId}`
        : `/api/appointments/patient/${userId}`;
      
      const response = await fetch(endpoint, {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors/all', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setDoctors(data.doctors || []);
        console.log(`Fetched ${data.doctors?.length || 0} doctors`);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          ...formData,
          patientId: userId
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setMessage({ type: 'success', text: 'Appointment request sent successfully!' });
        setShowModal(false);
        fetchAppointments();
        setFormData({
          doctorId: '',
          type: 'general',
          appointmentDate: '',
          appointmentTime: '',
          symptoms: '',
          address: '',
          notes: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create appointment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating appointment' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
        fetchAppointments();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cancelling appointment' });
    }
  };

  const handleAcceptReject = async (appointmentId, status, reason = '') => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? reason : undefined
        })
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ 
          type: 'success', 
          text: `Appointment ${status === 'accepted' ? 'accepted' : 'rejected'} successfully` 
        });
        fetchAppointments();
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error ${status}ing appointment` });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: '⏳ Pending', icon: '⏳' },
      accepted: { class: 'status-accepted', text: '✅ Accepted', icon: '✅' },
      rejected: { class: 'status-rejected', text: '❌ Rejected', icon: '❌' },
      completed: { class: 'status-completed', text: '✓ Completed', icon: '✓' },
      cancelled: { class: 'status-cancelled', text: '🚫 Cancelled', icon: '🚫' }
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    return type === 'teleconsultation' ? '💻' : '🏠';
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>📅 {userRole === 'Doctor' ? 'Appointment Requests' : 'My Appointments'}</h2>
        {userRole === 'Patient' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Book New Appointment
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="appointments-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Appointments Yet</h3>
            <p>Book your first appointment with a doctor</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Book Appointment
            </button>
          </div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header-section">
                <div className="appointment-type">
                  <span className="type-icon">📅</span>
                  <span className="type-text">Doctor Appointment</span>
                </div>
                <span className={`status-badge ${getStatusBadge(appointment.status).class}`}>
                  {getStatusBadge(appointment.status).text}
                </span>
              </div>

              <div className="appointment-body">
                <div className="appointment-info-row">
                  <div className="info-item">
                    <span className="info-label">{userRole === 'Doctor' ? '👤 Patient:' : '👨‍⚕️ Doctor:'}</span>
                    <span className="info-value">
                      {userRole === 'Doctor' 
                        ? (appointment.patientId?.name || 'N/A')
                        : (appointment.doctorId?.name || 'N/A')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📞 Phone:</span>
                    <span className="info-value">
                      {userRole === 'Doctor'
                        ? (appointment.patientId?.phone || 'N/A')
                        : (appointment.doctorId?.phone || 'N/A')}
                    </span>
                  </div>
                </div>

                <div className="appointment-info-row">
                  <div className="info-item">
                    <span className="info-label">📅 Date:</span>
                    <span className="info-value">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🕐 Time:</span>
                    <span className="info-value">{appointment.appointmentTime}</span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <strong>😷 Reason for Visit:</strong>
                    <p>{appointment.symptoms}</p>
                  </div>

                  {appointment.notes && (
                    <div className="detail-item">
                      <strong>📝 Notes:</strong>
                      <p>{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.status === 'rejected' && appointment.rejectionReason && (
                    <div className="detail-item rejection-reason">
                      <strong>❌ Rejection Reason:</strong>
                      <p>{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {appointment.status === 'completed' && appointment.completionNotes && (
                    <div className="detail-item completion-notes">
                      <strong>✅ Completion Notes:</strong>
                      <p>{appointment.completionNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="appointment-footer">
                <div className="appointment-date">
                  Requested: {new Date(appointment.createdAt).toLocaleString()}
                </div>
                {userRole === 'Patient' && appointment.status === 'pending' && (
                  <button 
                    onClick={() => handleCancel(appointment._id)}
                    className="btn-cancel"
                  >
                    Cancel Appointment
                  </button>
                )}
                {userRole === 'Doctor' && appointment.status === 'pending' && (
                  <div className="doctor-actions">
                    <button 
                      onClick={() => handleAcceptReject(appointment._id, 'accepted')}
                      className="btn-accept"
                    >
                      ✅ Accept
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt('Enter rejection reason (optional):');
                        handleAcceptReject(appointment._id, 'rejected', reason || '');
                      }}
                      className="btn-reject"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Book New Appointment</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-group">
                <label>Select Doctor *</label>
                <input
                  type="text"
                  placeholder="Search doctor by name or specialty..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="doctor-search-input"
                />
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  required
                  size="8"
                  className="doctor-select-list"
                >
                  <option value="">-- Choose a doctor --</option>
                  {doctors
                    .filter(doctor => {
                      const searchLower = doctorSearch.toLowerCase();
                      return doctor.name.toLowerCase().includes(searchLower) ||
                             doctor.specialist?.toLowerCase().includes(searchLower);
                    })
                    .map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialist} ({doctor.experience || 0} years exp.)
                      </option>
                    ))}
                </select>
                <div className="doctor-count">
                  Showing {doctors.filter(doctor => {
                    const searchLower = doctorSearch.toLowerCase();
                    return doctor.name.toLowerCase().includes(searchLower) ||
                           doctor.specialist?.toLowerCase().includes(searchLower);
                  }).length} of {doctors.length} doctors
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Time *</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Visit *</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder="Describe the reason for your appointment..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information..."
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
