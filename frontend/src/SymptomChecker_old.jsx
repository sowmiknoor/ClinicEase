import { useState } from "react";
import './SymptomChecker.css';

const knowledgeBase = [
  { condition: "Common Cold", keywords: ["cough", "runny", "congestion", "sore throat", "sneezing"], specialist: "General Physician" },
  { condition: "Flu / Viral Fever", keywords: ["fever", "chills", "body ache", "fatigue", "cough"], specialist: "General Physician" },
  { condition: "COVID-19", keywords: ["fever", "dry cough", "loss of smell", "loss of taste", "breathlessness"], specialist: "Pulmonologist" },
  { condition: "Asthma", keywords: ["wheezing", "shortness of breath", "chest tightness", "cough"], specialist: "Pulmonologist" },
  { condition: "Migraine", keywords: ["headache", "nausea", "light sensitivity", "aura", "throbbing"], specialist: "Neurologist" },
  { condition: "Hypertension", keywords: ["high blood pressure", "dizziness", "blurred vision", "headache"], specialist: "Cardiologist" },
  { condition: "Gastritis / Acid Reflux", keywords: ["heartburn", "acid", "bloating", "upper abdominal pain", "nausea"], specialist: "Gastroenterologist" },
  { condition: "Urinary Tract Infection", keywords: ["burning urination", "frequent urination", "pelvic pain", "cloudy urine"], specialist: "Urologist" },
  { condition: "Allergic Rhinitis", keywords: ["sneezing", "itchy nose", "watery eyes", "congestion"], specialist: "Allergist / Immunologist" },
  { condition: "Dermatitis / Rash", keywords: ["rash", "itching", "redness", "scaling"], specialist: "Dermatologist" },
  { condition: "Depression", keywords: ["sad", "low mood", "loss of interest", "sleep issues", "appetite change"], specialist: "Psychiatrist" },
  { condition: "Anxiety", keywords: ["worry", "palpitations", "sweating", "restlessness", "panic"], specialist: "Psychiatrist" },
  { condition: "Diabetes Mellitus", keywords: ["increased thirst", "frequent urination", "fatigue", "blurred vision"], specialist: "Endocrinologist" },
];

function inferConditions(symptomText) {
  const tokens = symptomText
    .toLowerCase()
    .split(/,|\n|\s+/)
    .map(t => t.trim())
    .filter(Boolean);

  const scores = knowledgeBase
    .map(entry => {
      const matchCount = entry.keywords.filter(k => tokens.some(t => t.includes(k))).length;
      return { ...entry, score: matchCount };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  const conditions = scores.map(e => `${e.condition} (confidence: ${(Math.min(1, e.score / (e.keywords.length || 1)) * 100).toFixed(0)}%)`);
  const specialists = [];
  scores.forEach(e => {
    if (!specialists.includes(e.specialist)) specialists.push(e.specialist);
  });

  return { conditions, specialists };
}

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
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

    const data = inferConditions(trimmed);
    if (!data.conditions.length) {
      setError("No clear match. Please describe symptoms in more detail.");
      setLoading(false);
      return;
    }

    setResults({ ok: true, ...data });
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
