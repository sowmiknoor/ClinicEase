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
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Secure and Private</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">24/7 Access to Records</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Instant Notifications</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Multi-platform Support</span>
            </div>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <h3>10K+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Doctors</p>
            </div>
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Consultations</p>
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
              <div className="role-selector">
                <label className={`role-option ${formData.role === 'Patient' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="Patient" 
                    checked={formData.role === 'Patient'}
                    onChange={handleChange}
                  />
                  <span className="role-icon">🏥</span>
                  <span className="role-label">Patient</span>
                </label>
                <label className={`role-option ${formData.role === 'Doctor' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="Doctor" 
                    checked={formData.role === 'Doctor'}
                    onChange={handleChange}
                  />
                  <span className="role-icon">👨‍⚕️</span>
                  <span className="role-label">Doctor</span>
                </label>
                <label className={`role-option ${formData.role === 'Admin' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="Admin" 
                    checked={formData.role === 'Admin'}
                    onChange={handleChange}
                  />
                  <span className="role-icon">⚙️</span>
                  <span className="role-label">Admin</span>
                </label>
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
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-label"
                    style={{ color: getPasswordStrengthColor() }}
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
              <label>
                <input type="checkbox" required />
                <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
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
            <p>Already have an account? <a href="#login" className="login-link">Sign in here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
