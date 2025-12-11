const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authMiddleware } = require('../controllers/authController');

// require auth for all
router.use(authMiddleware);

router.post('/book', consultationController.bookConsultation);
router.get('/', consultationController.getUserConsultations);
router.get('/:id', consultationController.getConsultationById);
router.patch('/:id/status', consultationController.updateStatus);
router.post('/:id/cancel', consultationController.cancelConsultation);
router.get('/:id/meeting', consultationController.ensureMeetingLink);

module.exports = router;
//ho vai 