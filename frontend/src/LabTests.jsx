import { useEffect, useState } from 'react';
import './Care.css';

export default function LabTests() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ testType: '', scheduledDate: '', notes: '' });
  const [list, setList] = useState([]);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchData = async () => {
    const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
    const res = await fetch(`/api/labtests${query}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.labTests || []);
  };
  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, patientId: userRole === 'Patient' ? userId : (patientId || userId) };
    const res = await fetch('/api/labtests', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setForm({ testType:'', scheduledDate:'', notes:'' }); fetchData(); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/labtests/${id}/status`, { method: 'PATCH', headers: header, body: JSON.stringify({ status }) });
    fetchData();
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>Lab Tests</h2>
          <p className="lead">Order and track lab tests. Patients see their own; doctors/admin can pick a patient.</p>
        </div>
        {userRole !== 'Patient' && <input className="input" placeholder="Patient ID" value={patientId} onChange={e=>setPatientId(e.target.value)} />}
      </div>

      <form className="card" onSubmit={submit}>
        <h4>Order / Schedule</h4>
        <div className="row">
          <input className="input" placeholder="Test type" value={form.testType} onChange={e=>setForm({...form,testType:e.target.value})} required />
          <input className="input" type="datetime-local" value={form.scheduledDate} onChange={e=>setForm({...form,scheduledDate:e.target.value})} />
        </div>
        <textarea className="input" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        <button className="btn" type="submit">Save</button>
      </form>

      <div className="card">
        <h4>Existing</h4>
        <ul className="list">
          {list.map(t => (
            <li key={t._id} className="list-item">
              <div>
                <div className="muted">Status: {t.status}</div>
                <div>{t.testType}</div>
                {t.resultUrl && <div className="muted">Result: {t.resultUrl}</div>}
              </div>
              <div className="actions">
                <button className="btn secondary" onClick={()=>updateStatus(t._id,'completed')}>Mark Completed</button>
                <button className="btn secondary" onClick={()=>updateStatus(t._id,'cancelled')}>Cancel</button>
              </div>
            </li>
          ))}
          {list.length===0 && <li className="muted">No lab tests yet.</li>}
        </ul>
      </div>
    </div>
  );
}
