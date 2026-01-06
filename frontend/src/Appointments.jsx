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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Remove duplicates based on _id to ensure unique appointments
        const appointmentsArray = data.appointments || [];
        const uniqueAppointments = Array.from(
          new Map(appointmentsArray.map(app => [app._id, app])).values()
        );
        console.log('Total appointments from API:', appointmentsArray.length);
        console.log('Unique appointments after deduplication:', uniqueAppointments.length);
        
        // Set appointments only if they've changed to prevent unnecessary re-renders
        setAppointments(prev => {
          const prevIds = prev.map(a => a._id).sort().join(',');
          const newIds = uniqueAppointments.map(a => a._id).sort().join(',');
          return prevIds === newIds ? prev : uniqueAppointments;
        });
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
      const response = await fetch('/api/appointments/create', {
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
      const response = await fetch(`/api/appointments/cancel/${appointmentId}`, {
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
      const response = await fetch(`/api/appointments/update-status/${appointmentId}`, {
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
      pending: { class: 'status-pending', text: `⏳ ${t('pending')}`, icon: '⏳' },
      accepted: { class: 'status-accepted', text: `✅ ${t('accepted')}`, icon: '✅' },
      rejected: { class: 'status-rejected', text: `❌ ${t('rejected')}`, icon: '❌' },
      completed: { class: 'status-completed', text: `✓ ${t('completed')}`, icon: '✓' },
      cancelled: { class: 'status-cancelled', text: `🚫 ${t('cancelled')}`, icon: '🚫' }
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    return type === 'teleconsultation' ? '💻' : '🏠';
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>📅 {userRole === 'Doctor' ? t('appointmentRequests') : t('myAppointmentsPage')}</h2>
        {userRole === 'Patient' && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + {t('bookNewAppointment')}
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
            <div className="stat-label">{t('totalAppointments')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="stat-label">{t('pending')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'accepted').length}
            </div>
            <div className="stat-label">{t('accepted')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="stat-label">{t('completed')}</div>
          </div>
        </div>
      </div>

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>{t('noAppointmentsYet')}</h3>
            <p>{t('bookFirstAppointment')}</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              {t('booking')}
            </button>
          </div>
        ) : (
          <>
            {appointments.map((appointment, index) => (
              <div 
                key={`appointment-${appointment._id}`} 
                className="appointment-card"
                style={{ '--card-index': index }}
              >
                <div className="appointment-header-section">
                <div className="appointment-type">
                  <span className="type-icon">📅</span>
                  <span className="type-text">{t('doctorAppointment')}</span>
                </div>
                <span className={`status-badge ${getStatusBadge(appointment.status).class}`}>
                  {getStatusBadge(appointment.status).text}
                </span>
              </div>

              <div className="appointment-body">
                <div className="appointment-info-row">
                  <div className="info-item">
                    <span className="info-label">{userRole === 'Doctor' ? `👤 ${t('patient')}:` : `👨‍⚕️ ${t('doctor')}:`}</span>
                    <span className="info-value">
                      {userRole === 'Doctor' 
                        ? (appointment.patientId?.name || 'N/A')
                        : (appointment.doctorId?.name || 'N/A')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📞 {t('phone')}:</span>
                    <span className="info-value">
                      {userRole === 'Doctor'
                        ? (appointment.patientId?.phone || 'N/A')
                        : (appointment.doctorId?.phone || 'N/A')}
                    </span>
                  </div>
                </div>

                <div className="appointment-info-row">
                  <div className="info-item">
                    <span className="info-label">📅 {t('date')}:</span>
                    <span className="info-value">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🕐 {t('time')}:</span>
                    <span className="info-value">{appointment.appointmentTime}</span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <strong>😷 {t('reasonForVisit')}:</strong>
                    <p>{appointment.symptoms}</p>
                  </div>

                  {appointment.notes && (
                    <div className="detail-item">
                      <strong>📝 {t('notes')}:</strong>
                      <p>{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.status === 'rejected' && appointment.rejectionReason && (
                    <div className="detail-item rejection-reason">
                      <strong>❌ {t('rejectionReason')}:</strong>
                      <p>{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {appointment.status === 'completed' && appointment.completionNotes && (
                    <div className="detail-item completion-notes">
                      <strong>✅ {t('completionNotes')}:</strong>
                      <p>{appointment.completionNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="appointment-footer">
                <div className="appointment-date">
                  {t('requested')}: {new Date(appointment.createdAt).toLocaleString()}
                </div>
                {userRole === 'Patient' && appointment.status === 'pending' && (
                  <button 
                    onClick={() => handleCancel(appointment._id)}
                    className="btn-cancel"
                  >
                    {t('cancel')}
                  </button>
                )}
                {userRole === 'Doctor' && appointment.status === 'pending' && (
                  <div className="doctor-actions">
                    <button 
                      onClick={() => handleAcceptReject(appointment._id, 'accepted')}
                      className="btn-accept"
                    >
                      ✅ {t('accept')}
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt(t('enterRejectionReason'));
                        handleAcceptReject(appointment._id, 'rejected', reason || '');
                      }}
                      className="btn-reject"
                    >
                      ❌ {t('reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 {t('bookNewAppointment')}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-group">
                <label>{t('selectDoctor')} *</label>
                <input
                  type="text"
                  placeholder={t('searchDoctor')}
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
                  <label>{t('date')} *</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('time')} *</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('reasonForVisit')} *</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  placeholder={t('describeReasonForAppointment')}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('additionalNotes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder={t('anyAdditionalInfo')}
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? `${t('booking')}...` : t('bookNewAppointment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
