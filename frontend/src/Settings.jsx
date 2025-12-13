import { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const isDarkMode = user.darkMode || false;
      setDarkMode(isDarkMode);
      
      // Apply dark mode to body
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      }
    }
  }, []);

  const handleDarkModeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply to body immediately
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Save to backend
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      try {
        const response = await fetch('/api/auth/update-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            darkMode: newDarkMode
          })
        });

        const data = await response.json();
        
        if (data.ok) {
          // Update user in localStorage
          user.darkMode = newDarkMode;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        console.error('Failed to save dark mode setting:', err);
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h2>Settings</h2>
          <p>Manage your account preferences and app settings</p>
        </div>

        <div className="settings-content">
          {/* Appearance Section */}
          <div className="settings-section">
            <div className="section-header">
              <span className="section-icon">🎨</span>
              <h3>Appearance</h3>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Dark Mode</div>
                <div className="setting-description">
                  Enable dark theme for comfortable viewing in low-light environments
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-section">
            <div className="section-header">
              <span className="section-icon">🔔</span>
              <h3>Notifications</h3>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Push Notifications</div>
                <div className="setting-description">
                  Receive notifications about appointments and reminders
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Email Alerts</div>
                <div className="setting-description">
                  Get email updates about your health activities
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Account Section */}
          <div className="settings-section">
            <div className="section-header">
              <span className="section-icon">🔐</span>
              <h3>Account</h3>
            </div>
            <div className="setting-item clickable">
              <div className="setting-info">
                <div className="setting-label">Change Password</div>
                <div className="setting-description">
                  Update your password to keep your account secure
                </div>
              </div>
              <span className="arrow">›</span>
            </div>
            <div className="setting-item clickable">
              <div className="setting-info">
                <div className="setting-label">Privacy Settings</div>
                <div className="setting-description">
                  Control who can see your information
                </div>
              </div>
              <span className="arrow">›</span>
            </div>
          </div>

          {/* Data & Storage Section */}
          <div className="settings-section">
            <div className="section-header">
              <span className="section-icon">💾</span>
              <h3>Data & Storage</h3>
            </div>
            <div className="setting-item clickable">
              <div className="setting-info">
                <div className="setting-label">Download My Data</div>
                <div className="setting-description">
                  Export your health records and personal data
                </div>
              </div>
              <span className="arrow">›</span>
            </div>
            <div className="setting-item clickable">
              <div className="setting-info">
                <div className="setting-label">Clear Cache</div>
                <div className="setting-description">
                  Free up space by clearing cached data
                </div>
              </div>
              <span className="arrow">›</span>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-section">
            <div className="section-header">
              <span className="section-icon">ℹ️</span>
              <h3>About</h3>
            </div>
            <div className="about-grid">
              <div className="about-item">
                <span className="about-label">Version</span>
                <span className="about-value">1.0.0</span>
              </div>
              <div className="about-item">
                <span className="about-label">Last Updated</span>
                <span className="about-value">Dec 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
