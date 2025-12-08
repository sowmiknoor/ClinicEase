import { useState } from "react";
import './SymptomChecker.css';

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: input.split(/,|\s+/).map(s => s.trim()).filter(Boolean) })
      });
      const data = await res.json();
      if (data.ok) {
        setResults(data);
      } else {
        setError(data.msg || "No results found.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="sym-root">
      <div className="sym-hero">
        <h2>Smart Symptom Checker</h2>
        <p>Enter symptoms and receive possible conditions and suggested specialists. Use medically-informed suggestions — for guidance only.</p>

        <form onSubmit={handleSubmit} className="sym-form">
          <input
            type="text"
            placeholder="e.g. fever, cough, headache"
            value={input}
            onChange={e => setInput(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check'}</button>
        </form>
      </div>

      {error && <div style={{color:'#c0392b', marginTop:12}}>{error}</div>}

      {results && (
        <div className="sym-results">
          <div className="sym-card">
            <h3>Possible Conditions</h3>
            <div className="chips">
              {results.conditions.slice(0,6).map((c,i) => <span key={i} className="chip">{c}</span>)}
            </div>
            <ul className="conditions-list">
              {results.conditions.map((c,i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <aside className="side-panel">
            <h4>Recommended Specialists</h4>
            <ul className="specialists">
              {results.specialists.map((s,i) => <li key={i}>{s}</li>)}
            </ul>

            <div style={{marginTop:12}}>
              <h4>Quick Actions</h4>
              <div className="quick-actions">
                <button onClick={() => window.alert('Feature coming soon')}>Book Tele-Consult</button>
                <button onClick={() => window.alert('Feature coming soon')}>Save To Dashboard</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
