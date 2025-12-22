import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import './Prescriptions.css';
import { generatePrescriptionPDF } from './utils/generatePrescriptionPDF';

export default function Prescriptions() {
  const { t } = useLanguage();
  // Read from localStorage - supports both formats (individual items and JSON object)
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const endpoint = `/api/prescriptions`;
      
      const response = await fetch(endpoint, {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      
      if (data.ok) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Update prescription status (doctors only)
  const updateStatus = async (prescriptionId, status) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.ok) {
        setMessage({ type: 'success', text: `Prescription marked as ${status}` });
        fetchPrescriptions();
      } else {
        setMessage({ type: 'error', text: data.msg || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating prescription' });
    }
  };

  // View prescription details
  const viewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = (prescription, e) => {
    if (e) e.stopPropagation(); // Prevent card click when downloading
    generatePrescriptionPDF(prescription);
  };

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-header">
        <div>
          <h1>
            {userRole === 'Patient' ? 'My Prescriptions' : 'Prescriptions Overview'}
          </h1>
          <p className="subtitle">
            {userRole === 'Patient' 
              ? 'View and manage your medical prescriptions'
              : 'View and manage all prescriptions'}
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="prescriptions-list">
        {loading ? (
          <div className="loading">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Prescriptions Found</h3>
            <p>
              {userRole === 'Patient' 
                ? 'You don\'t have any prescriptions yet. Your doctor will prescribe medications when needed.'
                : showCreateForm 
                  ? 'Fill out the form above to create your first prescription.'
                  : 'Click "+ New Prescription" above to issue your first prescription to a patient.'}
            </p>
          </div>
        ) : (
          <div className="prescriptions-grid">
            {prescriptions.map(prescription => (
              <div key={prescription._id} className={`prescription-card status-${prescription.status}`}>
                <div className="prescription-card-header">
                  <div className="prescription-meta">
                    <span className={`status-badge ${prescription.status}`}>
                      {prescription.status}
                    </span>
                    <div className="prescription-timestamp">
                      <span className="date-label">📅 Issued:</span>
                      <span className="prescription-date">
                        {formatDate(prescription.createdAt)}
                      </span>
                      <span className="prescription-time">
                        {new Date(prescription.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {userRole === 'Patient' ? (
                    <div className="doctor-info">
                      <strong>Dr. {prescription.doctorId?.name || 'Unknown'}</strong>
                      <span className="doctor-email">{prescription.doctorId?.email}</span>
                    </div>
                  ) : (
                    <div className="patient-info">
                      <strong>{prescription.patientId?.name || 'Unknown Patient'}</strong>
                      <span className="patient-id-badge">ID: {prescription.patientId?._id}</span>
                      <span className="patient-email">{prescription.patientId?.email}</span>
                      {prescription.patientId?.phone && <span className="patient-phone">📞 {prescription.patientId?.phone}</span>}
                    </div>
                  )}
                </div>

                {prescription.diagnosis && (
                  <div className="diagnosis-section">
                    <label>Diagnosis:</label>
                    <p>{prescription.diagnosis}</p>
                  </div>
                )}

                <div className="medications-list">
                  <label>Medications:</label>
                  {prescription.medications.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <div className="med-name">{med.name}</div>
                      <div className="med-details">
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                        {med.duration && <span className="med-duration">{med.duration}</span>}
                      </div>
                      {med.instructions && (
                        <div className="med-instructions">📝 {med.instructions}</div>
                      )}
                      {med.refills > 0 && (
                        <div className="med-refills">🔄 {med.refills} refills available</div>
                      )}
                    </div>
                  ))}
                </div>

                {prescription.notes && (
                  <div className="notes-section">
                    <label>Notes:</label>
                    <p>{prescription.notes}</p>
                  </div>
                )}

                {prescription.validUntil && (
                  <div className="valid-until">
                    Valid until: {formatDate(prescription.validUntil)}
                  </div>
                )}

                <div className="prescription-actions">
                  <button 
                    className="btn-view-details"
                    onClick={() => viewDetails(prescription)}
                  >
                    View Details
                  </button>

                  <button 
                    className="btn-download-pdf"
                    onClick={(e) => handleDownloadPDF(prescription, e)}
                    title="Download PDF"
                  >
                    📄 Download PDF
                  </button>
                  
                  {(userRole === 'Doctor' || userRole === 'Admin') && prescription.status === 'active' && (
                    <>
                      <button 
                        className="btn-complete"
                        onClick={() => updateStatus(prescription._id, 'completed')}
                      >
                        Mark Completed
                      </button>
                      <button 
                        className="btn-cancel-rx"
                        onClick={() => updateStatus(prescription._id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="modal-close" onClick={() => setSelectedPrescription(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <label>Date Issued:</label>
                <span>
                  {formatDate(selectedPrescription.createdAt)} at{' '}
                  {new Date(selectedPrescription.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedPrescription.status}`}>
                  {selectedPrescription.status}
                </span>
              </div>

              {userRole === 'Patient' ? (
                <>
                  <div className="detail-row">
                    <label>Prescribed By:</label>
                    <span>Dr. {selectedPrescription.doctorId?.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Doctor Contact:</label>
                    <span>{selectedPrescription.doctorId?.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-row">
                    <label>Patient:</label>
                    <span>{selectedPrescription.patientId?.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Patient Contact:</label>
                    <span>{selectedPrescription.patientId?.email} | {selectedPrescription.patientId?.phone}</span>
                  </div>
                </>
              )}

              {selectedPrescription.diagnosis && (
                <div className="detail-row">
                  <label>Diagnosis:</label>
                  <span>{selectedPrescription.diagnosis}</span>
                </div>
              )}

              <div className="detail-section">
                <h3>Medications</h3>
                {selectedPrescription.medications.map((med, idx) => (
                  <div key={idx} className="med-detail-card">
                    <h4>{idx + 1}. {med.name}</h4>
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    <p><strong>Frequency:</strong> {med.frequency}</p>
                    {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                    {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                    {med.refills > 0 && <p><strong>Refills:</strong> {med.refills} available</p>}
                  </div>
                ))}
              </div>

              {selectedPrescription.notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <p>{selectedPrescription.notes}</p>
                </div>
              )}

              {selectedPrescription.validUntil && (
                <div className="detail-row">
                  <label>Valid Until:</label>
                  <span>{formatDate(selectedPrescription.validUntil)}</span>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-download-full"
                  onClick={() => handleDownloadPDF(selectedPrescription)}
                >
                  📄 Download PDF
                </button>
                <button 
                  className="btn-modal-close"
                  onClick={() => setSelectedPrescription(null)}
                >
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
