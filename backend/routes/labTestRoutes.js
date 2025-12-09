const express = require('express');
const router = express.Router();
const { authMiddleware, requireRoles } = require('../controllers/authController');
const controller = require('../controllers/labTestController');

router.use(authMiddleware);
router.post('/', requireRoles(['Doctor','Admin','Patient']), controller.create);
router.get('/', requireRoles(['Doctor','Admin','Patient']), controller.list);
router.patch('/:id/status', requireRoles(['Doctor','Admin','Patient']), controller.updateStatus);

module.exports = router;
