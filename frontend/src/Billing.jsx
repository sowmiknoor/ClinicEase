import { useEffect, useState } from 'react';
import './Care.css';

export default function Billing() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ amount: '', description: '', dueDate: '' });
  const [list, setList] = useState([]);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchData = async () => {
    const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
    const res = await fetch(`/api/billing${query}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.invoices || []);
  };
  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount), patientId: userRole === 'Patient' ? userId : (patientId || userId) };
    const res = await fetch('/api/billing', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setForm({ amount:'', description:'', dueDate:'' }); fetchData(); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/billing/${id}/status`, { method: 'PATCH', headers: header, body: JSON.stringify({ status }) });
    fetchData();
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>Billing & Payments</h2>
          <p className="lead">
            {userRole === 'Patient' && 'View and manage your invoices and payment status.'}
            {userRole === 'Doctor' && 'Create and manage patient invoices.'}
            {userRole === 'Admin' && 'Manage all system billing and invoices.'}
          </p>
        </div>
        {userRole !== 'Patient' && <input className="input" placeholder="Patient ID (Doctor/Admin)" value={patientId} onChange={e=>setPatientId(e.target.value)} />}
      </div>

      {(userRole === 'Doctor' || userRole === 'Admin') && (
        <form className="card" onSubmit={submit}>
          <h4>Create New Invoice</h4>
          <div className="row">
            <input className="input" type="number" placeholder="Amount (₹)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required />
            <input className="input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
          </div>
          <textarea className="input" placeholder="Description (services, consultation, etc.)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <button className="btn" type="submit">Create Invoice</button>
        </form>
      )}

      <div className="card">
        <h4>{userRole === 'Patient' ? 'My Invoices' : 'All Invoices'}</h4>
        {list.length === 0 ? (
          <p className="text-gray-500">No invoices found.</p>
        ) : (
        <ul className="list">
          {list.map(inv => (
            <li key={inv._id} className="list-item">
              <div>
                <div className="font-semibold mb-2">₹{inv.amount?.toFixed(2)}</div>
                <div className="text-sm mb-1">{inv.description}</div>
                {inv.dueDate && <div className="muted text-xs">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>}
                <div className={`status-badge ${inv.status}`}>Status: {inv.status}</div>
              </div>
              {userRole === 'Patient' && inv.status === 'unpaid' && (
                <div className="actions">
                  <button className="btn" onClick={()=>updateStatus(inv._id,'paid')}>Mark Paid</button>
                </div>
              )}
              {(userRole === 'Doctor' || userRole === 'Admin') && (
                <div className="actions">
                  <button className="btn secondary" onClick={()=>updateStatus(inv._id,'paid')}>Mark Paid</button>
                  <button className="btn secondary" onClick={()=>updateStatus(inv._id,'cancelled')}>Cancel</button>
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
