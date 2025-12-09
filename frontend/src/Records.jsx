import { useEffect, useState } from 'react';
import './Care.css';

export default function Records() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ title: '', description: '', attachmentUrl: '' });
  const [list, setList] = useState([]);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchData = async () => {
    const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
    const res = await fetch(`/api/records${query}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.records || []);
  };
  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, patientId: userRole === 'Patient' ? userId : (patientId || userId) };
    const res = await fetch('/api/records', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setForm({ title:'', description:'', attachmentUrl:'' }); fetchData(); }
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>Medical Records</h2>
          <p className="lead">Upload structured records or links. Patients see their own; doctors/admin can target a patient.</p>
        </div>
        {userRole !== 'Patient' && <input className="input" placeholder="Patient ID" value={patientId} onChange={e=>setPatientId(e.target.value)} />}
      </div>

      <form className="card" onSubmit={submit}>
        <h4>Add Record</h4>
        <div className="row">
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <input className="input" placeholder="Attachment URL" value={form.attachmentUrl} onChange={e=>setForm({...form,attachmentUrl:e.target.value})} />
        </div>
        <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <button className="btn" type="submit">Save</button>
      </form>

      <div className="card">
        <h4>Existing</h4>
        <ul className="list">
          {list.map(r => (
            <li key={r._id} className="list-item">
              <div>
                <div>{r.title}</div>
                {r.description && <div className="muted">{r.description}</div>}
                {r.attachmentUrl && <div className="muted">Attachment: {r.attachmentUrl}</div>}
              </div>
            </li>
          ))}
          {list.length===0 && <li className="muted">No records yet.</li>}
        </ul>
      </div>
    </div>
  );
}
