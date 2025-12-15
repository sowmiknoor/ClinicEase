import { useState, useEffect } from 'react';
import MedicineAutocomplete from './components/MedicineAutocomplete';
import './CreateMedicalRecord.css';

export default function CreateMedicalRecord() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('userId');
  
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    labTestsRecommended: [],
    followUpDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/admin/users/role/Patient', {
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      
      if (data.ok) {
        setPatients(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.patientId) {
      setMessage({ type: 'error', text: 'Please select a patient' });
      setLoading(false);
      return;
    }

    if (!formData.diagnosis) {
      setMessage({ type: 'error', text: 'Please enter a diagnosis' });
      setLoading(false);
      return;
    }

    try {
      const validMedications = formData.medications.filter(m => m.name && m.dosage);
      const validLabTests = formData.labTestsRecommended.filter(test => test && test.trim());
      
      const payload = {
        patientId: formData.patientId,
        doctorId: userId,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription || '',
        medications: validMedications,
        labTestsRecommended: validLabTests,
        followUpDate: formData.followUpDate || null,
        notes: formData.notes || ''
      };

      const response = await fetch('/api/medical-records/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.ok) {
        setMessage({ type: 'success', text: 'Medical record created successfully!' });
        // Reset form
        setFormData({
          patientId: '',
          diagnosis: '',
          prescription: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
          labTestsRecommended: [],
          followUpDate: '',
          notes: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Failed to create medical record' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error: ' + error.message });
      console.error('Error creating medical record:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const updateMedication = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  const handleMedicineSelect = (index, medicine) => {
    const newMedications = [...formData.medications];
    newMedications[index] = {
      ...newMedications[index],
      name: medicine.name,
      // Auto-fill strength as dosage if available
      dosage: medicine.strength || newMedications[index].dosage
    };
    setFormData({ ...formData, medications: newMedications });
  };

  const addLabTest = () => {
    setFormData({
      ...formData,
      labTestsRecommended: [...formData.labTestsRecommended, '']
    });
  };

  const updateLabTest = (index, value) => {
    const newTests = [...formData.labTestsRecommended];
    newTests[index] = value;
    setFormData({ ...formData, labTestsRecommended: newTests });
  };

  const removeLabTest = (index) => {
    const newTests = formData.labTestsRecommended.filter((_, i) => i !== index);
    setFormData({ ...formData, labTestsRecommended: newTests });
  };

  const selectedPatient = patients.find(p => p._id === formData.patientId);

  return (
    <div className="create-medical-record">
      <div className="record-header">
        <h1>📋 Create Medical Record</h1>
        <p>Document patient consultation and treatment plan</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="record-form">
        {/* Patient Selection */}
        <div className="form-section">
          <h2>Patient Information</h2>
          
          <div className="form-group">
            <label>Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} | ID: {patient._id.slice(-6)} | {patient.email}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="selected-patient-info">
              <h3>Selected Patient Details</h3>
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone || 'N/A'}</p>
              <p className="patient-id"><strong>Patient ID:</strong> {selectedPatient._id}</p>
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="form-section">
          <h2>Diagnosis</h2>
          <div className="form-group">
            <label>Diagnosis *</label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Enter the diagnosis..."
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Prescription Summary</label>
            <textarea
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Brief prescription summary..."
              rows="2"
            />
          </div>
        </div>

        {/* Medications */}
        <div className="form-section">
          <div className="section-header">
            <h2>Medications</h2>
            <button type="button" onClick={addMedication} className="add-btn">
              + Add Medication
            </button>
          </div>

          {formData.medications.map((med, index) => (
            <div key={index} className="medication-item">
              <div className="medication-header">
                <h3>Medication {index + 1}</h3>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="medication-fields">
                <div className="form-group">
                  <label>Medicine Name</label>
                  <MedicineAutocomplete
                    value={med.name}
                    onChange={(value) => updateMedication(index, 'name', value)}
                    onSelect={(medicine) => handleMedicineSelect(index, medicine)}
                    placeholder="Start typing medicine name..."
                    index={index}
                  />
                </div>

                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                  />
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lab Tests */}
        <div className="form-section">
          <div className="section-header">
            <h2>Recommended Lab Tests</h2>
            <button type="button" onClick={addLabTest} className="add-btn">
              + Add Lab Test
            </button>
          </div>

          {formData.labTestsRecommended.map((test, index) => (
            <div key={index} className="lab-test-item">
              <input
                type="text"
                value={test}
                onChange={(e) => updateLabTest(index, e.target.value)}
                placeholder="e.g., Complete Blood Count (CBC)"
              />
              <button
                type="button"
                onClick={() => removeLabTest(index)}
                className="remove-btn-inline"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Follow-up and Notes */}
        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label>Follow-up Date</label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or observations..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : '📋 Create Medical Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
