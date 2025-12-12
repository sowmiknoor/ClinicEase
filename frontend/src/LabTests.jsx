import { useEffect, useState } from 'react';
import './LabTests.css';

export default function LabTests() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ 
    scheduledDate: '', 
    labName: '',
    labLocation: '',
    notes: '' 
  });
  const [selectedTests, setSelectedTests] = useState([]); // Array of {testType, category}
  const [list, setList] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [bangladeshLabs, setBangladeshLabs] = useState([]);
  const [treatedPatients, setTreatedPatients] = useState([]);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [showCatalog, setShowCatalog] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  useEffect(() => { 
    fetchData(); 
    fetchCatalog();
    fetchBangladeshLabs();
    if (userRole === 'Doctor') {
      fetchTreatedPatients();
    }
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/labtests/catalog', { headers: header });
      const data = await res.json();
      if (data.ok) setCatalog(data.catalog);
    } catch (err) { console.error(err); }
  };

  const fetchBangladeshLabs = async () => {
    try {
      const res = await fetch('/api/labtests/bangladesh-labs', { headers: header });
      const data = await res.json();
      if (data.ok) setBangladeshLabs(data.labs || []);
    } catch (err) { console.error(err); }
  };

  const fetchTreatedPatients = async () => {
    try {
      // Fetch patients from consultations where doctor is assigned
      const res = await fetch('/api/consultations', { headers: header });
      const data = await res.json();
      if (data.ok) {
        // Extract unique patients from consultations
        const uniquePatients = [];
        const patientIds = new Set();
        
        data.consultations.forEach(consultation => {
          if (consultation.userId && !patientIds.has(consultation.userId._id)) {
            patientIds.add(consultation.userId._id);
            uniquePatients.push({
              _id: consultation.userId._id,
              name: consultation.userId.name,
              email: consultation.userId.email
            });
          }
        });
        
        setTreatedPatients(uniquePatients);
      }
    } catch (err) { 
      console.error('Error fetching treated patients:', err); 
    }
  };

  const fetchData = async () => {
    try {
      const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
      const res = await fetch(`/api/labtests${query}`, { headers: header });
      const data = await res.json();
      if (data.ok) setList(data.labTests || []);
    } catch (err) { console.error(err); }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (selectedTests.length === 0) {
      alert('⚠️ Please select at least one test from the catalog');
      return;
    }

    try {
      // Generate unique batch order ID for tests ordered together
      const batchOrderId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Order all selected tests with the same batchOrderId
      const promises = selectedTests.map(test => 
        fetch('/api/labtests', { 
          method: 'POST', 
          headers: header, 
          body: JSON.stringify({
            testType: test.testType,
            category: test.category,
            batchOrderId: batchOrderId,
            ...form,
            patientId: userRole === 'Patient' ? userId : (patientId || userId)
          })
        }).then(res => res.json())
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.ok).length;
      
      if (successful === selectedTests.length) {
        setForm({ scheduledDate:'', labName:'', labLocation:'', notes:'' }); 
        setSelectedTests([]);
        fetchData(); 
        alert(`✅ Successfully ordered ${successful} lab test(s)!\n\n📦 Batch Order Created\n\n✨ All ${successful} tests are grouped together.\n📄 Click "Download Combined PDF" to get ONE comprehensive report with all test results.`);
      } else {
        alert(`⚠️ ${successful}/${selectedTests.length} tests ordered successfully`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error ordering tests');
    }
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/labtests/${id}/status`, { 
      method: 'PATCH', 
      headers: header, 
      body: JSON.stringify({ status }) 
    });
    fetchData();
  };

  const deleteTest = async (id, testName) => {
    if (!confirm(`Are you sure you want to delete "${testName}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/labtests/${id}`, {
        method: 'DELETE',
        headers: header
      });
      const data = await res.json();
      
      if (data.ok) {
        alert('✅ Test deleted successfully');
        fetchData(); // Refresh the list
      } else {
        alert('❌ Failed to delete test');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error deleting test');
    }
  };

  const downloadPDF = async (id) => {
    try {
      const res = await fetch(`/api/labtests/${id}/pdf`, { headers: header });
      const data = await res.json();
      if (data.ok && data.html) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
        };
      } else {
        alert('Unable to generate PDF');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating PDF');
    }
  };

  const downloadBatchPDF = async (batchOrderId) => {
    try {
      const res = await fetch(`/api/labtests/batch/${batchOrderId}/pdf`, { headers: header });
      const data = await res.json();
      if (data.ok && data.html) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.onload = function() {
          printWindow.focus();
          printWindow.print();
        };
      } else {
        alert('Unable to generate PDF');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating PDF');
    }
  };

  const toggleTest = (testName, category) => {
    const exists = selectedTests.find(t => t.testType === testName && t.category === category);
    if (exists) {
      setSelectedTests(selectedTests.filter(t => !(t.testType === testName && t.category === category)));
    } else {
      setSelectedTests([...selectedTests, { testType: testName, category: category }]);
    }
  };

  const isTestSelected = (testName, category) => {
    return selectedTests.some(t => t.testType === testName && t.category === category);
  };

  const removeTest = (testName, category) => {
    setSelectedTests(selectedTests.filter(t => !(t.testType === testName && t.category === category)));
  };

  const filteredCatalog = () => {
    let filtered = { ...catalog };
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = { [selectedCategory]: catalog[selectedCategory] };
    }
    
    // Filter by search term
    if (searchTerm) {
      const result = {};
      Object.keys(filtered).forEach(category => {
        const tests = filtered[category].filter(test => 
          test.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (tests.length > 0) {
          result[category] = tests;
        }
      });
      return result;
    }
    
    return filtered;
  };

  const getStatusBadge = (status) => {
    const badges = {
      ordered: { class: 'status-ordered', label: '📝 Ordered' },
      scheduled: { class: 'status-scheduled', label: '📅 Scheduled' },
      in_progress: { class: 'status-in_progress', label: '🔬 In Progress' },
      completed: { class: 'status-completed', label: '✅ Completed' },
      cancelled: { class: 'status-cancelled', label: '❌ Cancelled' }
    };
    return badges[status] || { class: 'status-ordered', label: status };
  };

  return (
    <div className="labtest-root">
      <h2>🔬 Laboratory Tests</h2>
      <p className="subtitle">Order and track lab tests from our comprehensive catalog</p>

      <div className="labtest-layout">
        {/* Order Form - Only for Doctors */}
        {userRole === 'Doctor' || userRole === 'Admin' ? (
          <div className="labtest-form-section">
            <form className="labtest-form" onSubmit={submit}>
              <h3>📋 Suggest Lab Test for Patient</h3>
              
              <div className="form-group">
                <label>👤 Select Patient <span className="required-badge">Required</span></label>
                <select
                  className="form-input"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Select a Treated Patient --</option>
                  {treatedPatients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
                {treatedPatients.length === 0 && (
                  <p className="helper-text" style={{color: '#f59e0b', fontSize: '13px', marginTop: '8px'}}>
                    ⚠️ No treated patients found. Patients will appear here after consultations.
                  </p>
                )}
              </div>

            <div className="form-group">
              <label>🧪 Selected Tests <span className="required-badge">Required</span></label>
              <div className="selected-tests-container">
                {selectedTests.length === 0 ? (
                  <div className="no-tests-selected">
                    <p>No tests selected yet</p>
                    <button 
                      type="button" 
                      className="btn-browse"
                      onClick={() => setShowCatalog(true)}
                    >
                      📚 Browse Catalog
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="selected-tests-list">
                      {selectedTests.map((test, idx) => (
                        <div key={idx} className="selected-test-chip">
                          <div className="test-chip-info">
                            <span className="test-chip-name">{test.testType}</span>
                            <span className="test-chip-category">{test.category}</span>
                          </div>
                          <button 
                            type="button"
                            className="test-chip-remove"
                            onClick={() => removeTest(test.testType, test.category)}
                            title="Remove test"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      className="btn-add-more"
                      onClick={() => setShowCatalog(true)}
                    >
                      ➕ Add More Tests
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>📅 Schedule Date & Time</label>
              <input 
                className="form-input" 
                type="datetime-local" 
                value={form.scheduledDate} 
                onChange={e => setForm({...form, scheduledDate: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>🏢 Hospital / Diagnostic Center <span className="required-badge">Required</span></label>
              <select
                className="form-input"
                value={form.labName}
                onChange={e => {
                  const selectedLab = bangladeshLabs.find(lab => lab.name === e.target.value);
                  setForm({
                    ...form, 
                    labName: e.target.value,
                    labLocation: selectedLab ? `${selectedLab.location}, ${selectedLab.city}` : ''
                  });
                }}
                required
              >
                <option value="">-- Select Hospital/Diagnostic Center --</option>
                {bangladeshLabs.map((lab, idx) => (
                  <option key={idx} value={lab.name}>
                    {lab.name} - {lab.city} ({lab.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>📍 Lab Location</label>
              <input 
                className="form-input" 
                placeholder="Auto-filled when you select a lab" 
                value={form.labLocation} 
                onChange={e => setForm({...form, labLocation: e.target.value})} 
                readOnly
              />
            </div>

            <div className="form-group">
              <label>📝 Notes</label>
              <textarea 
                className="form-textarea" 
                placeholder="Any special instructions or information"
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
                rows="3"
              />
            </div>

            <button className="btn-submit" type="submit" disabled={selectedTests.length === 0}>
              {selectedTests.length === 0 
                ? 'Select Tests to Order' 
                : `Suggest ${selectedTests.length} Test${selectedTests.length > 1 ? 's' : ''}`
              }
            </button>
          </form>
          </div>
        ) : (
          <div className="patient-notice">
            <div className="notice-icon">👨‍⚕️</div>
            <h3>Lab Tests Suggested by Your Doctor</h3>
            <p>Your doctor will suggest lab tests based on your health condition.</p>
            <p>All suggested tests will appear in the list below and in your Lab Results page.</p>
          </div>
        )}

        {/* Test List */}
        <div className="labtest-list-section">
          <h3>📊 {userRole === 'Doctor' || userRole === 'Admin' ? 'Suggested Lab Tests' : 'Your Lab Tests'}</h3>
          
          {list.length === 0 ? (
            <div className="empty-state">
              <p>No lab tests ordered yet.</p>
              <p className="empty-hint">Order your first test to get started!</p>
            </div>
          ) : (
            <div className="labtest-container">
              {(() => {
                // Group tests by batchOrderId
                const grouped = {};
                const singles = [];
                
                // Limit to 5 recent items unless showAllTests is true
                const displayList = showAllTests ? list : list.slice(0, 5);
                
                displayList.forEach(test => {
                  if (test.batchOrderId) {
                    if (!grouped[test.batchOrderId]) {
                      grouped[test.batchOrderId] = [];
                    }
                    grouped[test.batchOrderId].push(test);
                  } else {
                    singles.push(test);
                  }
                });

                return (
                  <>
                    {/* Batch Orders */}
                    {Object.keys(grouped).map(batchId => {
                      const batchTests = grouped[batchId];
                      const firstTest = batchTests[0];
                      const isExpanded = expandedBatches[batchId];
                      const allCompleted = batchTests.every(t => t.status === 'completed');
                      const anyInProgress = batchTests.some(t => t.status === 'in_progress');
                      
                      return (
                        <div key={batchId} className="batch-order-card">
                          <div className="batch-card-header">
                            <div className="batch-main-info">
                              <div className="batch-title-section">
                                <h4>📦 Lab Test Batch ({batchTests.length} Tests)</h4>
                                <span className="batch-id-tag">#{batchId.split('-')[1]}</span>
                              </div>
                              <div className="batch-test-names">
                                {batchTests.map((t, idx) => (
                                  <span key={idx} className="test-name-chip">
                                    {t.testType}
                                  </span>
                                ))}
                              </div>
                              <div className="batch-meta-info">
                                {firstTest.scheduledDate && (
                                  <span className="batch-meta-item">
                                    📅 {new Date(firstTest.scheduledDate).toLocaleDateString()}
                                  </span>
                                )}
                                {firstTest.labName && (
                                  <span className="batch-meta-item">
                                    🏢 {firstTest.labName}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="batch-actions-section">
                              <div className="batch-status-indicator">
                                {allCompleted ? (
                                  <span className="status-badge status-completed">✅ All Completed</span>
                                ) : anyInProgress ? (
                                  <span className="status-badge status-in_progress">🔬 In Progress</span>
                                ) : (
                                  <span className="status-badge status-ordered">📝 Ordered</span>
                                )}
                              </div>
                              
                              <div className="batch-action-buttons">
                                <button 
                                  className="btn-action btn-download-batch"
                                  onClick={() => downloadBatchPDF(batchId)}
                                  title="Download combined PDF for all tests"
                                >
                                  📄 Download PDF
                                </button>
                                <button 
                                  className="btn-action btn-toggle-details"
                                  onClick={() => setExpandedBatches(prev => ({...prev, [batchId]: !prev[batchId]}))}
                                >
                                  {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="batch-details-expanded">
                              <div className="batch-details-header">
                                <h5>Individual Test Details:</h5>
                              </div>
                              {batchTests.map(test => {
                                const badge = getStatusBadge(test.status);
                                return (
                                  <div key={test._id} className="batch-test-item">
                                    <div className="batch-test-info">
                                      <div className="batch-test-name-status">
                                        <strong>{test.testType}</strong>
                                        <span className={`status-badge-small ${badge.class}`}>{badge.label}</span>
                                      </div>
                                      {test.category && <span className="category-tag-small">{test.category}</span>}
                                      {test.notes && (
                                        <div className="test-notes-small">
                                          <strong>Notes:</strong> {test.notes}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="batch-test-actions">
                                      {test.status !== 'completed' && (
                                        <>
                                          <button 
                                            className="btn-small btn-progress"
                                            onClick={() => updateStatus(test._id, 'in_progress')}
                                          >
                                            🔬 In Progress
                                          </button>
                                          <button 
                                            className="btn-small btn-complete"
                                            onClick={() => updateStatus(test._id, 'completed')}
                                          >
                                            ✅ Complete
                                          </button>
                                        </>
                                      )}
                                      <button 
                                        className="btn-small btn-delete"
                                        onClick={() => deleteTest(test._id, test.testType)}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Single Tests (not part of batch) */}
                    {singles.map(test => {
                      const badge = getStatusBadge(test.status);
                      return (
                        <div key={test._id} className="labtest-card">
                          <div className="labtest-header">
                            <div className="test-info">
                              <h4>{test.testType}</h4>
                              {test.category && <span className="category-tag">{test.category}</span>}
                            </div>
                            <span className={`status-badge ${badge.class}`}>{badge.label}</span>
                          </div>

                          <div className="labtest-details">
                            {test.scheduledDate && (
                              <div className="detail-row">
                                <span className="detail-label">📅 Scheduled:</span>
                                <span className="detail-value">{new Date(test.scheduledDate).toLocaleString()}</span>
                              </div>
                            )}
                            {test.labName && (
                              <div className="detail-row">
                                <span className="detail-label">🏢 Lab:</span>
                                <span className="detail-value">{test.labName}</span>
                              </div>
                            )}
                            {test.labLocation && (
                              <div className="detail-row">
                                <span className="detail-label">📍 Location:</span>
                                <span className="detail-value">{test.labLocation}</span>
                              </div>
                            )}
                            {test.notes && (
                              <div className="detail-notes">
                                <strong>Notes:</strong> {test.notes}
                              </div>
                            )}
                          </div>

                          <div className="labtest-actions">
                            {test.status !== 'completed' && (
                              <>
                                <button 
                                  className="btn-action btn-progress"
                                  onClick={() => updateStatus(test._id, 'in_progress')}
                                >
                                  🔬 In Progress
                                </button>
                                <button 
                                  className="btn-action btn-complete"
                                  onClick={() => updateStatus(test._id, 'completed')}
                                >
                                  ✅ Complete
                                </button>
                              </>
                            )}
                            <button 
                              className="btn-action btn-download"
                              onClick={() => downloadPDF(test._id)}
                            >
                              📄 Download PDF
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => deleteTest(test._id, test.testType)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
              
              {/* View All Button */}
              {!showAllTests && list.length > 5 && (
                <div className="view-all-section">
                  <button 
                    className="btn-view-all"
                    onClick={() => setShowAllTests(true)}
                  >
                    📋 View All Lab Tests ({list.length} total)
                  </button>
                </div>
              )}
              
              {showAllTests && list.length > 5 && (
                <div className="view-all-section">
                  <button 
                    className="btn-view-all"
                    onClick={() => setShowAllTests(false)}
                  >
                    ▲ Show Recent Only (5 tests)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Catalog Modal */}
      {showCatalog && (
        <div className="catalog-modal-overlay" onClick={() => setShowCatalog(false)}>
          <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-header">
              <h3>🔬 Lab Test Catalog</h3>
              <div className="catalog-header-actions">
                <span className="selected-count">
                  {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                </span>
                <button className="btn-close" onClick={() => setShowCatalog(false)}>✕</button>
              </div>
            </div>

            <div className="catalog-filters">
              <input 
                className="catalog-search"
                type="text"
                placeholder="🔍 Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="catalog-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.keys(catalog).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="catalog-content">
              {Object.keys(filteredCatalog()).length === 0 ? (
                <p className="no-results">No tests found matching your search.</p>
              ) : (
                Object.keys(filteredCatalog()).map(category => (
                  <div key={category} className="catalog-category">
                    <h4 className="catalog-category-title">{category}</h4>
                    <div className="catalog-tests">
                      {filteredCatalog()[category].map((test, idx) => {
                        const selected = isTestSelected(test, category);
                        return (
                          <div 
                            key={idx} 
                            className={`catalog-test-item ${selected ? 'selected' : ''}`}
                            onClick={() => toggleTest(test, category)}
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
          </div>
        </div>
      )}
    </div>
  );
}
