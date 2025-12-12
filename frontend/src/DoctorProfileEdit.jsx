import { useState, useEffect } from 'react';
import './DoctorProfileEdit.css';

export default function DoctorProfileEdit() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    degrees: [],
    specialist: '',
    photo: '',
    bio: '',
    experience: '',
    consultationFee: '',
    availableDays: [],
    consultationHours: ''
  });

  const [degreeInput, setDegreeInput] = useState('');
  const [specialists, setSpecialists] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchUserProfile();
    fetchSpecialists();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`/api/doctors/profile/${userId}`);
      const data = await res.json();
      
      if (data.ok) {
        setProfile({
          name: data.doctor.name || '',
          email: data.doctor.email || '',
          phone: data.doctor.phone || '',
          designation: data.doctor.designation || '',
          degrees: data.doctor.degrees || [],
          specialist: data.doctor.specialist || '',
          photo: data.doctor.photo || '',
          bio: data.doctor.bio || '',
          experience: data.doctor.experience || '',
          consultationFee: data.doctor.consultationFee || '',
          availableDays: data.doctor.availableDays || [],
          consultationHours: data.doctor.consultationHours || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const res = await fetch('/api/doctors/specialists');
      const data = await res.json();
      if (data.ok) {
        setSpecialists(data.specialists);
      }
    } catch (err) {
      console.error('Failed to fetch specialists:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDegree = () => {
    if (degreeInput.trim()) {
      setProfile(prev => ({
        ...prev,
        degrees: [...prev.degrees, degreeInput.trim()]
      }));
      setDegreeInput('');
    }
  };

  const handleRemoveDegree = (index) => {
    setProfile(prev => ({
      ...prev,
      degrees: prev.degrees.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (day) => {
    setProfile(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();
      
      if (data.ok) {
        setMessage('✅ Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.msg || 'Failed to update profile'));
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage('❌ Failed to update profile');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="doctor-profile-edit">
      <div className="profile-edit-header">
        <h1>Edit Your Profile</h1>
        <p className="subtitle">Update your professional information</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Photo Upload */}
        <div className="form-section">
          <h2>📸 Profile Photo</h2>
          <div className="photo-upload-section">
            <div className="current-photo">
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" />
              ) : (
                <div className="photo-placeholder">
                  <span>👨‍⚕️</span>
                </div>
              )}
            </div>
            <div className="upload-controls">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-upload" className="upload-btn">
                Choose Photo
              </label>
              <p className="upload-hint">Recommended: Square image, at least 400x400px</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <h2>👤 Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                readOnly
                className="readonly-input"
              />
              <small>Name cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                readOnly
                className="readonly-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={profile.designation}
                onChange={handleInputChange}
                placeholder="e.g., Senior Consultant, Chief Physician"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="form-section">
          <h2>🎓 Professional Details</h2>
          
          <div className="form-group">
            <label>Specialist Category *</label>
            <select
              name="specialist"
              value={profile.specialist}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Specialist</option>
              {specialists.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Degrees/Qualifications</label>
            <div className="degrees-input-group">
              <input
                type="text"
                value={degreeInput}
                onChange={(e) => setDegreeInput(e.target.value)}
                placeholder="e.g., MBBS, MD, FRCS"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDegree())}
              />
              <button type="button" onClick={handleAddDegree} className="add-btn">
                Add
              </button>
            </div>
            <div className="degrees-list">
              {profile.degrees.map((degree, idx) => (
                <span key={idx} className="degree-chip">
                  {degree}
                  <button type="button" onClick={() => handleRemoveDegree(idx)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={profile.experience}
                onChange={handleInputChange}
                min="0"
                placeholder="Years"
              />
            </div>

            <div className="form-group">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                name="consultationFee"
                value={profile.consultationFee}
                onChange={handleInputChange}
                min="0"
                placeholder="Amount"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio/About</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              rows="4"
              placeholder="Brief description about yourself, your expertise, and approach to patient care..."
            />
          </div>
        </div>

        {/* Availability */}
        <div className="form-section">
          <h2>📆 Availability</h2>
          
          <div className="form-group">
            <label>Available Days</label>
            <div className="days-selector">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${profile.availableDays.includes(day) ? 'selected' : ''}`}
                  onClick={() => handleDayToggle(day)}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Consultation Hours</label>
            <input
              type="text"
              name="consultationHours"
              value={profile.consultationHours}
              onChange={handleInputChange}
              placeholder="e.g., 9:00 AM - 5:00 PM"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            💾 Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
