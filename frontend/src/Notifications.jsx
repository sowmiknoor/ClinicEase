import { useEffect, useState } from 'react';
import './Care.css';

export default function Notifications() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [list, setList] = useState([]);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications', { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.notifications || []);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const send = async (e) => {
    e.preventDefault();
    const payload = { title, body, userId: targetUser || userId };
    const res = await fetch('/api/notifications', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setTitle(''); setBody(''); setTargetUser(''); fetchNotifications(); }
  };

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: header });
    fetchNotifications();
  };

  return (
    <div className="care-section">
      <h2>Notifications</h2>
      <p className="lead">Create and manage notifications for yourself or patients.</p>

      {userRole !== 'Patient' && (
        <form className="card" onSubmit={send}>
          <h4>Send Notification</h4>
          <div className="row">
            <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
            <input className="input" placeholder="Target User ID (opt.)" value={targetUser} onChange={e=>setTargetUser(e.target.value)} />
          </div>
          <textarea className="input" placeholder="Message" value={body} onChange={e=>setBody(e.target.value)} required />
          <button className="btn" type="submit">Send</button>
        </form>
      )}

      <div className="card">
        <h4>Your Notifications</h4>
        <ul className="list">
          {list.map(n => (
            <li key={n._id} className="list-item">
              <div>
                <div className="muted">{n.read ? '✓' : '●'} {new Date(n.createdAt).toLocaleString()}</div>
                <div style={{fontWeight:700}}>{n.title}</div>
                <div>{n.body}</div>
              </div>
              {!n.read && (
                <button className="btn secondary" onClick={()=>markRead(n._id)}>Mark Read</button>
              )}
            </li>
          ))}
          {list.length===0 && <li className="muted">No notifications.</li>}
        </ul>
      </div>
    </div>
  );
}
