import { useState, useEffect } from 'react';
import './DoctorsList.css';

export default function DoctorsList({ onViewProfile }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialists();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [selectedSpecialist, searchQuery, doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors/all');
      const data = await res.json();
      if (data.ok) {
        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
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

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by specialist
    if (selectedSpecialist !== 'All') {
      filtered = filtered.filter(doc => doc.specialist === selectedSpecialist);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(query) ||
        doc.specialist?.toLowerCase().includes(query) ||
        doc.designation?.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleViewProfile = (doctorId) => {
    // Store the doctor ID in localStorage and navigate to profile view
    console.log('Viewing profile for doctor ID:', doctorId);
    localStorage.setItem('viewingDoctorId', doctorId);
    if (onViewProfile) {
      onViewProfile('doctor-profile-view');
    }
  };

  if (loading) {
    return <div className="doctors-loading">Loading doctors...</div>;
  }

  return (
    <div className="doctors-list-container">
      <div className="doctors-header">
        <h1>Find a Doctor</h1>
        <p className="subtitle">Browse our experienced medical professionals</p>
      </div>

      {/* Search and Filter Section */}
      <div className="doctors-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, specialist, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="specialist-filters">
          <button
            className={`specialist-btn ${selectedSpecialist === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedSpecialist('All')}
          >
            All Specialists
          </button>
          {specialists.map(spec => (
            <button
              key={spec}
              className={`specialist-btn ${selectedSpecialist === spec ? 'active' : ''}`}
              onClick={() => setSelectedSpecialist(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
      </div>

      {/* Doctors Grid */}
      <div className="doctors-grid">
        {filteredDoctors.length === 0 ? (
          <div className="no-doctors">
            <p>No doctors found matching your criteria.</p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-photo">
                {doctor.photo ? (
                  <img src={doctor.photo} alt={doctor.name} />
                ) : (
                  <div className="photo-placeholder">
                    <span>👨‍⚕️</span>
                  </div>
                )}
              </div>
              
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                {doctor.designation && (
                  <p className="doctor-designation">{doctor.designation}</p>
                )}
                
                {doctor.specialist && (
                  <div className="doctor-specialist">
                    <span className="specialist-badge">{doctor.specialist}</span>
                  </div>
                )}
                
                {doctor.degrees && doctor.degrees.length > 0 && (
                  <p className="doctor-degrees">{doctor.degrees.join(', ')}</p>
                )}
                
                <div className="doctor-meta">
                  {doctor.experience && (
                    <span className="meta-item">
                      📅 {doctor.experience} years exp.
                    </span>
                  )}
                  {doctor.consultationFee && (
                    <span className="meta-item">
                      💰 ₹{doctor.consultationFee}
                    </span>
                  )}
                </div>
                
                <button 
                  className="view-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(doctor._id);
                  }}
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
