import { useEffect, useState } from 'react';
import './TeleConsultation.css';

export default function TeleConsultation() {
  const userId = localStorage.getItem('userId');
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', durationMinutes: 30, notes: '' });
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
      if (data.ok) { fetchConsultations(); setForm({ doctorId:'', scheduledAt:'', durationMinutes:30, notes:'' }); alert('Consultation booked'); }
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

  return (
    <div className="tele-root">
      <h2>Tele-Consultations</h2>
      <div className="tele-layout">
        <form className="tele-form" onSubmit={handleSubmit}>
          <label>Doctor (optional)</label>
          <input name="doctorId" value={form.doctorId} onChange={(e)=>setForm({...form,doctorId:e.target.value})} placeholder="Doctor id or name" />

          <label>Schedule date & time</label>
          <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={(e)=>setForm({...form,scheduledAt:e.target.value})} required />

          <label>Duration (minutes)</label>
          <input type="number" min={10} max={120} value={form.durationMinutes} onChange={(e)=>setForm({...form,durationMinutes:parseInt(e.target.value||30,10)})} />

          <label>Notes for doctor</label>
          <textarea value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} />

          <button type="submit" className="book-btn">Book Consultation</button>
        </form>

        <div className="tele-list">
          <h3>Your Consultations</h3>
          {loading ? <p>Loading...</p> : (
            <ul>
              {consultations.length === 0 && <li>No consultations booked.</li>}
              {consultations.map(c => (
                <li key={c._id} className="consult-item">
                  <div className="consult-main">
                    <div className="when">{new Date(c.scheduledAt).toLocaleString()}</div>
                    <div className="status">{c.status}</div>
                    <div className="notes">{c.notes}</div>
                  </div>
                  <div className="consult-actions">
                    {c.status !== 'canceled' && <button onClick={()=>handleJoin(c)} className="join">Join</button>}
                    {c.status !== 'canceled' && <button onClick={()=>handleCancel(c._id)} className="cancel">Cancel</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
