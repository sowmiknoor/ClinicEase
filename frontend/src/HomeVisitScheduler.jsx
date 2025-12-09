import { useState, useEffect } from 'react';
import './HomeVisitScheduler.css';

export default function HomeVisitScheduler() {
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({ address: '', requestedDateTime: '', notes: '' });
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => { fetchVisits(); }, []);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (data.ok) setVisits(data.visits || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/visits/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) { 
        setForm({ address: '', requestedDateTime: '', notes: '' }); 
        fetchVisits(); 
        alert('✅ Visit requested successfully!');
      }
      else alert(data.error || 'Could not request visit');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleConfirm = async (visitId) => {
    try {
      const res = await fetch(`/api/visits/${visitId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        alert('✅ Visit confirmed successfully!');
        fetchVisits();
      } else {
        alert(data.error || 'Could not confirm visit');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const handleCancelClick = (visitId) => {
    setCancelingId(visitId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelingId) return;
    try {
      const res = await fetch(`/api/visits/${cancelingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ reason: cancelReason || 'User canceled' })
      });
      const data = await res.json();
      if (data.ok) {
        alert('✅ Visit canceled successfully!');
        setShowCancelModal(false);
        setCancelingId(null);
        setCancelReason('');
        fetchVisits();
      } else {
        alert(data.error || 'Could not cancel visit');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      requested: { class: 'status-badge requested', label: '⏳ Requested' },
      scheduled: { class: 'status-badge scheduled', label: '📅 Scheduled' },
      in_progress: { class: 'status-badge in_progress', label: '🚗 In Progress' },
      completed: { class: 'status-badge completed', label: '✅ Completed' },
      canceled: { class: 'status-badge canceled', label: '❌ Canceled' }
    };
    return badges[status] || { class: 'status-badge', label: status };
  };

  const getConfirmationStatus = (visit) => {
    if (visit.isConfirmed) {
      return <span className="confirmation-badge confirmed">✅ Confirmed</span>;
    }
    if (visit.status === 'canceled') {
      return <span className="confirmation-badge canceled">❌ Canceled</span>;
    }
    return <span className="confirmation-badge pending">⏳ Awaiting Confirmation</span>;
  };

  return (
    <div className="visits-root">
      <h2>🏥 Home Visit Scheduling</h2>
      <div className="visits-layout">
        <form className="visit-form" onSubmit={handleSubmit}>
          <h3>Request a Home Visit</h3>
          <label>📍 Address</label>
          <input 
            name="address" 
            placeholder="Enter your home address"
            value={form.address} 
            onChange={(e)=>setForm({...form,address:e.target.value})} 
            required 
          />
          <label>📅 Requested Date & Time</label>
          <input 
            type="datetime-local" 
            name="requestedDateTime" 
            value={form.requestedDateTime} 
            onChange={(e)=>setForm({...form,requestedDateTime:e.target.value})} 
            required 
          />
          <label>📝 Notes (Optional)</label>
          <textarea 
            name="notes" 
            placeholder="Any special instructions or medical details"
            value={form.notes} 
            onChange={(e)=>setForm({...form,notes:e.target.value})} 
            rows="4"
          />
          <button type="submit" className="btn btn-primary">Request Visit</button>
        </form>

        <div className="visits-list">
          <h3>📋 Your Visits</h3>
          {visits.length === 0 ? (
            <p className="empty">No visits yet. Request one to get started!</p>
          ) : (
            <div className="visits-container">
              {visits.map(v => {
                const statusBadge = getStatusBadge(v.status);
                const isCanceled = v.status === 'canceled';
                const isCompleted = v.status === 'completed';
                const isRequested = v.status === 'requested';
                
                return (
                  <div key={v._id} className={`visit-card ${isCanceled ? 'canceled-visit' : ''}`}>
                    <div className="visit-header">
                      <div className="visit-datetime">
                        <strong>{new Date(v.requestedDateTime).toLocaleString()}</strong>
                        <small>{v.address}</small>
                      </div>
                      <div className={statusBadge.class}>{statusBadge.label}</div>
                    </div>

                    <div className="visit-confirmation">
                      {getConfirmationStatus(v)}
                    </div>

                    {v.notes && <div className="visit-notes"><strong>Notes:</strong> {v.notes}</div>}
                    
                    {v.cancelReason && <div className="visit-cancel-reason"><strong>Cancellation Reason:</strong> {v.cancelReason}</div>}
                    
                    {v.confirmationDate && (
                      <div className="visit-confirmed-date">
                        ✅ Confirmed on {new Date(v.confirmationDate).toLocaleString()}
                      </div>
                    )}

                    <div className="visit-actions">
                      {!isCanceled && !isCompleted && isRequested && !v.isConfirmed && (
                        <>
                          <button 
                            className="btn-action confirm-btn"
                            onClick={() => handleConfirm(v._id)}
                          >
                            ✅ Confirm Visit
                          </button>
                          <button 
                            className="btn-action cancel-btn"
                            onClick={() => handleCancelClick(v._id)}
                          >
                            ❌ Cancel Visit
                          </button>
                        </>
                      )}
                      {!isCanceled && !isCompleted && v.isConfirmed && (
                        <button 
                          className="btn-action cancel-btn"
                          onClick={() => handleCancelClick(v._id)}
                        >
                          ❌ Cancel Visit
                        </button>
                      )}
                      {isCanceled && (
                        <span className="visit-status-note">This visit has been canceled</span>
                      )}
                      {isCompleted && (
                        <span className="visit-status-note">This visit is completed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Visit</h3>
            <p>Are you sure you want to cancel this visit?</p>
            <label>Reason for cancellation (optional):</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please let us know why you're canceling..."
              rows="3"
            />
            <div className="modal-actions">
              <button className="btn-modal confirm" onClick={handleCancelConfirm}>
                Yes, Cancel Visit
              </button>
              <button className="btn-modal cancel" onClick={() => setShowCancelModal(false)}>
                Keep Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
