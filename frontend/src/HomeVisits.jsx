import { useState, useEffect } from 'react';
import './HomeVisits.css';

export default function HomeVisits() {
  const [homeVisits, setHomeVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const [formData, setFormData] = useState({
    doctorId: '',
    visitDate: '',
    visitTime: '',
    address: {
      street: '',
      city: '',
      state: ''
    },
    reasonForVisit: '',
    emergencyContact: {
      name: '',
      phone: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchHomeVisits();
    if (userRole === 'Patient') {
      fetchDoctors();
    }
  }, []);

  const fetchHomeVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-visits', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setHomeVisits(data.homeVisits || []);
      }
    } catch (error) {
      console.error('Error fetching home visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/users/role/Doctor', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      if (data.ok) {
        setDoctors(data.users || []);
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
      const response = await fetch('/api/home-visits/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.ok) {
        setMessage({ type: 'success', text: 'Home visit request created successfully!' });
        setShowCreateForm(false);
        setFormData({
          doctorId: '',
          visitDate: '',
          visitTime: '',
          address: { street: '', city: '', state: '' },
          reasonForVisit: '',
          emergencyContact: { name: '', phone: '' },
          notes: ''
        });
        fetchHomeVisits();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (visitId) => {
    if (!confirm('Are you sure you want to cancel this home visit request?')) return;

    try {
      const response = await fetch(`/api/home-visits/${visitId}/cancel`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Home visit cancelled successfully' });
        fetchHomeVisits();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cancelling visit' });
    }
  };

  const handleAccept = async (visitId) => {
    try {
      const response = await fetch(`/api/home-visits/${visitId}/accept`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Home visit accepted successfully' });
        fetchHomeVisits();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error accepting visit' });
    }
  };

  const handleReject = async (visitId) => {
    try {
      const response = await fetch(`/api/home-visits/${visitId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Home visit rejected' });
        setShowRejectModal(null);
        setRejectionReason('');
        fetchHomeVisits();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error rejecting visit' });
    }
  };

  const handleComplete = async (visitId) => {
    try {
      const response = await fetch(`/api/home-visits/${visitId}/complete`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });

      const data = await response.json();
      if (data.ok) {
        setMessage({ type: 'success', text: 'Home visit marked as completed' });
        fetchHomeVisits();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error completing visit' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return classes[status] || '';
  };

  return (
    <div className="home-visits-container">
      <div className="home-visits-header">
        <div>
          <h1>🏠 Home Visit Requests</h1>
          <p>{userRole === 'Patient' ? 'Request and manage home visits' : 'Manage patient home visit requests'}</p>
        </div>
        {userRole === 'Patient' && (
          <button 
            className="btn-create-visit"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '+ Request Home Visit'}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && userRole === 'Patient' && (
        <div className="create-visit-card">
          <h2>Request Home Visit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Select Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} | {doctor.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Visit Date *</label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Visit Time *</label>
                <input
                  type="time"
                  value={formData.visitTime}
                  onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="address-section">
              <h3>Visit Address</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit *</label>
              <textarea
                rows="3"
                value={formData.reasonForVisit}
                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                placeholder="Describe the reason for requesting a home visit..."
                required
              />
            </div>

            <div className="emergency-contact-section">
              <h3>Emergency Contact (Optional)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Home Visits List */}
      <div className="visits-list">
        {loading ? (
          <div className="loading">Loading home visits...</div>
        ) : homeVisits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No Home Visits</h3>
            <p>{userRole === 'Patient' ? 'You haven\'t requested any home visits yet.' : 'No home visit requests yet.'}</p>
          </div>
        ) : (
          <div className="visits-grid">
            {homeVisits.map(visit => (
              <div key={visit._id} className={`visit-card ${getStatusBadgeClass(visit.status)}`}>
                <div className="visit-header">
                  <div>
                    <h3>{formatDate(visit.visitDate)}</h3>
                    <p className="visit-time">⏰ {visit.visitTime}</p>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(visit.status)}`}>
                    {visit.status}
                  </span>
                </div>

                {userRole === 'Patient' ? (
                  <div className="visit-info">
                    <p><strong>👨‍⚕️ Doctor:</strong> Dr. {visit.doctorId?.name}</p>
                    <p><strong>📧 Email:</strong> {visit.doctorId?.email}</p>
                    {visit.doctorId?.phone && <p><strong>📞 Phone:</strong> {visit.doctorId.phone}</p>}
                  </div>
                ) : (
                  <div className="visit-info">
                    <p><strong>👤 Patient:</strong> {visit.patientId?.name}</p>
                    <p><strong>📧 Email:</strong> {visit.patientId?.email}</p>
                    {visit.patientId?.phone && <p><strong>📞 Phone:</strong> {visit.patientId.phone}</p>}
                  </div>
                )}

                <div className="visit-details">
                  <p><strong>📍 Address:</strong></p>
                  <p className="address-text">
                    {visit.address.street}, {visit.address.city}, {visit.address.state}
                  </p>
                  <p><strong>🔍 Reason:</strong> {visit.reasonForVisit}</p>
                  {visit.notes && <p><strong>📝 Notes:</strong> {visit.notes}</p>}
                  {visit.rejectionReason && (
                    <p className="rejection-reason"><strong>❌ Rejection Reason:</strong> {visit.rejectionReason}</p>
                  )}
                  {visit.emergencyContact?.name && (
                    <p><strong>🚨 Emergency Contact:</strong> {visit.emergencyContact.name} - {visit.emergencyContact.phone}</p>
                  )}
                </div>

                <div className="visit-actions">
                  <button 
                    className="btn-view"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    View Details
                  </button>

                  {userRole === 'Patient' && visit.status === 'pending' && (
                    <button 
                      className="btn-cancel-visit"
                      onClick={() => handleCancel(visit._id)}
                    >
                      Cancel Request
                    </button>
                  )}

                  {userRole === 'Doctor' && visit.status === 'pending' && (
                    <>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAccept(visit._id)}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => setShowRejectModal(visit._id)}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {userRole === 'Doctor' && visit.status === 'accepted' && (
                    <button 
                      className="btn-complete"
                      onClick={() => handleComplete(visit._id)}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Home Visit Request</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for rejecting this request:</p>
              <textarea
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="rejection-textarea"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn-confirm-reject"
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
              <button 
                className="btn-modal-cancel"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedVisit && (
        <div className="modal-overlay" onClick={() => setSelectedVisit(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Home Visit Details</h2>
              <button className="modal-close" onClick={() => setSelectedVisit(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>📅 Visit Information</h3>
                <p><strong>Date:</strong> {formatDate(selectedVisit.visitDate)}</p>
                <p><strong>Time:</strong> {selectedVisit.visitTime}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedVisit.status)}`}>{selectedVisit.status}</span></p>
              </div>

              <div className="detail-section">
                <h3>👨‍⚕️ Doctor</h3>
                <p>Dr. {selectedVisit.doctorId?.name}</p>
                <p>{selectedVisit.doctorId?.email}</p>
                {selectedVisit.doctorId?.phone && <p>📞 {selectedVisit.doctorId.phone}</p>}
              </div>

              <div className="detail-section">
                <h3>👤 Patient</h3>
                <p>{selectedVisit.patientId?.name}</p>
                <p>{selectedVisit.patientId?.email}</p>
                {selectedVisit.patientId?.phone && <p>📞 {selectedVisit.patientId.phone}</p>}
              </div>

              <div className="detail-section">
                <h3>📍 Visit Address</h3>
                <p>{selectedVisit.address.street}</p>
                <p>{selectedVisit.address.city}, {selectedVisit.address.state}</p>
              </div>

              <div className="detail-section">
                <h3>🔍 Reason for Visit</h3>
                <p>{selectedVisit.reasonForVisit}</p>
              </div>

              {selectedVisit.notes && (
                <div className="detail-section">
                  <h3>📝 Notes</h3>
                  <p>{selectedVisit.notes}</p>
                </div>
              )}

              {selectedVisit.emergencyContact?.name && (
                <div className="detail-section">
                  <h3>🚨 Emergency Contact</h3>
                  <p><strong>Name:</strong> {selectedVisit.emergencyContact.name}</p>
                  <p><strong>Phone:</strong> {selectedVisit.emergencyContact.phone}</p>
                </div>
              )}

              {selectedVisit.rejectionReason && (
                <div className="detail-section rejection">
                  <h3>❌ Rejection Reason</h3>
                  <p>{selectedVisit.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
