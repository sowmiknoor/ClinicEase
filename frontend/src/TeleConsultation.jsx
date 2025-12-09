import { useEffect, useState } from 'react';
import './TeleConsultation.css';

export default function TeleConsultation() {
  const userId = localStorage.getItem('userId');
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', durationMinutes: 30, mobileNumber: '', notes: '' });
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchConsultations(); }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultations', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (data.ok) setConsultations(data.consultations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/consultations/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) { fetchConsultations(); setForm({ doctorId:'', scheduledAt:'', durationMinutes:30, mobileNumber:'', notes:'' }); alert('✅ Consultation booked successfully!'); }
      else alert(data.error || 'Could not book consultation');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleJoin = (consult) => {
    if (consult.meetingLink) {
      window.open(consult.meetingLink, '_blank');
    } else {
      // ensure meeting link
      fetch(`/api/consultations/${consult._id}/meeting`, { headers: { 'x-user-id': userId } })
        .then(r => r.json()).then(d => { if (d.ok && d.meetingLink) window.open(d.meetingLink, '_blank'); else alert('Unable to get meeting link'); });
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this consultation?')) return;
    try {
      const res = await fetch(`/api/consultations/${id}/cancel`, { method: 'POST', headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (data.ok) fetchConsultations(); else alert(data.error || 'Could not cancel');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleCall = (mobileNumber) => {
    if (!mobileNumber) {
      alert('No mobile number provided for this consultation.');
      return;
    }
    // Open phone dialer
    window.location.href = `tel:${mobileNumber}`;
  };

  return (
    <div className="tele-root">
      <h2>📞 Tele-Consultations</h2>
      <div className="tele-layout">
        <form className="tele-form" onSubmit={handleSubmit}>
          <h3>Book a Consultation</h3>
          <label>👨‍⚕️ Doctor <span className="optional-badge">Optional</span></label>
          <input name="doctorId" value={form.doctorId} onChange={(e)=>setForm({...form,doctorId:e.target.value})} placeholder="Leave empty for any available doctor" />

          <label>📅 Schedule date & time</label>
          <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={(e)=>setForm({...form,scheduledAt:e.target.value})} required />

          <label>⏱️ Duration (minutes)</label>
          <input type="number" min={10} max={120} value={form.durationMinutes} onChange={(e)=>setForm({...form,durationMinutes:parseInt(e.target.value||30,10)})} />

          <label>📱 Mobile Number <span className="required-badge">Required</span></label>
          <input 
            type="tel" 
            name="mobileNumber" 
            value={form.mobileNumber} 
            onChange={(e)=>setForm({...form,mobileNumber:e.target.value})} 
            placeholder="e.g., +1 (555) 123-4567"
            pattern="[0-9+\-\s()]*"
            required
          />
          <small className="help-text">Doctor will call you at this number for the consultation</small>

          <label>📝 Notes for doctor</label>
          <textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Describe your symptoms or concerns" />

          <button type="submit" className="book-btn">Book Consultation</button>
        </form>

        <div className="tele-list">
          <h3>📋 Your Consultations</h3>
          {loading ? <p className="loading-text">Loading...</p> : (
            consultations.length === 0 ? (
              <p className="empty-state">No consultations booked yet. Book your first consultation!</p>
            ) : (
              <div className="consult-container">
                {consultations.map(c => (
                  <div key={c._id} className={`consult-card ${c.status === 'canceled' ? 'canceled' : ''}`}>
                    <div className="consult-header">
                      <div className="consult-datetime">
                        <strong>{new Date(c.scheduledAt).toLocaleString()}</strong>
                        <small>{c.durationMinutes} minutes</small>
                      </div>
                      <span className={`status-badge ${c.status}`}>{c.status}</span>
                    </div>
                    
                    {c.mobileNumber && (
                      <div className="mobile-info">
                        <span className="mobile-label">📱 Mobile:</span>
                        <span className="mobile-number">{c.mobileNumber}</span>
                        <button 
                          onClick={() => handleCall(c.mobileNumber)} 
                          className="call-btn"
                          title="Call this number"
                        >
                          📞 Call
                        </button>
                      </div>
                    )}
                    
                    {c.notes && (
                      <div className="consult-notes">
                        <strong>Notes:</strong> {c.notes}
                      </div>
                    )}
                    
                    {c.meetingLink && c.status !== 'canceled' && (
                      <div className="meeting-link">
                        <span>🔗 Meeting Link:</span>
                        <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="link-text">
                          {c.meetingLink}
                        </a>
                      </div>
                    )}
                    
                    <div className="consult-actions">
                      {c.status !== 'canceled' && c.status !== 'completed' && (
                        <>
                          <button onClick={()=>handleJoin(c)} className="join-btn">🎥 Join Video</button>
                          <button onClick={()=>handleCancel(c._id)} className="cancel-btn">❌ Cancel</button>
                        </>
                      )}
                      {c.status === 'canceled' && (
                        <span className="status-note">This consultation was canceled</span>
                      )}
                      {c.status === 'completed' && (
                        <span className="status-note">✅ Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
