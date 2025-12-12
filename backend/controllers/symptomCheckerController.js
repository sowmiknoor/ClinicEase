const axios = require('axios');

// Enhanced fallback knowledge base for when API is unavailable
const symptomMap = {
  fever: { conditions: ["Influenza (Flu)", "COVID-19", "Bacterial Infection", "Viral Infection"], specialists: ["General Physician", "Infectious Disease Specialist"], severity: "moderate" },
  cough: { conditions: ["Common Cold", "Bronchitis", "Asthma", "Pneumonia"], specialists: ["Pulmonologist", "General Physician"], severity: "mild" },
  headache: { conditions: ["Migraine", "Tension Headache", "Sinusitis", "Cluster Headache"], specialists: ["Neurologist", "ENT Specialist"], severity: "mild" },
  chestpain: { conditions: ["Angina", "Muscle Strain", "Acid Reflux", "Costochondritis"], specialists: ["Cardiologist", "Emergency Medicine"], severity: "severe" },
  rash: { conditions: ["Allergic Reaction", "Eczema", "Contact Dermatitis", "Psoriasis"], specialists: ["Dermatologist", "Allergist"], severity: "mild" },
  dizziness: { conditions: ["Vertigo", "Low Blood Pressure", "Inner Ear Problems", "Dehydration"], specialists: ["Neurologist", "ENT Specialist"], severity: "moderate" },
  nausea: { conditions: ["Gastroenteritis", "Food Poisoning", "Migraine", "Pregnancy"], specialists: ["Gastroenterologist", "General Physician"], severity: "moderate" },
  fatigue: { conditions: ["Anemia", "Chronic Fatigue Syndrome", "Thyroid Disorder", "Depression"], specialists: ["Endocrinologist", "General Physician"], severity: "mild" },
  shortnessofbreath: { conditions: ["Asthma", "Pneumonia", "Heart Failure", "Anxiety"], specialists: ["Pulmonologist", "Cardiologist"], severity: "severe" },
  abdominalpain: { conditions: ["Gastritis", "Appendicitis", "IBS", "Kidney Stones"], specialists: ["Gastroenterologist", "General Surgeon"], severity: "moderate" },
};

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, duration, additionalInfo } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Please provide an array of symptoms." 
      });
    }

    const symptomsText = symptoms.join(", ");
    const openaiKey = process.env.OPENAI_API_KEY;

    // Build detailed context for AI
    let contextInfo = `Symptoms: ${symptomsText}`;
    if (age) contextInfo += `\nAge: ${age}`;
    if (gender) contextInfo += `\nGender: ${gender}`;
    if (duration) contextInfo += `\nDuration: ${duration}`;
    if (additionalInfo) contextInfo += `\nAdditional Information: ${additionalInfo}`;

    // If OpenAI key exists, use it for AI-powered analysis
    if (openaiKey) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an advanced medical AI assistant providing preliminary symptom analysis. Analyze symptoms thoroughly and respond with a detailed JSON object containing:

1. "conditions": array of 3-5 possible conditions with probability percentages (e.g., "Influenza (75-85%)", "COVID-19 (60-70%)"). Order by likelihood.

2. "specialists": array of 2-4 recommended medical specialists to consult, ordered by priority.

3. "detailedAnalysis": detailed explanation of why these conditions are suspected based on the symptoms (2-3 sentences).

4. "redFlags": array of warning signs that require immediate medical attention related to these symptoms.

5. "selfCare": array of 3-5 self-care recommendations that are safe and appropriate while awaiting medical consultation.

6. "whenToSeekCare": specific guidance on timing - "Seek emergency care if...", "See a doctor within 24-48 hours if...", etc.

7. "diagnosticTests": array of tests a doctor might recommend (e.g., "Blood test", "Chest X-ray", "ECG").

8. "lifestyle": brief lifestyle advice related to the symptoms.

9. "severity": "mild", "moderate", or "severe" based on symptom analysis.

10. "urgency": "routine" (can wait days), "urgent" (within 24-48 hours), or "emergency" (seek immediate care).

11. "relatedQuestions": 3-4 follow-up questions a doctor would ask to better diagnose.

