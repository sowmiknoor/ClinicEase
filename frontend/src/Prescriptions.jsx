import { useEffect, useState } from 'react';
import './Care.css';

export default function Prescriptions() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [medications, setMeds] = useState([{ name: '', dosage: '', frequency: '' }]);
  const [notes, setNotes] = useState('');
  const [list, setList] = useState([]);

  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };
  const effectivePatientId = userRole === 'Patient' ? userId : (patientId || userId);

  const fetchData = async () => {
    const res = await fetch(`/api/prescriptions${userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : ''}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.prescriptions || []);
  };

  useEffect(() => { fetchData(); }, []);

  const setMedField = (idx, field, value) => {
    const next = medications.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setMeds(next);
  };

  const addMed = () => setMeds([...medications, { name: '', dosage: '', frequency: '' }]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { patientId: effectivePatientId, medications, notes };
    const res = await fetch('/api/prescriptions', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setNotes(''); setMeds([{ name: '', dosage: '', frequency: '' }]); fetchData(); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/prescriptions/${id}/status`, { method: 'PATCH', headers: header, body: JSON.stringify({ status }) });
    fetchData();
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>Prescriptions</h2>
          <p className="lead">
            {userRole === 'Patient' && 'Review your prescriptions and medication details.'}
            {userRole === 'Doctor' && 'Create and manage prescriptions for your patients.'}
            {userRole === 'Admin' && 'Manage all system prescriptions.'}
          </p>
        </div>
        {userRole !== 'Patient' && (
          <input placeholder="Patient ID (Doctor/Admin)" value={patientId} onChange={e=>setPatientId(e.target.value)} className="input" />
        )}
      </div>

      {(userRole === 'Doctor' || userRole === 'Admin') && (
        <form className="card" onSubmit={submit}>
          <h4>Create New Prescription</h4>
          {medications.map((m, idx) => (
            <div key={idx} className="row">
              <input className="input" placeholder="Medication Name" value={m.name} onChange={e=>setMedField(idx,'name',e.target.value)} required />
              <input className="input" placeholder="Dosage (e.g., 500mg)" value={m.dosage} onChange={e=>setMedField(idx,'dosage',e.target.value)} />
              <input className="input" placeholder="Frequency (e.g., 3x daily)" value={m.frequency} onChange={e=>setMedField(idx,'frequency',e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={addMed}>+ Add Medication</button>
          <textarea className="input" placeholder="Clinical notes or instructions" value={notes} onChange={e=>setNotes(e.target.value)} />
          <button className="btn" type="submit">Save Prescription</button>
        </form>
      )}

      <div className="card">
        <h4>{userRole === 'Patient' ? 'My Prescriptions' : 'All Prescriptions'}</h4>
        {list.length === 0 ? (
          <p className="text-gray-500">No prescriptions found.</p>
        ) : (
          <ul className="list">
            {list.map(p => (
              <li key={p._id} className="list-item">
                <div>
                  <div className="font-semibold mb-2">Medications:</div>
                  <div className="mb-2">{p.medications.map(m => `${m.name} (${m.dosage || 'dose'} — ${m.frequency || 'frequency'})`).join(', ')}</div>
                  {p.notes && <div className="muted text-sm">Notes: {p.notes}</div>}
                  <div className={`status-badge ${p.status}`}>Status: {p.status}</div>
                </div>
                {(userRole === 'Doctor' || userRole === 'Admin') && (
                <div className="actions">
                  <button className="btn secondary" onClick={()=>updateStatus(p._id,'completed')}>Mark Completed</button>
                  <button className="btn secondary" onClick={()=>updateStatus(p._id,'cancelled')}>Cancel</button>
                </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
