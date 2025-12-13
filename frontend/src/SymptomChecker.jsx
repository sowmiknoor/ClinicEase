import { useState } from "react";
import jsPDF from 'jspdf';
import './SymptomChecker.css';

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
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
        body: JSON.stringify({ 
          symptoms,
          age: age || undefined,
          gender: gender || undefined,
          duration: duration || undefined,
          additionalInfo: additionalInfo || undefined
        })
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
      // Prepare comprehensive description for medical record
      const comprehensiveDescription = `
SYMPTOM ANALYSIS REPORT
====================

Patient Input:
- Symptoms: ${input}
${age ? `- Age: ${age}` : ''}
${gender ? `- Gender: ${gender}` : ''}
${duration ? `- Duration: ${duration}` : ''}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ''}

AI Analysis Results:
${results.detailedAnalysis ? `\nDetailed Analysis:\n${results.detailedAnalysis}` : ''}

Possible Conditions:
${results.conditions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Recommended Specialists:
${results.specialists.join(', ')}

${results.redFlags && results.redFlags.length > 0 ? `Warning Signs to Watch:\n${results.redFlags.map(f => `- ${f}`).join('\n')}` : ''}

${results.selfCare && results.selfCare.length > 0 ? `Self-Care Recommendations:\n${results.selfCare.map(s => `- ${s}`).join('\n')}` : ''}

${results.whenToSeekCare ? `When to Seek Care:\n${results.whenToSeekCare}` : ''}

${results.diagnosticTests && results.diagnosticTests.length > 0 ? `Possible Diagnostic Tests:\n${results.diagnosticTests.join(', ')}` : ''}

Severity: ${results.severity || 'Unknown'}
Urgency: ${results.urgency || 'Unknown'}
Generated: ${new Date().toLocaleString()}
Source: ${results.source === 'openai' ? 'AI-Powered Analysis (ChatGPT)' : 'Medical Knowledge Base'}
`;

      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          title: `Symptom Check - ${results.conditions[0] || 'Health Analysis'}`,
          description: comprehensiveDescription.trim(),
          attachmentUrl: '' // Can be used for future PDF storage
        })
      });

      const data = await response.json();
      if (data.ok) {
        alert('✅ Successfully saved to your medical records!\n\nYou can view this analysis in your Medical Records section.');
      } else {
        console.error('Save error:', data);
        alert('⚠️ Could not save to records: ' + (data.msg || data.error || 'Please make sure you are logged in'));
      }
    } catch (err) {
      console.error('Error saving to records:', err);
      alert('❌ Error saving to records. Please make sure you are logged in and try again.');
    }
  };

  const downloadPDF = () => {
    if (!results) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Helper function to add text with wrapping
      const addText = (text, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach(line => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 3;
      };

      // Title
      doc.setFillColor(43, 158, 219);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SYMPTOM ANALYSIS REPORT', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text('ClinicEase AI-Powered Health Analysis', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      // Patient Information Section
      addText('PATIENT INFORMATION', 14, true);
      addText(`Symptoms: ${input}`);
      if (age) addText(`Age: ${age} years`);
      if (gender) addText(`Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
      if (duration) addText(`Duration: ${duration}`);
      if (additionalInfo) addText(`Additional Information: ${additionalInfo}`);
      yPosition += 5;

      // Analysis Section
      if (results.detailedAnalysis) {
        addText('DETAILED ANALYSIS', 14, true);
        addText(results.detailedAnalysis);
        yPosition += 5;
      }

      // Severity and Urgency
      addText('ASSESSMENT', 14, true);
      addText(`Severity Level: ${results.severity ? results.severity.toUpperCase() : 'UNKNOWN'}`);
      addText(`Urgency: ${results.urgency ? results.urgency.toUpperCase() : 'UNKNOWN'}`);
      yPosition += 5;

      // Possible Conditions
      addText('POSSIBLE CONDITIONS', 14, true);
      if (results.conditions && results.conditions.length > 0) {
        results.conditions.forEach((condition, i) => {
          addText(`${i + 1}. ${condition}`);
        });
      }
      yPosition += 5;

      // Red Flags
      if (results.redFlags && results.redFlags.length > 0) {
        doc.setTextColor(220, 38, 38);
        addText('⚠ WARNING SIGNS - SEEK IMMEDIATE CARE IF:', 12, true);
        doc.setTextColor(0, 0, 0);
        results.redFlags.forEach(flag => {
          addText(`• ${flag}`);
        });
        yPosition += 5;
      }

      // When to Seek Care
      if (results.whenToSeekCare) {
        addText('WHEN TO SEEK MEDICAL CARE', 14, true);
        addText(results.whenToSeekCare);
        yPosition += 5;
      }

      // Recommended Specialists
      addText('RECOMMENDED SPECIALISTS', 14, true);
      if (results.specialists && results.specialists.length > 0) {
        addText(results.specialists.join(', '));
      }
      yPosition += 5;

      // Self-Care Recommendations
      if (results.selfCare && results.selfCare.length > 0) {
        addText('SELF-CARE RECOMMENDATIONS', 14, true);
        results.selfCare.forEach(tip => {
          addText(`✓ ${tip}`);
        });
        yPosition += 5;
      }

      // Diagnostic Tests
      if (results.diagnosticTests && results.diagnosticTests.length > 0) {
        addText('POSSIBLE DIAGNOSTIC TESTS', 14, true);
        addText(results.diagnosticTests.join(', '));
        yPosition += 5;
      }

      // Lifestyle Advice
      if (results.lifestyle) {
        addText('LIFESTYLE & WELLNESS ADVICE', 14, true);
        addText(results.lifestyle);
        yPosition += 5;
      }

      // Related Questions
      if (results.relatedQuestions && results.relatedQuestions.length > 0) {
        addText('QUESTIONS YOUR DOCTOR MAY ASK', 14, true);
        results.relatedQuestions.forEach(q => {
          addText(`• ${q}`);
        });
        yPosition += 5;
      }

      // Footer - Disclaimer
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFillColor(254, 226, 226);
      doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 40, 'F');
      doc.setTextColor(127, 29, 29);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const disclaimer = doc.splitTextToSize(results.disclaimer, maxWidth);
      disclaimer.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 4;
      });
      yPosition += 10;

      // Generation info
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      doc.text(`Source: ${results.source === 'openai' ? 'ChatGPT AI Analysis' : 'Medical Knowledge Base'}`, margin, yPosition + 5);
      doc.text('ClinicEase - AI-Powered Healthcare Platform', pageWidth - margin, yPosition, { align: 'right' });

      // Save the PDF
      const fileName = `ClinicEase_Symptom_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert('✅ PDF downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('❌ Error generating PDF. Please try again.');
    }
  };

  const resetForm = () => {
    setInput("");
    setAge("");
    setGender("");
    setDuration("");
    setAdditionalInfo("");
    setResults(null);
    setError("");
  };

  return (
    <div className="sym-root">
      <div className="sym-hero">
        <h2>🩺 Advanced AI Symptom Checker</h2>
        <p>Get comprehensive, AI-powered health insights based on your symptoms. Receive detailed analysis, possible conditions, specialist recommendations, and personalized care guidance. Remember: This is for informational purposes only — always consult a healthcare professional for diagnosis and treatment.</p>

        <form onSubmit={handleSubmit} className="sym-form">
          <div className="form-section">
            <label>Symptoms <span className="required">*</span></label>
            <textarea
              placeholder="Describe your symptoms in detail (e.g., high fever, dry cough, headache, body aches) - separate multiple symptoms with commas or new lines"
              value={input}
              onChange={e => setInput(e.target.value)}
              rows="4"
              required
            />
            <small className="helper-text">Be as specific as possible for better analysis</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age (optional)</label>
              <input
                type="number"
                placeholder="Your age"
                value={age}
                onChange={e => setAge(e.target.value)}
                min="0"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Gender (optional)</label>
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (optional)</label>
              <input
                type="text"
                placeholder="e.g., 3 days, 1 week"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <label>Additional Information (optional)</label>
            <textarea
              placeholder="Any other relevant details: medical history, medications, recent travel, exposure to illness, etc."
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              rows="2"
            />
          </div>

          <button type="submit" disabled={loading} className="sym-submit">
            {loading ? '🔄 Analyzing with AI...' : '🔍 Analyze Symptoms'}
          </button>
        </form>
      </div>

      {error && <div className="sym-error">❌ {error}</div>}

      {results && (
        <div className="sym-results">
          {/* Disclaimer */}
          <div className="disclaimer-box">
            <strong>{results.disclaimer}</strong>
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
                  {results.urgency === 'emergency' && '🚨 '}
                  {results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {results.detailedAnalysis && (
            <div className="sym-card analysis-card">
              <h3>🔬 Detailed Analysis</h3>
              <p className="analysis-text">{results.detailedAnalysis}</p>
            </div>
          )}

          {/* Possible Conditions */}
          <div className="sym-card">
            <h3>📋 Possible Conditions</h3>
            <div className="conditions-list">
              {results.conditions && results.conditions.length > 0 ? (
                results.conditions.map((condition, i) => (
                  <div key={i} className="condition-item">
                    <span className="condition-number">{i + 1}</span>
                    <span className="condition-text">{condition}</span>
                  </div>
                ))
              ) : (
                <p className="no-results">Unable to identify specific conditions.</p>
              )}
            </div>
          </div>

          {/* Red Flags - Warning Signs */}
          {results.redFlags && results.redFlags.length > 0 && (
            <div className="sym-card red-flags-card">
              <h3>🚨 Warning Signs - Seek Immediate Care If:</h3>
              <ul className="red-flags-list">
                {results.redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* When to Seek Care */}
          {results.whenToSeekCare && (
            <div className="sym-card care-timing-card">
              <h3>⏰ When to Seek Medical Care</h3>
              <p className="care-timing-text">{results.whenToSeekCare}</p>
            </div>
          )}

          {/* Recommended Specialists */}
          <div className="sym-card">
            <h3>👨‍⚕️ Recommended Medical Specialists</h3>
            <div className="specialists-grid">
              {results.specialists && results.specialists.length > 0 ? (
                results.specialists.map((specialist, i) => (
                  <div key={i} className="specialist-badge">
                    <span className="specialist-icon">👨‍⚕️</span>
                    {specialist}
                  </div>
                ))
              ) : (
                <p className="no-results">No specific specialists identified.</p>
              )}
            </div>
          </div>

          {/* Self-Care Recommendations */}
          {results.selfCare && results.selfCare.length > 0 && (
            <div className="sym-card self-care-card">
              <h3>💊 Self-Care Recommendations</h3>
              <ul className="self-care-list">
                {results.selfCare.map((tip, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="self-care-note">
                <em>Note: These are general recommendations. Follow your doctor's specific advice.</em>
              </p>
            </div>
          )}

          {/* Diagnostic Tests */}
          {results.diagnosticTests && results.diagnosticTests.length > 0 && (
            <div className="sym-card diagnostic-card">
              <h3>🔬 Possible Diagnostic Tests</h3>
              <div className="diagnostic-grid">
                {results.diagnosticTests.map((test, i) => (
                  <div key={i} className="diagnostic-item">
                    <span className="test-icon">🧪</span>
                    {test}
                  </div>
                ))}
              </div>
              <p className="diagnostic-note">
                <small>Your doctor will determine which tests are necessary for your specific case.</small>
              </p>
            </div>
          )}

          {/* Lifestyle Advice */}
          {results.lifestyle && (
            <div className="sym-card lifestyle-card">
              <h3>🏃 Lifestyle & Wellness Advice</h3>
              <p>{results.lifestyle}</p>
            </div>
          )}

          {/* Related Questions */}
          {results.relatedQuestions && results.relatedQuestions.length > 0 && (
            <div className="sym-card questions-card">
              <h3>❓ Questions Your Doctor May Ask</h3>
              <ul className="questions-list">
                {results.relatedQuestions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Source */}
          <div className="source-info">
            <small>
              {results.source === 'openai' 
                ? '🤖 Analysis powered by ChatGPT (GPT-4)' 
                : results.source === 'knowledge_base'
                ? '📚 Analysis based on medical knowledge base'
                : '📖 General medical information'}
            </small>
            {results.timestamp && (
              <small className="timestamp">
                {' • '} Generated: {new Date(results.timestamp).toLocaleString()}
              </small>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sym-actions">
            <button onClick={saveToRecords} className="save-btn">
              💾 Save to Medical Records
            </button>
            <button onClick={downloadPDF} className="download-btn">
              📄 Download as PDF
            </button>
            <button onClick={resetForm} className="new-btn">
              🔄 New Symptom Check
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
