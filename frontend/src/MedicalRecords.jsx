import { useState, useEffect } from 'react';
import './MedicalRecords.css';
import { generatePrescriptionPDF } from './utils/generatePrescriptionPDF';

export default function MedicalRecords() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = localStorage.getItem('userId');
    console.log('MedicalRecords - userData:', userData);
    console.log('MedicalRecords - userId:', userId);
    setUser(userData);
    fetchPrescriptions(userId || userData.userId);
  }, []);

  const fetchPrescriptions = async (userId) => {
    setLoading(true);
    console.log('Fetching prescriptions for userId:', userId);
    try {
      const res = await fetch(`/api/prescriptions`, {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      console.log('Prescriptions response:', data);
      if (data.ok) {
        setPrescriptions(data.prescriptions || []);
        console.log('Prescriptions set:', data.prescriptions);
      } else {
        console.error('Failed to fetch prescriptions:', data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateStr) => {
    return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
  };

  const handleDownloadPDF = (prescription, e) => {
    e.stopPropagation(); // Prevent card click when downloading
    generatePrescriptionPDF(prescription);
  };

  if (loading) {
    return <div className="records-loading">Loading prescriptions...</div>;
  }

  return (
    <div className="medical-records">
      <div className="records-header">
        <h1>💊 My Prescriptions</h1>
        <p>View all prescriptions from your doctors</p>
      </div>

      {/* Prescriptions */}
      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>No Prescriptions Yet</h3>
          <p>Your prescriptions from doctors will appear here.</p>
        </div>
      ) : (
        <div className="records-grid">
          {prescriptions.map(prescription => (
            <div 
              key={prescription._id} 
              className="record-card prescription-card"
              onClick={() => setSelectedPrescription(prescription)}
            >
              <div className="record-header">
                <div>
                  <h3>{formatDate(prescription.createdAt)}</h3>
                  <p className="prescription-time">⏰ {formatTime(prescription.createdAt)}</p>
                  <p className="doctor-name">
                    👨‍⚕️ Dr. {prescription.doctorId?.name || 'Unknown Doctor'}
                  </p>
                </div>
                <div>
                  <span className={`status-badge status-${prescription.status}`}>
                    {prescription.status}
                  </span>
                  <button 
                    className="btn-download-pdf"
                    onClick={(e) => handleDownloadPDF(prescription, e)}
                    title="Download PDF"
                  >
                    📄 PDF
                  </button>
                </div>
              </div>

              <div className="record-summary">
                {prescription.diagnosis && (
                  <div className="summary-item">
                    <span className="label">Diagnosis:</span>
                    <p className="diagnosis">{prescription.diagnosis}</p>
                  </div>
                )}

                {prescription.medications && prescription.medications.length > 0 && (
                  <div className="summary-item">
                    <span className="label">Medications ({prescription.medications.length}):</span>
                    <div className="medication-chips">
                      {prescription.medications.slice(0, 3).map((med, idx) => (
                        <span key={idx} className="med-chip">{med.name} - {med.dosage}</span>
                      ))}
                      {prescription.medications.length > 3 && (
                        <span className="med-chip more">+{prescription.medications.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {prescription.validUntil && (
                  <div className="summary-item">
                    <span className="label">Valid Until:</span>
                    <p className="followup">{formatDate(prescription.validUntil)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="close-btn" onClick={() => setSelectedPrescription(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>📅 Prescribed On</h3>
                <p>{formatDateTime(selectedPrescription.createdAt)}</p>
              </div>

              <div className="detail-section">
                <h3>👨‍⚕️ Doctor</h3>
                <p>Dr. {selectedPrescription.doctorId?.name}</p>
                <p className="contact">{selectedPrescription.doctorId?.email}</p>
                {selectedPrescription.doctorId?.phone && (
                  <p className="contact">📞 {selectedPrescription.doctorId.phone}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>📊 Status</h3>
                <span className={`status-badge status-${selectedPrescription.status}`}>
                  {selectedPrescription.status}
                </span>
              </div>

              {selectedPrescription.diagnosis && (
                <div className="detail-section">
                  <h3>🔍 Diagnosis</h3>
                  <p>{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                <div className="detail-section">
                  <h3>💊 Medications</h3>
                  <div className="medications-list">
                    {selectedPrescription.medications.map((med, idx) => (
                      <div key={idx} className="medication-detail">
                        <h4>{med.name}</h4>
                        <div className="med-info">
                          <span><strong>Dosage:</strong> {med.dosage}</span>
                          <span><strong>Frequency:</strong> {med.frequency}</span>
                          {med.duration && <span><strong>Duration:</strong> {med.duration}</span>}
                          {med.instructions && <span><strong>Instructions:</strong> {med.instructions}</span>}
                          {med.refills > 0 && <span><strong>Refills:</strong> {med.refills}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrescription.validUntil && (
                <div className="detail-section">
                  <h3>⏰ Valid Until</h3>
                  <p>{formatDate(selectedPrescription.validUntil)}</p>
                </div>
              )}

              {selectedPrescription.notes && (
                <div className="detail-section">
                  <h3>📝 Additional Notes</h3>
                  <p>{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-download-full"
                  onClick={() => generatePrescriptionPDF(selectedPrescription)}
                >
                  📄 Download PDF
                </button>
                <button className="btn-close" onClick={() => setSelectedPrescription(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
