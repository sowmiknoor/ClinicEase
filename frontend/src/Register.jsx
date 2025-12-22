import { useState } from "react";
import { useLanguage } from './LanguageContext';
import './Register.css';

export default function Register({ onRegistered, onSwitchToLogin }) {
  const { t } = useLanguage();
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
      setMessage(t('passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setStatus('error');
      setMessage(t('passwordTooShort') || 'Password must be at least 6 characters long');
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
        setMessage(t('accountCreatedSuccess') || 'Account created successfully! Logging you in...');
        
        // Auto-login after successful registration
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });
          const loginData = await loginRes.json();
          
          if (loginData.ok) {
            // Store user data
            const userLanguage = loginData.user.language || 'en';
            localStorage.setItem('userId', loginData.user.id);
            localStorage.setItem('userName', loginData.user.name);
            localStorage.setItem('userRole', loginData.user.role || 'Patient');
            localStorage.setItem(`userLanguage_${loginData.user.id}`, userLanguage);
            localStorage.setItem('user', JSON.stringify({
              id: loginData.user.id,
              userId: loginData.user.id,
              _id: loginData.user.id,
              name: loginData.user.name,
              email: loginData.user.email,
              role: loginData.user.role || 'Patient',
              darkMode: loginData.user.darkMode || false,
              language: userLanguage
            }));
            
            // Trigger storage event to update language context
            window.dispatchEvent(new Event('storage'));
            
            setTimeout(() => {
              setMessage(null);
              if (onRegistered) onRegistered();
            }, 1000);
          } else {
            // If auto-login fails, just redirect to login page
            setTimeout(() => {
              setMessage(null);
              if (onRegistered) onRegistered();
            }, 1500);
          }
        } catch (loginErr) {
          // If auto-login fails, just redirect to login page
          setTimeout(() => {
            setMessage(null);
            if (onRegistered) onRegistered();
          }, 1500);
        }
        
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
    const labels = [
      t('weak') || 'Weak',
      t('fair') || 'Fair', 
      t('good') || 'Good',
      t('strong') || 'Strong',
      t('veryStrong') || 'Very Strong'
    ];
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
          <h2 className="brand-tagline">{t('joinThousands') || 'Join Thousands of Users'}</h2>
          <p className="brand-description">
            {t('registerDescription') || 'Create your account today and experience the future of healthcare management. Join patients, doctors, and healthcare professionals already using ClinicEase.'}
          </p>
          
          <div className="benefit-list">
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>{t('secureAndPrivate') || 'Secure and Private'}</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>{t('access247') || '24/7 Access to Records'}</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>{t('instantNotifications') || 'Instant Notifications'}</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <p>{t('multiPlatform') || 'Multi-platform Support'}</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-number">10K+</p>
              <p className="stat-label">{t('activeUsers') || 'Active Users'}</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">500+</p>
              <p className="stat-label">{t('doctors') || 'Doctors'}</p>
            </div>
            <div className="stat-item">
              <p className="stat-number">50K+</p>
              <p className="stat-label">{t('consultations') || 'Consultations'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <h2>{t('createAccount') || 'Create Account'}</h2>
            <p>{t('startYourJourney') || 'Start your healthcare journey today'}</p>
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
              <label htmlFor="name">{t('fullName') || 'Full Name'}</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input 
                  id="name"
                  name="name" 
                  type="text"
                  placeholder={t('fullNamePlaceholder') || 'John Doe'}
                  value={formData.name} 
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email') || 'Email Address'}</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  placeholder={t('emailPlaceholder') || 'you@example.com'}
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">{t('iAmA') || 'I am a'}</label>
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
                    <p className="role-name">{t('patient') || 'Patient'}</p>
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
                    <p className="role-name">{t('doctor') || 'Doctor'}</p>
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
                    <p className="role-name">{t('admin') || 'Admin'}</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password') || 'Password'}</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  placeholder={t('createStrongPassword') || 'Create a strong password'}
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
              <label htmlFor="confirmPassword">{t('confirmPassword') || 'Confirm Password'}</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  id="confirmPassword"
                  name="confirmPassword" 
                  type="password" 
                  placeholder={t('reEnterPassword') || 'Re-enter your password'}
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" required id="terms" />
              <label htmlFor="terms" className="terms-text">
                {t('agreeToTerms') || 'I agree to the'} <a href="#terms" className="terms-link">{t('termsOfService') || 'Terms of Service'}</a> {t('and') || 'and'} <a href="#privacy" className="terms-link">{t('privacyPolicy') || 'Privacy Policy'}</a>
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
                  {t('creatingAccount') || 'Creating Account...'}
                </>
              ) : (
                <>
                  {t('createAccount') || 'Create Account'}
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>{t('alreadyHaveAccount') || 'Already have an account?'} <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }} className="login-link">{t('signInHere') || 'Sign in here'}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
