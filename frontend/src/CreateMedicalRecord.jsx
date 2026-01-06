import { useState, useEffect } from 'react';
import MedicineAutocomplete from './components/MedicineAutocomplete';
import './CreateMedicalRecord.css';

export default function CreateMedicalRecord() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('userId');
  const [showLabTestCatalog, setShowLabTestCatalog] = useState(false);
  const [labTestSearch, setLabTestSearch] = useState('');
  const [labTestCategory, setLabTestCategory] = useState('');

  // Common lab tests for quick selection
  const commonLabTests = [
    'Complete Blood Count (CBC)',
    'Blood Glucose (Fasting)',
    'Blood Glucose (Random)',
    'HbA1c (Glycated Hemoglobin)',
    'Lipid Profile',
    'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)',
    'Thyroid Function Test (TSH, T3, T4)',
    'Urine Routine Examination',
    'Chest X-Ray',
    'ECG (Electrocardiogram)',
    'Ultrasound Abdomen',
    'Vitamin D Test',
    'Vitamin B12 Test',
    'ESR (Erythrocyte Sedimentation Rate)',
    'C-Reactive Protein (CRP)',
    'Electrolytes (Na, K, Cl)',
    'Blood Urea Nitrogen (BUN)',
    'Serum Creatinine',
    'HIV Test',
    'Hepatitis B Surface Antigen',
    'Hepatitis C Antibody',
    'Dengue NS1 Antigen',
    'Malaria Test',
    'Tuberculosis (TB) Test',
    'COVID-19 RT-PCR',
    'Stool Routine Examination',
    'Sputum Culture'
  ];

  // Frequency options
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Once weekly',
    'Twice weekly',
    'As needed (PRN)',
    'Before meals',
    'After meals',
    'At bedtime',
    'Every morning',
    'Every evening'
  ];

  // Duration options
  const durationOptions = [
    '1 day',
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '1 week',
    '2 weeks',
    '3 weeks',
    '1 month',
    '2 months',
    '3 months',
    '6 months',
    'Until follow-up',
    'Continuous',
    'As directed'
  ];
  
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
      // Record created successfully

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

  const addLabTest = (testName) => {
    // Check if test already added
    if (formData.labTestsRecommended.includes(testName)) {
      return; // Don't add duplicates
    }
    setFormData({
      ...formData,
      labTestsRecommended: [...formData.labTestsRecommended, testName]
    });
  };

  const removeLabTest = (index) => {
    const newTests = formData.labTestsRecommended.filter((_, i) => i !== index);
    setFormData({ ...formData, labTestsRecommended: newTests });
  };

  const isLabTestSelected = (testName) => {
    return formData.labTestsRecommended.includes(testName);
  };

  const toggleLabTest = (testName) => {
    if (isLabTestSelected(testName)) {
      // Remove test
      const newTests = formData.labTestsRecommended.filter(t => t !== testName);
      setFormData({ ...formData, labTestsRecommended: newTests });
    } else {
      // Add test
      addLabTest(testName);
    }
  };

  const filteredLabTestCatalog = () => {
    // Group tests by category
    const grouped = {};
    
    commonLabTests.forEach(test => {
      // Simple categorization based on test name
      let category = 'General Tests';
      if (test.includes('Blood') || test.includes('CBC') || test.includes('Hemoglobin')) {
        category = 'Blood Tests';
      } else if (test.includes('Liver') || test.includes('Kidney') || test.includes('Thyroid')) {
        category = 'Organ Function Tests';
      } else if (test.includes('Urine') || test.includes('Stool') || test.includes('Sputum')) {
        category = 'Body Fluid Tests';
      } else if (test.includes('X-Ray') || test.includes('Ultrasound') || test.includes('ECG') || test.includes('CT') || test.includes('MRI')) {
        category = 'Imaging & Diagnostic';
      } else if (test.includes('Vitamin') || test.includes('Electrolytes')) {
        category = 'Nutritional Tests';
      } else if (test.includes('HIV') || test.includes('Hepatitis') || test.includes('Dengue') || test.includes('Malaria') || test.includes('TB') || test.includes('COVID')) {
        category = 'Infectious Disease Tests';
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(test);
    });

    // Filter by selected category
    let filtered = { ...grouped };
    if (labTestCategory) {
      filtered = { [labTestCategory]: grouped[labTestCategory] || [] };
    }

    // Filter by search term
    if (labTestSearch) {
      const result = {};
      Object.keys(filtered).forEach(category => {
        const tests = filtered[category].filter(test => 
          test.toLowerCase().includes(labTestSearch.toLowerCase())
        );
        if (tests.length > 0) {
          result[category] = tests;
        }
      });
      return result;
    }

    return filtered;
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
                  <select
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  >
                    <option value="">-- Select Frequency --</option>
                    {frequencyOptions.map((freq, idx) => (
                      <option key={idx} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  >
                    <option value="">-- Select Duration --</option>
                    {durationOptions.map((dur, idx) => (
                      <option key={idx} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lab Tests */}
        <div className="form-section">
          <div className="section-header">
            <h2>Recommended Lab Tests</h2>
            <button 
              type="button" 
              onClick={() => setShowLabTestCatalog(true)} 
              className="add-btn"
            >
              📚 Browse Lab Test Catalog
            </button>
          </div>

          {formData.labTestsRecommended.length === 0 ? (
            <div className="no-tests-selected">
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                No lab tests selected yet. Click "Browse Lab Test Catalog" to add tests.
              </p>
            </div>
          ) : (
            <div className="selected-lab-tests-list">
              {formData.labTestsRecommended.map((test, index) => (
                <div key={index} className="selected-lab-test-chip">
                  <span className="test-icon">🔬</span>
                  <span className="test-name">{test}</span>
                  <button
                    type="button"
                    onClick={() => removeLabTest(index)}
                    className="remove-test-btn"
                    title="Remove test"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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

      {/* Lab Test Catalog Modal */}
      {showLabTestCatalog && (
        <div className="catalog-modal-overlay" onClick={() => setShowLabTestCatalog(false)}>
          <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-header">
              <h3>🔬 Lab Test Catalog</h3>
              <div className="catalog-header-actions">
                <span className="selected-count">
                  {formData.labTestsRecommended.length} test{formData.labTestsRecommended.length !== 1 ? 's' : ''} selected
                </span>
                <button className="btn-close" onClick={() => setShowLabTestCatalog(false)}>✕</button>
              </div>
            </div>

            <div className="catalog-filters">
              <input 
                className="catalog-search"
                type="text"
                placeholder="🔍 Search tests..."
                value={labTestSearch}
                onChange={(e) => setLabTestSearch(e.target.value)}
              />
              <select 
                className="catalog-category-filter"
                value={labTestCategory}
                onChange={(e) => setLabTestCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.keys(filteredLabTestCatalog()).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="catalog-content">
              {Object.keys(filteredLabTestCatalog()).length === 0 ? (
                <p className="no-results">No tests found matching your search.</p>
              ) : (
                Object.keys(filteredLabTestCatalog()).map(category => (
                  <div key={category} className="catalog-category">
                    <h4 className="catalog-category-title">{category}</h4>
                    <div className="catalog-tests">
                      {filteredLabTestCatalog()[category].map((test, idx) => {
                        const selected = isLabTestSelected(test);
                        return (
                          <div 
                            key={idx} 
                            className={`catalog-test-item ${selected ? 'selected' : ''}`}
                            onClick={() => toggleLabTest(test)}
                          >
                            <input 
                              type="checkbox" 
                              checked={selected}
                              onChange={() => {}}
                              className="test-checkbox"
                            />
                            <span className="test-icon">🧪</span>
                            <span className="test-name">{test}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="catalog-footer">
              <button 
                className="btn-done"
                onClick={() => setShowLabTestCatalog(false)}
              >
                Done ({formData.labTestsRecommended.length} test{formData.labTestsRecommended.length !== 1 ? 's' : ''} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
