import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import './Home.css';

export default function Home({ onNavigate, onLoginSuccess }) {
  const { t } = useLanguage();
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
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userRole', data.user.role || 'Patient');
        setStatus('success');
        setMsg(`Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 800);
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
    <div className="landing-page">
      <div className="landing-container">
        {/* Left Side - Marketing Content */}
        <div className="landing-left">
          <div className="landing-brand">
            <h1 className="brand-title">ClinicEase</h1>
            <p className="brand-tagline">Your Health, Simplified</p>
          </div>

          <h2 className="hero-headline">
            Compassionate Healthcare,
            <span className="gradient-text"> Anytime, Anywhere</span>
          </h2>

          <p className="hero-description">
            Experience seamless healthcare management with ClinicEase — your trusted partner for 
            symptom checking, medication tracking, home visits, and virtual consultations.
          </p>

          <div className="feature-highlights">
            <div className="highlight-item">
              <div className="highlight-icon">🏥</div>
              <div>
                <h4>24/7 Healthcare Access</h4>
                <p>Connect with verified doctors anytime</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">🔒</div>
              <div>
                <h4>HIPAA Compliant</h4>
                <p>Your privacy is our top priority</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">💊</div>
              <div>
                <h4>Smart Reminders</h4>
                <p>Never miss a medication or appointment</p>
              </div>
            </div>
          </div>

          <div className="trust-badges">
            <span className="badge">✓ 10,000+ Patients</span>
            <span className="badge">✓ 500+ Doctors</span>
            <span className="badge">✓ 24/7 Support</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="landing-right">
          <div className="login-box">
            <h3>Welcome Back</h3>
            <p className="login-subtitle">Sign in to access your health dashboard</p>

            <form onSubmit={handleSubmit} className="landing-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {msg && (
                <div className={`landing-msg ${status}`}>
                  {msg}
                </div>
              )}

              <button type="submit" className="login-submit-btn">
                Sign In
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button onClick={() => onNavigate('register')} className="register-btn">
              Create New Account
            </button>

            <p className="help-text">
              Need help? <a href="#">Contact Support</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} ClinicEase. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
