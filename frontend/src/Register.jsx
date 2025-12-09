
import { useState } from "react";
import './Register.css';

export default function Register({ onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Patient',
  });
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setStatus(null);

    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('success');
        setMessage('User registered successfully — redirecting to login...');
        setTimeout(() => {
          setMessage(null);
          if (onRegistered) onRegistered();
        }, 1100);
        setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'Patient' });
      } else {
        setStatus('error');
        setMessage(data.msg || data.message || 'Registration failed.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="register-root">
      <div className="register-card">
        <h2>Create your ClinicEase account</h2>
        <p className="helper">Join patients and clinicians using ClinicEase for smarter care coordination.</p>

        {message && (
          <div className={`register-msg ${status === 'success' ? 'success' : 'error'}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="register-form">
          <input name="name" placeholder="Full name" value={formData.name} onChange={handleChange} className="full" required />
          <input name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Create password" value={formData.password} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>

          <button className="register-submit" type="submit">Create account</button>
        </form>
      </div>
    </div>
  );
}
