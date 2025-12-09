import { useState } from "react";
import './SymptomChecker.css';

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = localStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter at least one symptom.");
      setLoading(false);
      return;
    }

    // Parse symptoms (comma or space separated)
    const symptoms = trimmed
      .split(/,|\n/)
      .map(s => s.trim())
      .filter(Boolean);

    if (symptoms.length === 0) {
      setError("Please enter at least one symptom.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ symptoms })
      });

      const data = await response.json();

      if (data.ok) {
        setResults(data);
      } else {
        setError(data.msg || 'Unable to analyze symptoms. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveToRecords = async () => {
    if (!results) return;
    
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          type: 'Symptom Check',
          description: input,
          findings: results.conditions.join(', '),
          recommendation: results.specialists.join(', '),
          date: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.ok) {
        alert('✓ Saved to your medical records!');
      }
    } catch (err) {
      console.error('Error saving to records:', err);
    }
  };

  return (
    <div className="sym-root">
      <div className="sym-hero">
        <h2>🩺 Smart Symptom Checker with AI</h2>
        <p>Describe your symptoms and receive AI-powered probable conditions and specialist recommendations. This is for informational guidance only — always consult a healthcare professional.</p>

        <form onSubmit={handleSubmit} className="sym-form">
          <textarea
            placeholder="Enter your symptoms (e.g., fever, cough, headache) - separate multiple symptoms with commas or new lines"
            value={input}
            onChange={e => setInput(e.target.value)}
            rows="4"
            required
          />
          <button type="submit" disabled={loading} className="sym-submit">
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </form>
      </div>

      {error && <div className="sym-error">❌ {error}</div>}

      {results && (
        <div className="sym-results">
          {/* Disclaimer */}
          <div className="disclaimer-box">
            <strong>⚠️ {results.disclaimer}</strong>
          </div>

          {/* Severity and Urgency */}
          {results.severity && (
            <div className="severity-section">
              <div className="severity-item">
                <label>Severity Level:</label>
                <span className={`severity-badge ${results.severity}`}>
                  {results.severity.charAt(0).toUpperCase() + results.severity.slice(1)}
                </span>
              </div>
              <div className="severity-item">
                <label>Urgency:</label>
                <span className={`urgency-badge ${results.urgency}`}>
                  {results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          <div className="sym-card">
            <h3>📋 Possible Conditions (with probability)</h3>
            <div className="conditions-list">
              {results.conditions && results.conditions.length > 0 ? (
                results.conditions.map((condition, i) => (
                  <div key={i} className="condition-item">
                    <span className="condition-text">{condition}</span>
                  </div>
                ))
              ) : (
                <p className="no-results">Unable to identify specific conditions.</p>
              )}
            </div>
          </div>

          {/* Recommended Specialists */}
          <div className="sym-card">
            <h3>👨‍⚕️ Recommended Specialists</h3>
            <div className="specialists-grid">
              {results.specialists && results.specialists.length > 0 ? (
                results.specialists.map((specialist, i) => (
                  <div key={i} className="specialist-badge">
                    {specialist}
                  </div>
                ))
              ) : (
                <p className="no-results">No specific specialists identified.</p>
              )}
            </div>
          </div>

          {/* Medical Advice */}
          {results.advice && (
            <div className="sym-card advice-card">
              <h3>💡 Medical Advice</h3>
              <p>{results.advice}</p>
            </div>
          )}

          {/* AI Source */}
          <div className="source-info">
            <small>
              {results.source === 'openai' 
                ? '🤖 Analysis powered by OpenAI GPT' 
                : '📚 Analysis based on medical knowledge base'}
            </small>
          </div>

          {/* Action Buttons */}
          <div className="sym-actions">
            <button onClick={saveToRecords} className="save-btn">
              💾 Save to Medical Records
            </button>
            <button onClick={() => setResults(null)} className="new-btn">
              🔄 Check Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
