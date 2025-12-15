const medicines = require('../data/medicineDatabase');

// Search medicines by name or generic name
exports.searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ ok: true, medicines: [] });
    }

    const searchTerm = q.toLowerCase();
    
    // Filter medicines by name, generic name, or manufacturer
    const results = medicines.filter(med => 
      med.name.toLowerCase().includes(searchTerm) ||
      med.genericName.toLowerCase().includes(searchTerm) ||
      med.manufacturer.toLowerCase().includes(searchTerm) ||
      med.category.toLowerCase().includes(searchTerm)
    );

    // Sort by relevance (exact matches first, then starts with, then contains)
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aGeneric = a.genericName.toLowerCase();
      const bGeneric = b.genericName.toLowerCase();
      
      // Exact match
      if (aName === searchTerm) return -1;
      if (bName === searchTerm) return 1;
      if (aGeneric === searchTerm) return -1;
      if (bGeneric === searchTerm) return 1;
      
      // Starts with
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
      if (aGeneric.startsWith(searchTerm) && !bGeneric.startsWith(searchTerm)) return -1;
      if (!aGeneric.startsWith(searchTerm) && bGeneric.startsWith(searchTerm)) return 1;
      
      // Alphabetical
      return aName.localeCompare(bName);
    });

    // Limit to top 10 results
    const limitedResults = results.slice(0, 10);

    res.json({ 
      ok: true, 
      medicines: limitedResults,
      total: results.length 
    });
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to search medicines',
      medicines: []
    });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = medicines.find(m => m.id === parseInt(id));
    
    if (!medicine) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Medicine not found' 
      });
    }

    res.json({ 
      ok: true, 
      medicine 
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to get medicine' 
    });
  }
};

// Get all medicines (with optional category filter)
exports.getAllMedicines = async (req, res) => {
  try {
    const { category } = req.query;
    
    let results = medicines;
    
    if (category) {
      results = medicines.filter(m => 
        m.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json({ 
      ok: true, 
      medicines: results,
      total: results.length 
    });
  } catch (error) {
    console.error('Get all medicines error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to get medicines' 
    });
  }
};

// Get medicine categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [...new Set(medicines.map(m => m.category))];
    
    res.json({ 
      ok: true, 
      categories: categories.sort() 
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to get categories' 
    });
  }
};
