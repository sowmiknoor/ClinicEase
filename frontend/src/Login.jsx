import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './Login.css';

export default function Login({ onLoginSuccess, onSwitchToRegister, onNavigateHome }) {
  const { t } = useLanguage();
  
  // Remove dark mode when viewing login page (only logged-in users should have dark mode)
  useEffect(() => {
    document.body.classList.remove('dark-mode');
  }, []);
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setStatus(null);
    setIsLoading(true);

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
          
          // Get user's language preference if exists
          const userLanguage = data.user.language || 'en';
          localStorage.setItem(`userLanguage_${data.user.id}`, userLanguage);
          
          // Also store as JSON object for components that expect it
          localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            userId: data.user.id,
            _id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'Patient',
            darkMode: data.user.darkMode || false,
            language: userLanguage
          }));
          
          // Apply dark mode immediately if enabled
          if (data.user.darkMode) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
          
          // Trigger storage event to update language context
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
        setStatus('success');
        setMsg(`Login successful! Welcome ${data.user.name}`);
        setTimeout(() => {
          setMsg(null);
          if (onLoginSuccess) onLoginSuccess();
        }, 1200);
      } else {
        setStatus('error');
        setMsg(data.msg || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setStatus('error');
      setMsg('Server error — please try again');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-root">
        {/* Top Logo Header */}
        <div className="login-top-header">
          <div className="top-logo">
            <span className="top-logo-icon">⚕️</span>
            <span className="top-logo-text">CLINICEASE</span>
          </div>
        </div>

        {/* Animated Background */}
        <div className="login-bg-animation">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="login-branding">
            <div className="brand-logo">
              <div className="logo-icon">⚕️</div>
              <h1>ClinicEase</h1>
            </div>
          <h2 className="brand-tagline">Your Health, Our Priority</h2>
          <p className="brand-description">
            Experience seamless healthcare management with our comprehensive platform. 
            Connect with doctors, manage medications, schedule appointments, and access 
            your medical records - all in one place.
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🏥</span>
              <div className="feature-text">
                <h4>Tele-Consultation</h4>
                <p>Connect with doctors online</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💊</span>
              <div className="feature-text">
                <h4>Medication Tracking</h4>
                <p>Never miss a dose</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔬</span>
              <div className="feature-text">
                <h4>Lab Results</h4>
                <p>Access reports instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>{t('welcomeBack') || 'Welcome Back!'}</h2>
            <p>{t('signInToContinue') || 'Sign in to your account to continue'}</p>
          </div>

          {msg && (
            <div className={`login-alert ${status === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span className="alert-icon">
                {status === 'success' ? '✓' : '⚠'}
              </span>
              <span className="alert-text">{msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="login-form">
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  placeholder={t('emailPlaceholder') || "you@example.com"}
                  value={form.email} 
                  onChange={handleChange} 
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  placeholder={t('passwordPlaceholder') || "Enter your password"}
                  value={form.password} 
                  onChange={handleChange} 
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>{t('rememberMe')}</span>
              </label>
              <button 
                type="button" 
                className="forgot-password"
                onClick={() => alert(t('passwordResetSoon') || 'Password reset feature coming soon!')}
              >
                {t('forgotPassword')}
              </button>
            </div>

            <button 
              className="login-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  {t('signingIn') || 'Signing in...'}
                </>
              ) : (
                <>
                  {t('signIn')}
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>{t('dontHaveAccount')} <button onClick={onSwitchToRegister} className="register-link">{t('createAccount') || 'Create one now'}</button></p>
            <p className="help-text">
              {t('needHelp') || 'Need help?'} <button onClick={() => setShowContactModal(true)} className="contact-btn">{t('contactSupport') || 'Contact Support'}</button>
            </p>
            <p className="help-text" style={{ marginTop: '10px' }}>
              <button onClick={onNavigateHome} className="contact-btn" style={{ color: '#667eea' }}>← {t('backToHome') || 'Back to Home'}</button>
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Modal - Rendered outside login-root to avoid overflow issues */}
    {showContactModal && (
      <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
        <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="contact-modal-close" onClick={() => setShowContactModal(false)}>
            ×
          </button>
          <div className="contact-modal-header">
            <div className="contact-icon">📞</div>
            <h3>Contact Information</h3>
          </div>
          <div className="contact-modal-body">
            <div className="contact-info-item">
              <span className="contact-label">Owner:</span>
              <span className="contact-value">Sowmik Noor</span>
            </div>
            <div className="contact-info-item">
              <span className="contact-label">Email:</span>
              <a href="mailto:sowmiknoor5@gmail.com" className="contact-email">
                sowmiknoor5@gmail.com
              </a>
            </div>
          </div>
          <div className="contact-modal-footer">
            <button className="contact-modal-btn" onClick={() => setShowContactModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
