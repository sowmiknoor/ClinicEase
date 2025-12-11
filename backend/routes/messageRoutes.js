const express = require('express');
const router = express.Router();
const { authMiddleware, requireRoles } = require('../controllers/authController');
const controller = require('../controllers/messageController');

router.use(authMiddleware);
router.get('/recipients', requireRoles(['Doctor','Admin','Patient']), controller.getAvailableRecipients);
router.post('/', requireRoles(['Doctor','Admin','Patient']), controller.send);
router.get('/', requireRoles(['Doctor','Admin','Patient']), controller.inbox);
router.patch('/:id/read', requireRoles(['Doctor','Admin','Patient']), controller.markRead);

module.exports = router;
