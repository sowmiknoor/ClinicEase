const axios = require('axios');

// Fallback knowledge base for when API is unavailable
const symptomMap = {
  fever: { conditions: ["Flu", "COVID-19", "Infection"], specialists: ["General Physician"] },
  cough: { conditions: ["Common Cold", "Bronchitis", "Asthma"], specialists: ["Pulmonologist"] },
  headache: { conditions: ["Migraine", "Tension Headache", "Sinusitis"], specialists: ["Neurologist", "ENT Specialist"] },
  chestpain: { conditions: ["Heart Disease", "Muscle Strain", "Acid Reflux"], specialists: ["Cardiologist"] },
  rash: { conditions: ["Allergy", "Eczema", "Infection"], specialists: ["Dermatologist"] },
};

exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Please provide an array of symptoms." 
      });
    }

    const symptomsText = symptoms.join(", ");
    const openaiKey = process.env.OPENAI_API_KEY;

    // If OpenAI key exists, use it for AI-powered analysis
    if (openaiKey) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a medical AI assistant. Analyze the provided symptoms and respond with a JSON object containing:
1. "conditions": array of possible conditions with probability percentages (e.g., "Flu (85%)")
2. "specialists": array of recommended specialists
3. "advice": brief medical advice (mention to see a doctor)
4. "severity": "mild", "moderate", or "severe"
5. "urgency": "routine", "urgent", or "emergency"

IMPORTANT: Always emphasize that this is NOT a diagnosis and the user must see a real doctor. Include a warning message.`
              },
              {
                role: 'user',
                content: `Analyze these symptoms and provide condition probabilities and specialist recommendations: ${symptomsText}`
              }
            ],
            temperature: 0.7,
            max_tokens: 500
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
            advice: parsedData.advice || "Please consult a healthcare professional.",
            severity: parsedData.severity || "unknown",
            urgency: parsedData.urgency || "routine",
            disclaimer: "⚠️ DISCLAIMER: This is an AI-assisted analysis for informational purposes only. It is NOT a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.",
            source: 'openai'
          });
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError.message);
        // Fall back to knowledge base
      }
    }

    // Fallback: Use local knowledge base
    let found = [];
    let specialists = new Set();
    
    symptoms.forEach(sym => {
      const key = sym.toLowerCase().replace(/[^a-z]/g, "");
      if (symptomMap[key]) {
        found.push(...symptomMap[key].conditions);
        symptomMap[key].specialists.forEach(doc => specialists.add(doc));
      }
    });

    // If no matches found, provide general recommendations
    if (found.length === 0) {
      return res.json({
        ok: true,
        conditions: ["Unable to identify specific conditions. Please provide more detailed symptoms."],
        specialists: ["General Physician"],
        advice: "Please describe your symptoms in more detail or consult a healthcare professional.",
        severity: "unknown",
        urgency: "routine",
        disclaimer: "⚠️ DISCLAIMER: This is an AI-assisted analysis for informational purposes only. It is NOT a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.",
        source: 'fallback'
      });
    }

    res.json({
      ok: true,
      conditions: [...new Set(found)],
      specialists: [...specialists],
      advice: "Please consult with a healthcare professional for a proper diagnosis.",
      severity: "unknown",
      urgency: "routine",
      disclaimer: "⚠️ DISCLAIMER: This is an AI-assisted analysis for informational purposes only. It is NOT a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.",
      source: 'knowledge_base'
    });

  } catch (error) {
    console.error('Symptom checker error:', error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error processing symptoms. Please try again." 
    });
  }
};
