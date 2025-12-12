const express = require('express');
const router = express.Router();
const { authMiddleware, requireRoles } = require('../controllers/authController');
const controller = require('../controllers/labTestController');

router.use(authMiddleware);
router.get('/catalog', requireRoles(['Doctor','Admin','Patient']), controller.getCatalog);
router.get('/bangladesh-labs', requireRoles(['Doctor','Admin','Patient']), controller.getBangladeshLabs);
router.get('/batch/:batchOrderId/pdf', requireRoles(['Doctor','Admin','Patient']), controller.generateBatchPDF);
router.get('/:id/pdf', requireRoles(['Doctor','Admin','Patient']), controller.generatePDF);
router.post('/', requireRoles(['Doctor','Admin','Patient']), controller.create);
router.get('/', requireRoles(['Doctor','Admin','Patient']), controller.list);
router.patch('/:id/status', requireRoles(['Doctor','Admin','Patient']), controller.updateStatus);
router.delete('/:id', requireRoles(['Doctor','Admin','Patient']), controller.deleteTest);

module.exports = router;
