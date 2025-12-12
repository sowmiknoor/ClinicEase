import { useState, useEffect } from 'react';
import './DoctorProfileView.css';

export default function DoctorProfileView({ doctorId, onBack }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      // Get doctor ID from localStorage if not passed as prop
      const id = doctorId || localStorage.getItem('viewingDoctorId');
      
      console.log('Fetching doctor profile with ID:', id);
      
      if (!id) {
        console.error('No doctor ID provided');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/doctors/profile/${id}`);
      const data = await res.json();
      
      console.log('Doctor profile response:', data);
      
      if (data.ok) {
        setDoctor(data.doctor);
      } else {
        console.error('Failed to load doctor:', data.msg);
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Clear the stored doctor ID
    localStorage.removeItem('viewingDoctorId');
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return <div className="doctor-profile-loading">Loading doctor profile...</div>;
  }

  if (!doctor) {
    return (
      <div className="doctor-profile-error">
        <p>Doctor not found</p>
        <button onClick={handleBack} className="back-btn">← Back to Doctors</button>
      </div>
    );
  }

  return (
    <div className="doctor-profile-view">
      <button onClick={handleBack} className="back-btn">← Back to Doctors</button>
      
      <div className="profile-view-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-photo-large">
            {doctor.photo ? (
              <img src={doctor.photo} alt={doctor.name} />
            ) : (
              <div className="photo-placeholder-large">
                <span>👨‍⚕️</span>
              </div>
            )}
          </div>
          <div className="profile-info-header">
            <h1>{doctor.name}</h1>
            {doctor.designation && <p className="designation">{doctor.designation}</p>}
            {doctor.specialist && (
              <span className="specialist-badge-large">{doctor.specialist}</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content-grid">
          {/* Left Column */}
          <div className="profile-left">
            {/* Qualifications */}
            {doctor.degrees && doctor.degrees.length > 0 && (
              <div className="profile-section">
                <h2>🎓 Qualifications</h2>
                <div className="degrees-list">
                  {doctor.degrees.map((degree, index) => (
                    <span key={index} className="degree-chip">{degree}</span>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {doctor.bio && (
              <div className="profile-section">
                <h2>👨‍⚕️ About</h2>
                <p className="bio-text">{doctor.bio}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="profile-section">
              <h2>📞 Contact Information</h2>
              <div className="contact-info">
                {doctor.email && (
                  <div className="contact-item">
                    <span className="contact-label">Email:</span>
                    <a href={`mailto:${doctor.email}`} className="contact-value">{doctor.email}</a>
                  </div>
                )}
                {doctor.phone && (
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <a href={`tel:${doctor.phone}`} className="contact-value">{doctor.phone}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-right">
            {/* Experience & Fee */}
            <div className="info-cards">
              {doctor.experience && (
                <div className="info-card">
                  <div className="info-icon">⏳</div>
                  <div className="info-content">
                    <div className="info-label">Experience</div>
                    <div className="info-value">{doctor.experience} years</div>
                  </div>
                </div>
              )}
              {doctor.consultationFee && (
                <div className="info-card">
                  <div className="info-icon">💰</div>
                  <div className="info-content">
                    <div className="info-label">Consultation Fee</div>
                    <div className="info-value">₹{doctor.consultationFee}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            {doctor.availableDays && doctor.availableDays.length > 0 && (
              <div className="profile-section">
                <h2>📅 Availability</h2>
                <div className="availability-info">
                  <div className="available-days">
                    {doctor.availableDays.map((day, index) => (
                      <span key={index} className="day-chip">{day}</span>
                    ))}
                  </div>
                  {doctor.consultationHours && (
                    <div className="consultation-hours">
                      <span className="hours-icon">🕐</span>
                      <span className="hours-text">{doctor.consultationHours}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="profile-actions">
              <button className="book-appointment-btn">
                📅 Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
