import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './Profile.css';

function Profile() {
  const { t } = useLanguage();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    role: '',
    picture: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [stats, setStats] = useState({
    memberSince: 'Jan 2024',
    appointments: 12,
    prescriptions: 8,
    notifications: 3
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('userRole') || 'Patient';

    // Get profile data from localStorage or use defaults
    const savedProfile = localStorage.getItem(`profile_${userId}`);
    const defaultPictures = {
      Patient: '🧑‍⚕️',
      Doctor: '👨‍⚕️',
      Admin: '👔'
    };

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserInfo(profile);
      setEditedInfo(profile);
    } else {
      const defaultProfile = {
        name: name,
        email: localStorage.getItem(`email_${userId}`) || `${name.toLowerCase().replace(/\s+/g, '.')}@clinicease.com`,
        phone: localStorage.getItem(`phone_${userId}`) || '+91 98765 43210',
        age: localStorage.getItem(`age_${userId}`) || (role === 'Doctor' ? '35' : role === 'Admin' ? '42' : '28'),
        role: role,
        picture: localStorage.getItem(`picture_${userId}`) || defaultPictures[role] || '👤'
      };
      setUserInfo(defaultProfile);
      setEditedInfo(defaultProfile);
    }

    // Load stats
    const savedStats = localStorage.getItem(`stats_${userId}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - revert changes
      setEditedInfo(userInfo);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const userId = localStorage.getItem('userId');
    
    // Save to localStorage
    localStorage.setItem(`profile_${userId}`, JSON.stringify(editedInfo));
    localStorage.setItem(`email_${userId}`, editedInfo.email);
    localStorage.setItem(`phone_${userId}`, editedInfo.phone);
    localStorage.setItem(`age_${userId}`, editedInfo.age);
    localStorage.setItem(`picture_${userId}`, editedInfo.picture);
    
    // Update userName in global localStorage if name changed
    if (editedInfo.name !== userInfo.name) {
      localStorage.setItem('userName', editedInfo.name);
    }

    setUserInfo(editedInfo);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleChangePhoto = () => {
    const emojis = ['🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '👔', '👤', '😊', '🙂', '😎', '🤓', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔬', '👩‍🔬'];
    const currentIndex = emojis.indexOf(userInfo.picture);
    const nextIndex = (currentIndex + 1) % emojis.length;
    const newPicture = emojis[nextIndex];
    
    const userId = localStorage.getItem('userId');
    localStorage.setItem(`picture_${userId}`, newPicture);
    
    setUserInfo(prev => ({ ...prev, picture: newPicture }));
    setEditedInfo(prev => ({ ...prev, picture: newPicture }));
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button className="cancel-btn" onClick={handleEditToggle}>Cancel</button>
                <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
              </>
            ) : (
              <button className="edit-btn" onClick={handleEditToggle}>Edit Profile</button>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {userInfo.picture}
            </div>
            <button className="change-photo-btn" onClick={handleChangePhoto}>
              Change Photo
            </button>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="detail-input"
                    value={editedInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">
                    <span className="icon">👤</span>
                    <span>{userInfo.name}</span>
                  </div>
                )}
              </div>

              <div className="detail-item">
                <label>Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="detail-input"
                    value={editedInfo.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    min="1"
                    max="120"
                  />
                ) : (
                  <div className="detail-value">
                    <span className="icon">🎂</span>
                    <span>{userInfo.age} years</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="detail-input"
                    value={editedInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">
                    <span className="icon">📧</span>
                    <span>{userInfo.email}</span>
                  </div>
                )}
              </div>

              <div className="detail-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="detail-input"
                    value={editedInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">
                    <span className="icon">📱</span>
                    <span>{userInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item full-width">
                <label>Role</label>
                <div className="detail-value">
                  <span className="icon">💼</span>
                  <span className={`role-tag ${userInfo.role.toLowerCase()}`}>
                    {userInfo.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{stats.memberSince}</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-label">Appointments</span>
                <span className="stat-value">{stats.appointments}</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">💊</div>
              <div className="stat-info">
                <span className="stat-label">Prescriptions</span>
                <span className="stat-value">{stats.prescriptions}</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🔔</div>
              <div className="stat-info">
                <span className="stat-label">Notifications</span>
                <span className="stat-value">{stats.notifications} New</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
