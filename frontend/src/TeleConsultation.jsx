import { useEffect, useState } from 'react';
import './TeleConsultation.css';

export default function TeleConsultation() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', durationMinutes: 30, mobileNumber: '', notes: '' });
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchConsultations(); 
    if (userRole === 'Patient') {
      fetchDoctors();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors/all');
      const data = await res.json();
      if (data.ok) setDoctors(data.doctors || []);
    } catch (err) { 
      console.error('Error fetching doctors:', err); 
    }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultations', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (data.ok) setConsultations(data.consultations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    setForm({...form, doctorId});
    
    if (doctorId) {
      const doctor = doctors.find(d => d._id === doctorId);
      setSelectedDoctor(doctor);
      // Auto-fill mobile number if doctor has phone
      if (doctor && doctor.phone) {
        setForm({...form, doctorId, mobileNumber: doctor.phone});
      }
    } else {
      setSelectedDoctor(null);
      setForm({...form, doctorId: '', mobileNumber: ''});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.doctorId) {
      alert('Please select a doctor');
      return;
    }
    
    try {
      const res = await fetch('/api/consultations/book', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) { 
        fetchConsultations(); 
        setForm({ doctorId:'', scheduledAt:'', durationMinutes:30, mobileNumber:'', notes:'' }); 
        setSelectedDoctor(null);
        alert('✅ Consultation request sent successfully! Doctor will be notified.'); 
      }
      else alert(data.error || 'Could not book consultation');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`/api/consultations/${id}/accept`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        alert('✅ Consultation accepted!');
        fetchConsultations();
      } else alert(data.error || 'Could not accept consultation');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this consultation request?')) return;
    try {
      const res = await fetch(`/api/consultations/${id}/reject`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        alert('Consultation request rejected');
        fetchConsultations();
      } else alert(data.error || 'Could not reject consultation');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this consultation as completed?')) return;
    try {
      const res = await fetch(`/api/consultations/${id}/complete`, {
        method: 'PATCH',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        alert('✅ Consultation marked as completed!');
        fetchConsultations();
      } else alert(data.error || 'Could not complete consultation');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  const handleJoin = (consult) => {
    if (consult.meetingLink) {
      window.open(consult.meetingLink, '_blank');
    } else {
      if (userRole === 'Doctor') {
        // Only doctors can generate meeting links
        fetch(`/api/consultations/${consult._id}/meeting`, { headers: { 'x-user-id': userId } })
          .then(r => r.json()).then(d => { 
            if (d.ok && d.meetingLink) {
              window.open(d.meetingLink, '_blank');
              fetchConsultations(); // Refresh to show link to patient
            } else alert('Unable to get meeting link'); 
          });
      } else {
        alert('⏳ Waiting for doctor to send the meeting invitation...');
      }
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
        {userRole === 'Patient' && (
          <form className="tele-form" onSubmit={handleSubmit}>
            <h3>Book a Consultation</h3>
            
            <label>👨‍⚕️ Select Doctor <span className="required-badge">Required</span></label>
            <select 
              name="doctorId" 
              value={form.doctorId} 
              onChange={handleDoctorSelect}
              required
              className="doctor-select"
            >
              <option value="">-- Select a Doctor --</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} {doc.specialist ? `- ${doc.specialist}` : ''}
                </option>
              ))}
            </select>

            {selectedDoctor && (
              <div className="doctor-info-card">
                <p><strong>Designation:</strong> {selectedDoctor.designation || 'N/A'}</p>
                {selectedDoctor.specialist && <p><strong>Specialist:</strong> {selectedDoctor.specialist}</p>}
                {selectedDoctor.experience && <p><strong>Experience:</strong> {selectedDoctor.experience} years</p>}
                {selectedDoctor.consultationFee && <p><strong>Fee:</strong> ₹{selectedDoctor.consultationFee}</p>}
              </div>
            )}

            <label>📅 Schedule date & time</label>
            <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={(e)=>setForm({...form,scheduledAt:e.target.value})} required />

            <label>⏱️ Duration (minutes)</label>
            <input type="number" min={10} max={120} value={form.durationMinutes} onChange={(e)=>setForm({...form,durationMinutes:parseInt(e.target.value||30,10)})} />

            <label>📱 Your Mobile Number <span className="required-badge">Required</span></label>
            <input 
              type="tel" 
              name="mobileNumber" 
              value={form.mobileNumber} 
              onChange={(e)=>setForm({...form,mobileNumber:e.target.value})} 
              placeholder="e.g., +880 1712-345678"
              required
            />
            <small className="help-text">Doctor will call you at this number for the consultation</small>

            <label>📝 Notes for doctor</label>
            <textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Describe your symptoms or concerns" />

            <button type="submit" className="book-btn">Send Consultation Request</button>
          </form>
        )}

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
                    
                    {/* Show patient name for doctors */}
                    {userRole === 'Doctor' && c.patientId && (
                      <div className="patient-info">
                        <strong>👤 Patient:</strong> {c.patientId.name || 'Unknown Patient'}
                      </div>
                    )}
                    
                    {/* Show doctor name for patients */}
                    {userRole === 'Patient' && c.doctorId && (
                      <div className="doctor-info">
                        <strong>👨‍⚕️ Doctor:</strong> Dr. {c.doctorId.name || 'Unknown Doctor'}
                      </div>
                    )}
                    
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
                      {/* Patient View - Show Join/Cancel or Status */}
                      {userRole === 'Patient' && (
                        <>
                          {c.status === 'scheduled' && (
                            <>
                              {c.meetingLink ? (
                                <button onClick={()=>handleJoin(c)} className="join-btn">🎥 Join Video</button>
                              ) : (
                                <span className="status-note" style={{color: '#f59e0b'}}>⏳ Waiting for meeting invitation...</span>
                              )}
                              <button onClick={()=>handleCancel(c._id)} className="cancel-btn">❌ Cancel</button>
                            </>
                          )}
                          {c.status === 'accepted' && (
                            <>
                              {c.meetingLink ? (
                                <button onClick={()=>handleJoin(c)} className="join-btn">🎥 Join Video</button>
                              ) : (
                                <span className="status-note" style={{color: '#f59e0b'}}>⏳ Waiting for meeting invitation...</span>
                              )}
                              <span className="status-note" style={{color: '#10b981'}}>✅ Doctor Accepted</span>
                            </>
                          )}
                          {c.status === 'rejected' && (
                            <span className="status-note" style={{color: '#ef4444'}}>❌ Doctor Rejected</span>
                          )}
                          {c.status === 'canceled' && (
                            <span className="status-note">This consultation was canceled</span>
                          )}
                          {c.status === 'completed' && (
                            <span className="status-note" style={{color: '#10b981'}}>✅ Completed</span>
                          )}
                        </>
                      )}
                      
                      {/* Doctor View - Show Accept/Reject/Complete */}
                      {userRole === 'Doctor' && (
                        <>
                          {c.status === 'scheduled' && (
                            <>
                              <button onClick={()=>handleAccept(c._id)} className="accept-btn" style={{background: '#10b981'}}>
                                ✅ Accept
                              </button>
                              <button onClick={()=>handleReject(c._id)} className="reject-btn" style={{background: '#ef4444'}}>
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {c.status === 'accepted' && (
                            <>
                              {c.meetingLink ? (
                                <button onClick={()=>handleJoin(c)} className="join-btn">🎥 Join Video</button>
                              ) : (
                                <button onClick={()=>handleJoin(c)} className="send-invite-btn" style={{background: '#3b82f6'}}>
                                  📧 Send Meeting Invitation
                                </button>
                              )}
                              <button onClick={()=>handleComplete(c._id)} className="complete-btn" style={{background: '#14b8a6'}}>
                                ✔️ Mark Complete
                              </button>
                            </>
                          )}
                          {c.status === 'rejected' && (
                            <span className="status-note" style={{color: '#ef4444'}}>You rejected this request</span>
                          )}
                          {c.status === 'completed' && (
                            <span className="status-note" style={{color: '#10b981'}}>✅ Completed</span>
                          )}
                          {c.status === 'canceled' && (
                            <span className="status-note">Patient canceled this consultation</span>
                          )}
                        </>
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
