import { useState, useEffect } from 'react';
import './Messages.css';

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.role === 'patient') {
      fetchDoctors();
    } else if (userData.role === 'doctor') {
      fetchPatients();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors');
      const data = await res.json();
      if (data.ok) {
        setContacts(data.doctors);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/admin/users/role/patient');
      const data = await res.json();
      if (data.ok) {
        setContacts(data.users);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadConversation = async (otherId) => {
    try {
      const res = await fetch(`/api/messages-new/conversation/${user.userId}/${otherId}`);
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messages-new/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUser: user.userId,
          toUser: selectedContact._id,
          content: newMessage
        })
      });

      const data = await res.json();
      if (data.ok) {
        setNewMessage('');
        loadConversation(selectedContact._id);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="contacts-sidebar">
          <h2>💬 {user?.role === 'patient' ? 'Doctors' : 'Patients'}</h2>
          <div className="contacts-list">
            {contacts.map(contact => (
              <div 
                key={contact._id} 
                className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedContact(contact);
                  loadConversation(contact._id);
                }}
              >
                <div className="contact-avatar">{contact.name.charAt(0)}</div>
                <div className="contact-info">
                  <h4>{user?.role === 'patient' ? 'Dr. ' : ''}{contact.name}</h4>
                  <p>{contact.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedContact ? (
            <>
              <div className="chat-header">
                <h3>{user?.role === 'patient' ? 'Dr. ' : ''}{selectedContact.name}</h3>
                <p>{selectedContact.email}</p>
              </div>

              <div className="messages-list">
                {messages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`message ${msg.fromUser._id === user.userId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <form className="message-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a {user?.role === 'patient' ? 'doctor' : 'patient'} to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
