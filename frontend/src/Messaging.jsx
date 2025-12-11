import { useEffect, useState } from 'react';
import './Care.css';

export default function Messaging() {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [toUser, setToUser] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState('');
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/messages/recipients', { headers: header });
      const data = await res.json();
      if (data.ok) {
        setRecipients(data.recipients || []);
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
    }
  };

  const fetchMessages = async () => {
    const res = await fetch('/api/messages', { headers: header });
    const data = await res.json();
    if (data.ok) setMessages(data.messages || []);
  };

  useEffect(() => { 
    fetchMessages();
    fetchRecipients();
  }, []);

  const send = async (e) => {
    e.preventDefault();
    setError('');
    if (!toUser || !content) return;
    
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: header,
      body: JSON.stringify({ toUser, content })
    });
    const data = await res.json();
    
    if (data.ok) { 
      setContent(''); 
      setToUser('');
      fetchMessages(); 
    } else {
      setError(data.msg || 'Failed to send message');
    }
  };

  const markRead = async (id) => {
    await fetch(`/api/messages/${id}/read`, { method: 'PATCH', headers: header });
    fetchMessages();
  };

  const getRecipientLabel = () => {
    if (userRole === 'Patient') return 'Select Doctor';
    if (userRole === 'Doctor') return 'Select Patient';
    if (userRole === 'Admin') return 'Select Recipient';
    return 'Select Recipient';
  };

  return (
    <div className="care-section">
      <h2>Secure Messaging</h2>
      <p className="lead">
        {userRole === 'Patient' && 'Send messages to doctors.'}
        {userRole === 'Doctor' && 'Communicate with your existing patients.'}
        {userRole === 'Admin' && 'Message all patients and doctors in the system.'}
      </p>

      <form className="card" onSubmit={send}>
        <h4>Send Message</h4>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <div className="row">
          <select 
            className="input" 
            value={toUser} 
            onChange={e => setToUser(e.target.value)} 
            required
          >
            <option value="">-- {getRecipientLabel()} --</option>
            {recipients.map(recipient => (
              <option key={recipient._id} value={recipient._id}>
                {recipient.name} ({recipient.role}) - {recipient.email}
              </option>
            ))}
          </select>
          <button className="btn" type="submit">Send</button>
        </div>
        <textarea 
          className="input" 
          placeholder="Type your message..." 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          rows="4"
          required 
        />
        {userRole === 'Doctor' && recipients.length === 0 && (
          <p style={{ color: '#f59e0b', fontSize: '14px', marginTop: '8px' }}>
            ⚠️ No patients available. You can only message patients you have treated (created prescriptions or medical records for).
          </p>
        )}
      </form>

      <div className="card">
        <h4>Message Inbox</h4>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
        <ul className="list">
          {messages.map(m => {
            const isFromMe = m.fromUser?._id === userId;
            const otherUser = isFromMe ? m.toUser : m.fromUser;
            
            return (
              <li key={m._id} className="list-item">
                <div className="flex-1">
                  <div className="font-semibold mb-1">
                    {isFromMe ? (
                      <span>To: {otherUser?.name || 'Unknown'} ({otherUser?.role || 'N/A'})</span>
                    ) : (
                      <span>From: {otherUser?.name || 'Unknown'} ({otherUser?.role || 'N/A'})</span>
                    )}
                  </div>
                  <div className="text-sm mb-2">{m.content}</div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                    <span className={m.read ? 'text-green-600' : 'text-orange-600'}>
                      {m.read ? '✓ Read' : '● Unread'}
                    </span>
                  </div>
                </div>
                {m.toUser?._id === userId && !m.read && (
                  <button className="btn secondary" onClick={() => markRead(m._id)}>Mark Read</button>
                )}
              </li>
            );
          })}
        </ul>
        )}
      </div>
    </div>
  );
}
