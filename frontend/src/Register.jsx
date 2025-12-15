import { useState } from "react";
import './Register.css';

export default function Register({ onRegistered, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Patient',
  });
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
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

    if (formData.password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('success');
        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          setMessage(null);
          if (onRegistered) onRegistered();
        }, 1500);
        setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'Patient' });
      } else {
        setStatus('error');
        setMessage(data.msg || data.message || 'Registration failed.');
        setIsLoading(false);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error connecting to server.');
      setIsLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[passwordStrength];
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
    return colors[passwordStrength];
  };

  return (
    <div className="register-root">
      {/* Animated Background */}
      <div className="register-bg-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="register-left">
        <div className="register-branding">
          <div className="brand-logo">
            <div className="logo-icon">⚕️</div>
            <h1>ClinicEase</h1>
          </div>
          <h2 className="brand-tagline">Join Thousands of Users</h2>
          <p className="brand-description">
            Create your account today and experience the future of healthcare management.
            Join patients, doctors, and healthcare professionals already using ClinicEase.
          </p>
          
          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>Secure and Private</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>24/7 Access to Records</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>Instant Notifications</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>Multi-platform Support</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-number">10K+</p>
              <p className="stat-label">Active Users</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">500+</p>
              <p className="stat-label">Doctors</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">50K+</p>
              <p className="stat-label">Consultations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Start your healthcare journey today</p>
          </div>

          {message && (
            <div className={`register-alert ${status === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span className="alert-icon">
                {status === 'success' ? '✓' : '⚠'}
              </span>
              <span className="alert-text">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="register-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  id="name"
                  name="name" 
                  type="text"
                  placeholder="John Doe" 
                  value={formData.name} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  placeholder="you@example.com" 
                  value={formData.email} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">I am a</label>
              <div className="role-grid">
                <div className="role-option">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Patient" 
                    checked={formData.role === 'Patient'}
                    onChange={handleChange}
                    id="role-patient"
                  />
                  <label htmlFor="role-patient" className="role-label">
                    <span className="role-icon">🏥</span>
                    <p className="role-name">Patient</p>
                  </label>
                </div>
                <div className="role-option">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Doctor" 
                    checked={formData.role === 'Doctor'}
                    onChange={handleChange}
                    id="role-doctor"
                  />
                  <label htmlFor="role-doctor" className="role-label">
                    <span className="role-icon">👨‍⚕️</span>
                    <p className="role-name">Doctor</p>
                  </label>
                </div>
                <div className="role-option">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Admin" 
                    checked={formData.role === 'Admin'}
                    onChange={handleChange}
                    id="role-admin"
                  />
                  <label htmlFor="role-admin" className="role-label">
                    <span className="role-icon">⚙️</span>
                    <p className="role-name">Admin</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  placeholder="Create a strong password" 
                  value={formData.password} 
                  onChange={handleChange}
                  required
                />
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((bar) => (
                      <div 
                        key={bar}
                        className={`strength-bar ${bar <= passwordStrength ? 'active' : ''}`}
                        style={{ backgroundColor: bar <= passwordStrength ? getPasswordStrengthColor() : '#e2e8f0' }}
                      ></div>
                    ))}
                  </div>
                  <span 
                    className={`strength-text strength-${getPasswordStrengthLabel().toLowerCase().replace(' ', '-')}`}
                  >
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  id="confirmPassword"
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Re-enter your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" required id="terms" />
              <label htmlFor="terms" className="terms-text">
                I agree to the <a href="#terms" className="terms-link">Terms of Service</a> and <a href="#privacy" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <button 
              className="register-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }} className="login-link">Sign in here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
