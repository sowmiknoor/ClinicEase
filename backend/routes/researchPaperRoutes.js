const express = require('express');
const router = express.Router();
const researchPaperController = require('../controllers/researchPaperController');

// Public routes
router.get('/', researchPaperController.getAllPapers);
router.get('/:id', researchPaperController.getPaperById);

// Protected routes (require authentication)
router.post('/', researchPaperController.createPaper);
router.put('/:id', researchPaperController.updatePaper);
router.delete('/:id', researchPaperController.deletePaper);
router.post('/:id/cite', researchPaperController.incrementCitations);

module.exports = router;
