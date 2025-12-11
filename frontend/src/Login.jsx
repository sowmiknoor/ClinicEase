import { useState } from "react";
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) {
        // Store userId and name for other components
        try {
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('userRole', data.user.role || 'Patient');
          // Also store as JSON object for components that expect it
          localStorage.setItem('user', JSON.stringify({
            userId: data.user.id,
            _id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'Patient'
          }));
        } catch (e) {}
        setStatus('success');
        setMsg(`Login successful — Welcome ${data.user.name}`);
        setTimeout(() => {
          setMsg(null);
          if (onLoginSuccess) onLoginSuccess();
        }, 900);
      } else {
        setStatus('error');
        setMsg(data.msg || 'Login failed');
      }
    } catch (err) {
      setStatus('error');
      setMsg('Server error — please try again');
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h2>Sign in to ClinicEase</h2>
        <p className="helper">Enter your registered email and password to continue.</p>

        <form onSubmit={handleSubmit} autoComplete="off" className="login-form">
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="username" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" />
          <button className="login-btn" type="submit">Sign in</button>
        </form>

        {msg && (
          <div className={`login-msg ${status === 'success' ? 'success' : 'error'}`}>{msg}</div>
        )}

        <div className="small-link">
          <button onClick={() => window.alert('Password reset coming soon')}>Forgot password?</button>
        </div>
      </div>
    </div>
  );
}
