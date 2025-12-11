const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/authController');
const homeVisitController = require('../controllers/homeVisitController');

// Apply authentication to all routes
router.use(authMiddleware);

// Patient routes
router.post('/create', homeVisitController.createHomeVisit);
router.patch('/:id/cancel', homeVisitController.cancelHomeVisit);

// Doctor routes
router.patch('/:id/accept', homeVisitController.acceptHomeVisit);
router.patch('/:id/reject', homeVisitController.rejectHomeVisit);
router.patch('/:id/complete', homeVisitController.completeHomeVisit);

// Common routes
router.get('/', homeVisitController.getHomeVisits);
router.get('/:id', homeVisitController.getHomeVisit);

module.exports = router;
