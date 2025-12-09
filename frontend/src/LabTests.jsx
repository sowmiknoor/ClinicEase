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
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  useEffect(() => { 
    fetchData(); 
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/labtests/catalog', { headers: header });
      const data = await res.json();
      if (data.ok) setCatalog(data.catalog);
    } catch (err) { console.error(err); }
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
        {/* Order Form */}
        <div className="labtest-form-section">
          <form className="labtest-form" onSubmit={submit}>
            <h3>📋 Order Lab Test</h3>
            
            {userRole !== 'Patient' && (
              <div className="form-group">
                <label>👤 Patient ID <span className="optional-badge">Optional</span></label>
                <input 
                  className="form-input" 
                  placeholder="Leave empty for self" 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)} 
                />
              </div>
            )}

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
              <label>🏢 Lab Name</label>
              <input 
                className="form-input" 
                placeholder="e.g., City Medical Laboratory" 
                value={form.labName} 
                onChange={e => setForm({...form, labName: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>📍 Lab Location</label>
              <input 
                className="form-input" 
                placeholder="e.g., 123 Main St, Suite 100" 
                value={form.labLocation} 
                onChange={e => setForm({...form, labLocation: e.target.value})} 
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
                : `Order ${selectedTests.length} Test${selectedTests.length > 1 ? 's' : ''}`
              }
            </button>
          </form>
        </div>

        {/* Test List */}
        <div className="labtest-list-section">
          <h3>📊 Your Lab Tests</h3>
          
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
                
                list.forEach(test => {
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
                      return (
                        <div key={batchId} className="batch-order-group">
                          <div className="batch-header">
                            <div className="batch-info">
                              <h4>📦 Batch Order - {batchTests.length} Test{batchTests.length > 1 ? 's' : ''}</h4>
                              <span className="batch-id">ID: {batchId.split('-')[1]}</span>
                              <p className="batch-note">All {batchTests.length} tests will be in ONE combined PDF report</p>
                            </div>
                            <button 
                              className="btn-action btn-download-batch"
                              onClick={() => downloadBatchPDF(batchId)}
                              title="Download combined PDF for all tests"
                            >
                              📄 Download Combined PDF ({batchTests.length} Test{batchTests.length > 1 ? 's' : ''})
                            </button>
                          </div>
                          
                          <div className="batch-tests">
                            {batchTests.map(test => {
                              const badge = getStatusBadge(test.status);
                              return (
                                <div key={test._id} className="labtest-card batch-test-card">
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
                                      className="btn-action btn-delete"
                                      onClick={() => deleteTest(test._id, test.testType)}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                  <div className="batch-test-note">
                                    💡 Use "Download Combined PDF" button above to get all tests in one report
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
