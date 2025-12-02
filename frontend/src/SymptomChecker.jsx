import { useState } from "react";

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
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Smart Symptom Checker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter symptoms (e.g. fever, cough)"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 transition"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-blue-500 to-pink-400 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      {results && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-green-700 mb-2">Possible Conditions:</h3>
          {results.conditions.length > 0 ? (
            <ul className="list-disc list-inside mb-4">
              {results.conditions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">No matching conditions found.</p>
          )}
          <h3 className="text-xl font-semibold text-pink-700 mb-2">Recommended Specialists:</h3>
          {results.specialists.length > 0 ? (
            <ul className="list-disc list-inside">
              {results.specialists.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : (
            <p className="text-gray-600">No specialist recommendation.</p>
          )}
        </div>
      )}
    </div>
  );
}
