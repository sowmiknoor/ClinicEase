const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { authMiddleware } = require('../controllers/authController');

// All routes require auth
router.use(authMiddleware);

// Request a visit
router.post('/request', visitController.requestVisit);

// Get user's visits
router.get('/', visitController.getUserVisits);

// Get visit by id
router.get('/:id', visitController.getVisitById);

// Update status
router.patch('/:id/status', visitController.updateStatus);

// Confirm a visit
router.put('/:id/confirm', visitController.confirmVisit);

// Cancel a visit
router.put('/:id/cancel', visitController.cancelVisit);

// Add route point
router.post('/:id/route', visitController.addRoutePoint);

// List doctors
router.get('/helpers/doctors', visitController.listDoctors);

module.exports = router;

