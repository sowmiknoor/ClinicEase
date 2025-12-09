import { useEffect, useState } from 'react';
import './Care.css';

export default function Messaging() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [toUser, setToUser] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchMessages = async () => {
    const res = await fetch('/api/messages', { headers: header });
    const data = await res.json();
    if (data.ok) setMessages(data.messages || []);
  };

  useEffect(() => { fetchMessages(); }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!toUser || !content) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: header,
      body: JSON.stringify({ toUser, content })
    });
    const data = await res.json();
    if (data.ok) { setContent(''); fetchMessages(); }
  };

  const markRead = async (id) => {
    await fetch(`/api/messages/${id}/read`, { method: 'PATCH', headers: header });
    fetchMessages();
  };

  return (
    <div className="care-section">
      <h2>Secure Messaging</h2>
      <p className="lead">
        {userRole === 'Patient' && 'Send messages to your doctors.'}
        {userRole === 'Doctor' && 'Communicate with your patients.'}
        {userRole === 'Admin' && 'Internal messaging system.'}
      </p>

      <form className="card" onSubmit={send}>
        <h4>Send Message</h4>
        <div className="row">
          <input className="input" placeholder={`${userRole === 'Patient' ? 'Doctor ID' : 'Patient/User ID'}`} value={toUser} onChange={e=>setToUser(e.target.value)} required />
          <button className="btn" type="submit">Send</button>
        </div>
        <textarea className="input" placeholder="Type your message..." value={content} onChange={e=>setContent(e.target.value)} required />
      </form>

      <div className="card">
        <h4>Message Inbox</h4>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
        <ul className="list">
          {messages.map(m => (
            <li key={m._id} className="list-item">
              <div className="flex-1">
                <div className="font-semibold mb-1">{m.fromUser === userId ? `To: ${m.toUser}` : `From: ${m.fromUser}`}</div>
                <div className="text-sm mb-2">{m.content}</div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                  <span className={m.read ? 'text-green-600' : 'text-orange-600'}>
                    {m.read ? '✓ Read' : '● Unread'}
                  </span>
                </div>
              </div>
              {m.toUser === userId && !m.read && (
                <button className="btn secondary" onClick={()=>markRead(m._id)}>Mark Read</button>
              )}
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
