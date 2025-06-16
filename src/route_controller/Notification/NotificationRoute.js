const express = require('express');
const router = express.Router();
const notificationController = require('./NotificationController');
const cheskGuest = require('../../middlewares/cheskGuest');

// All routes require authentication
router.use(cheskGuest);

// Get user notifications with filtering and pagination
router.get('/', notificationController.getUserNotifications);

// Get notification by ID
router.get('/:notificationId', notificationController.getNotificationById);

// Get unread count
router.get('/count/unread', notificationController.getUnreadCount);

// Get notification statistics
router.get('/stats/summary', notificationController.getNotificationStats);

// Get notifications by type
router.get('/type/:type', notificationController.getNotificationsByType);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read/all', notificationController.markAllAsRead);

// Delete notification (soft delete)
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;