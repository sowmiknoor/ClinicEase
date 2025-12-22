const express = require('express');
const router = express.Router();
const { authMiddleware, requireRoles } = require('../controllers/authController');
const controller = require('../controllers/notificationController');

router.use(authMiddleware);
router.get('/', requireRoles(['Doctor','Admin','Patient']), controller.list);
router.post('/', requireRoles(['Doctor','Admin','Patient']), controller.create);
router.patch('/mark-all-read', requireRoles(['Doctor','Admin','Patient']), controller.markAllRead);
router.patch('/:id/read', requireRoles(['Doctor','Admin','Patient']), controller.markRead);
router.delete('/:id', requireRoles(['Doctor','Admin','Patient']), controller.deleteNotification);

module.exports = router;
