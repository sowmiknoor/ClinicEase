const express = require('express');
const router = express.Router();
const healthTipController = require('../controllers/healthTipController');

// Public routes
router.get('/', healthTipController.getAllHealthTips);
router.get('/:id', healthTipController.getHealthTipById);

// Protected routes (require authentication)
router.post('/', healthTipController.createHealthTip);
router.put('/:id', healthTipController.updateHealthTip);
router.delete('/:id', healthTipController.deleteHealthTip);
router.post('/:id/like', healthTipController.toggleLike);

module.exports = router;
