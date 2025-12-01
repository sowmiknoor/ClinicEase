// Simple symptom-to-condition/specialist mapping
const symptomMap = {
  fever: { conditions: ["Flu", "COVID-19", "Infection"], specialists: ["General Physician"] },
  cough: { conditions: ["Common Cold", "Bronchitis", "Asthma"], specialists: ["Pulmonologist"] },
  headache: { conditions: ["Migraine", "Tension Headache", "Sinusitis"], specialists: ["Neurologist", "ENT Specialist"] },
  chestpain: { conditions: ["Heart Disease", "Muscle Strain", "Acid Reflux"], specialists: ["Cardiologist"] },
  rash: { conditions: ["Allergy", "Eczema", "Infection"], specialists: ["Dermatologist"] },
  // Add more mappings as needed
};

exports.checkSymptoms = (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ ok: false, msg: "Please provide an array of symptoms." });
  }
  let found = [];
  let specialists = new Set();
  symptoms.forEach(sym => {
    const key = sym.toLowerCase().replace(/[^a-z]/g, "");
    if (symptomMap[key]) {
      found.push(...symptomMap[key].conditions);
      symptomMap[key].specialists.forEach(doc => specialists.add(doc));
    }
  });
  res.json({
    ok: true,
    conditions: [...new Set(found)],
    specialists: [...specialists],
  });
};
