import { useState, useEffect } from 'react';
import './LabResults.css';

export default function LabResults() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAllTests, setShowAllTests] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchLabTests(userData.userId);
  }, []);

  const fetchLabTests = async (userId) => {
    try {
      const res = await fetch('/api/lab-tests', {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setLabTests(data.labTests || []);
      }
    } catch (err) {
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (testId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/lab-tests/${testId}/pdf`, {
        headers: { 'x-user-id': userId }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.pdfUrl) {
          // Open PDF in new tab
          window.open(data.pdfUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      ordered: '#f59e0b',
      scheduled: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  if (loading) {
    return <div className="lab-loading">Loading lab tests...</div>;
  }

  return (
    <div className="lab-results">
      <div className="lab-header">
        <h1>🔬 Lab Test Results</h1>
        <p>Track your lab tests and view results</p>
      </div>

      {labTests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <h3>No Lab Tests Yet</h3>
          <p>Lab tests requested by your doctor will appear here.</p>
        </div>
      ) : (
        <div className="lab-grid">
          {(showAllTests ? labTests : labTests.slice(0, 5)).map(test => (
            <div key={test._id} className="lab-card">
              <div className="lab-card-header">
                <div>
                  <h3>{test.testType}</h3>
                  {test.category && <p className="category">{test.category}</p>}
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(test.status) }}
                >
                  {test.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="lab-details">
                <div className="detail-row">
                  <span className="label">👨‍⚕️ Requested by:</span>
                  <span className="value">Dr. {test.doctorId?.name || 'Unknown'}</span>
                </div>

                <div className="detail-row">
                  <span className="label">📅 Request Date:</span>
                  <span className="value">{formatDate(test.createdAt)}</span>
                </div>

                {test.scheduledDate && (
                  <div className="detail-row">
                    <span className="label">🗓️ Scheduled:</span>
                    <span className="value">{formatDate(test.scheduledDate)}</span>
                  </div>
                )}

                {test.completedDate && (
                  <div className="detail-row">
                    <span className="label">✅ Completed:</span>
                    <span className="value">{formatDate(test.completedDate)}</span>
                  </div>
                )}

                {test.labName && (
                  <div className="detail-row">
                    <span className="label">🏥 Lab:</span>
                    <span className="value">{test.labName}</span>
                  </div>
                )}

                {test.labLocation && (
                  <div className="detail-row">
                    <span className="label">📍 Location:</span>
                    <span className="value">{test.labLocation}</span>
                  </div>
                )}

                {test.notes && (
                  <div className="notes">
                    <span className="label">📝 Notes:</span>
                    <p>{test.notes}</p>
                  </div>
                )}

                {test.testResults && (
                  <div className="test-results">
                    <h4>📊 Results</h4>
                    {test.testResults.value && (
                      <div className="result-detail">
                        <span><strong>Value:</strong> {test.testResults.value} {test.testResults.unit}</span>
                      </div>
                    )}
                    {test.testResults.normalRange && (
                      <div className="result-detail">
                        <span><strong>Normal Range:</strong> {test.testResults.normalRange}</span>
                      </div>
                    )}
                    {test.testResults.interpretation && (
                      <div className="result-interpretation">
                        <strong>Interpretation:</strong> {test.testResults.interpretation}
                      </div>
                    )}
                  </div>
                )}

                <div className="lab-actions">
                  <button 
                    onClick={() => handleDownloadPDF(test._id)} 
                    className="download-btn"
                  >
                    📄 Download PDF Report
                  </button>
                  
                  {test.resultUrl && (
                    <a href={test.resultUrl} target="_blank" rel="noopener noreferrer" className="view-btn">
                      👁️ View Digital Copy
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* View All Button */}
          {!showAllTests && labTests.length > 5 && (
            <div className="view-all-section">
              <button 
                className="btn-view-all"
                onClick={() => setShowAllTests(true)}
              >
                📋 View All Lab Tests ({labTests.length} total)
              </button>
            </div>
          )}
          
          {showAllTests && labTests.length > 5 && (
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
  );
}