CRITICAL: Always emphasize this is NOT a diagnosis. Medical evaluation is essential. Be thorough but responsible.`
              },
              {
                role: 'user',
                content: `Provide a comprehensive symptom analysis for:\n${contextInfo}`
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          },
          {
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        
        // Try to parse JSON from AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          return res.json({
            ok: true,
            conditions: parsedData.conditions || [],
            specialists: parsedData.specialists || [],
            detailedAnalysis: parsedData.detailedAnalysis || "Analysis not available",
            redFlags: parsedData.redFlags || [],
            selfCare: parsedData.selfCare || [],
            whenToSeekCare: parsedData.whenToSeekCare || "Consult a healthcare professional soon.",
            diagnosticTests: parsedData.diagnosticTests || [],
            lifestyle: parsedData.lifestyle || "",
            relatedQuestions: parsedData.relatedQuestions || [],
            severity: parsedData.severity || "unknown",
            urgency: parsedData.urgency || "routine",
            disclaimer: "⚠️ MEDICAL DISCLAIMER: This AI-powered analysis is for informational and educational purposes only. It is NOT a medical diagnosis, treatment, or professional medical advice. Individual symptoms can have many causes. Always consult a qualified healthcare professional for proper evaluation, diagnosis, and treatment. In case of emergency, call emergency services immediately.",
            source: 'openai',
            timestamp: new Date().toISOString()
          });
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError.message);
        // Fall back to knowledge base
      }
    }

    // Fallback: Use enhanced local knowledge base
    let found = [];
    let specialists = new Set();
    let maxSeverity = "mild";
    
    symptoms.forEach(sym => {
      const key = sym.toLowerCase().replace(/[^a-z]/g, "");
      if (symptomMap[key]) {
        found.push(...symptomMap[key].conditions);
        symptomMap[key].specialists.forEach(doc => specialists.add(doc));
        if (symptomMap[key].severity === "severe") maxSeverity = "severe";
        else if (symptomMap[key].severity === "moderate" && maxSeverity !== "severe") maxSeverity = "moderate";
      }
    });

    // If no matches found, provide general recommendations
    if (found.length === 0) {
      return res.json({
        ok: true,
        conditions: ["Unable to identify specific conditions based on provided symptoms."],
        specialists: ["General Physician"],
        detailedAnalysis: "Your symptoms don't match our knowledge base patterns. A general physician can help evaluate your condition thoroughly.",
        redFlags: ["Severe pain", "Difficulty breathing", "Chest pain", "Loss of consciousness", "Severe bleeding"],
        selfCare: ["Rest adequately", "Stay hydrated", "Monitor your symptoms", "Avoid self-medication"],
        whenToSeekCare: "Consult a healthcare professional within 24-48 hours for proper evaluation.",
        diagnosticTests: ["General physical examination", "Basic blood work if needed"],
        lifestyle: "Maintain a healthy lifestyle with proper diet, exercise, and sleep.",
        relatedQuestions: [],
        severity: "unknown",
        urgency: "routine",
        disclaimer: "⚠️ MEDICAL DISCLAIMER: This AI-powered analysis is for informational and educational purposes only. It is NOT a medical diagnosis, treatment, or professional medical advice. Individual symptoms can have many causes. Always consult a qualified healthcare professional for proper evaluation, diagnosis, and treatment. In case of emergency, call emergency services immediately.",
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    }

    // Return enhanced knowledge base results
    res.json({
      ok: true,
      conditions: [...new Set(found)].slice(0, 5),
      specialists: [...specialists],
      detailedAnalysis: `Based on your symptoms (${symptomsText}), these conditions are possibilities. However, accurate diagnosis requires professional medical examination.`,
      redFlags: [
        "Symptoms worsen rapidly",
        "High fever above 103°F (39.4°C)",
        "Difficulty breathing or shortness of breath",
        "Chest pain or pressure",
        "Severe headache or confusion"
      ],
      selfCare: [
        "Get adequate rest and sleep",
        "Stay well hydrated with water and clear fluids",
        "Monitor your temperature and symptoms",
        "Maintain good hygiene",
        "Avoid contact with others if symptoms suggest infection"
      ],
      whenToSeekCare: maxSeverity === "severe" 
        ? "Seek medical attention within 24 hours or immediately if symptoms worsen." 
        : "Schedule an appointment with a healthcare provider within a few days if symptoms persist or worsen.",
      diagnosticTests: ["Physical examination", "Medical history review", "Additional tests as recommended by physician"],
      lifestyle: "Rest, maintain a balanced diet, stay hydrated, and avoid stress.",
      relatedQuestions: [
        "How long have you been experiencing these symptoms?",
        "Have symptoms gotten better, worse, or stayed the same?",
        "Do you have any chronic medical conditions?",
        "Are you taking any medications?"
      ],
      severity: maxSeverity,
      urgency: maxSeverity === "severe" ? "urgent" : "routine",
      disclaimer: "⚠️ MEDICAL DISCLAIMER: This AI-powered analysis is for informational and educational purposes only. It is NOT a medical diagnosis, treatment, or professional medical advice. Individual symptoms can have many causes. Always consult a qualified healthcare professional for proper evaluation, diagnosis, and treatment. In case of emergency, call emergency services immediately.",
      source: 'knowledge_base',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Symptom checker error:', error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error processing symptoms. Please try again." 
    });
  }
};
