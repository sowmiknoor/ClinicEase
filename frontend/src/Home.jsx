import './Home.css';

export default function Home({ onNavigate }) {
  return (
    <div className="home-root max-w-7xl mx-auto px-4">

      <header className="home-hero professional">
        <div className="hero-left">
          <h1>Compassionate care, delivered — anytime, anywhere</h1>
          <p className="lead">ClinicEase brings trusted clinical tools to your fingertips — symptom evaluation, medication management, home visits and secure tele-consultations.</p>

          <div className="cta-group">
            <button className="primary" onClick={() => onNavigate('register')}>Create Account</button>
            <button className="secondary" onClick={() => onNavigate('symptom')}>Try Symptom Checker</button>
          </div>

          <ul className="trust-list">
            <li><strong>HIPAA-aware</strong> — privacy-first design</li>
            <li><strong>Verified Doctors</strong> — curated clinician network</li>
            <li><strong>24/7 Support</strong> — assistance when you need it</li>
          </ul>
        </div>

        <div className="hero-right">
          {/* Simple inline medical illustration */}
          <div className="illustration">
            <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="8" y="20" width="304" height="220" rx="18" fill="#ffffff" stroke="#e6f0fa" strokeWidth="2"/>
              <g transform="translate(32,42)">
                <circle cx="56" cy="44" r="36" fill="#eaf8ff" stroke="#bdeafc" />
                <path d="M56 34v20" stroke="#2b9edb" strokeWidth="3" strokeLinecap="round" />
                <path d="M46 44h20" stroke="#2b9edb" strokeWidth="3" strokeLinecap="round" />

                <rect x="120" y="10" width="110" height="20" rx="6" fill="#f7fbff" stroke="#e6f0fa" />
                <rect x="120" y="40" width="70" height="12" rx="4" fill="#eef9ff" />

                <rect x="0" y="100" width="220" height="60" rx="8" fill="#f7fcfe" stroke="#e0f2fb" />
                <text x="16" y="132" fill="#2b9edb" fontSize="12" fontWeight="700">Today's Schedule</text>
                <text x="16" y="150" fill="#334854" fontSize="11">2 reminders • 1 upcoming visit</text>
              </g>
            </svg>
          </div>
        </div>
      </header>

      <section className="features professional-features">
        <h3>Core Features</h3>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="icon">🩺</div>
            <h4>Smart Symptom Checker</h4>
            <p>Fast triage to guide you to the right care and specialists.</p>
          </article>

          <article className="feature-card">
            <div className="icon">💊</div>
            <h4>Medication Management</h4>
            <p>Reminders, adherence tracking, and quick refill requests.</p>
          </article>

          <article className="feature-card">
            <div className="icon">🏠</div>
            <h4>Home Visit Scheduling</h4>
            <p>Request vetted providers to visit your home with ETA and route tracking.</p>
          </article>

          <article className="feature-card">
            <div className="icon">💻</div>
            <h4>Tele-Consultations</h4>
            <p>Secure video calls and e-prescriptions from verified clinicians.</p>
          </article>
        </div>
      </section>

      <section className="trust-strip">
        <p>Trusted by clinics and patients — integrations with local pharmacies and labs.</p>
      </section>

      <footer className="home-footer">
        <div>© {new Date().getFullYear()} ClinicEase</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
