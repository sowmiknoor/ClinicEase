const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Search medicines (autocomplete)
router.get('/search', medicineController.searchMedicines);

// Get all medicines
router.get('/', medicineController.getAllMedicines);

// Get medicine categories
router.get('/categories', medicineController.getCategories);

// Get medicine by ID
router.get('/:id', medicineController.getMedicineById);

module.exports = router;
