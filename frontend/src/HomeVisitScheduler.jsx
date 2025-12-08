import { useState, useEffect } from 'react';
import './HomeVisitScheduler.css';

export default function HomeVisitScheduler() {
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({ address: '', requestedDateTime: '', notes: '' });
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
      if (data.ok) { setForm({ address: '', requestedDateTime: '', notes: '' }); fetchVisits(); alert('Visit requested'); }
      else alert(data.error || 'Could not request visit');
    } catch (err) { console.error(err); alert('Server error'); }
  };

  return (
    <div className="visits-root">
      <h2>Home Visit Scheduling</h2>
      <div className="visits-layout">
        <form className="visit-form" onSubmit={handleSubmit}>
          <label>Address</label>
          <input name="address" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} required />
          <label>Requested Date & Time</label>
          <input type="datetime-local" name="requestedDateTime" value={form.requestedDateTime} onChange={(e)=>setForm({...form,requestedDateTime:e.target.value})} required />
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} />
          <button type="submit" className="btn">Request Visit</button>
        </form>

        <div className="visits-list">
          <h3>Your Visits</h3>
          {visits.length === 0 ? <p>No visits yet.</p> : (
            <ul>
              {visits.map(v => (
                <li key={v._id} className="visit-item">
                  <div><strong>{new Date(v.requestedDateTime).toLocaleString()}</strong></div>
                  <div>{v.address}</div>
                  <div className="muted">Status: {v.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
