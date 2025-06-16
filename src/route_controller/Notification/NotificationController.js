const Notification = require('../../models/Notification');

// Get user notifications
exports.  getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // From JWT token
    console.log('User ID:', userId);
    const { 
      page = 1, 
      limit = 20, 
      unreadOnly = false,
      type = null,
      priority = null
    } = req.query;

    // Build query
    const query = { 
      userId: userId, 
      isDeleted: false 
    };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ isRead: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('data.reservationId', 'reservationCode hotel totalAmount checkInDate checkOutDate')
      .populate('data.promotionId', 'code name discountValue discountType');

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId: userId, 
      isRead: false, 
      isDeleted: false 
    });
    res.json({
      Data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId,
      isDeleted: false
    })
    .populate('data.reservationId', 'reservationCode hotel totalAmount checkInDate checkOutDate')
    .populate('data.promotionId', 'code name discountValue discountType');

    if (!notification) {
      return res.status(404).json({ 
        MsgNo: 'Notification not found' 
      });
    }

    res.json({
      Data: notification
    });

  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({
      Data: { 
        unreadCount 
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        userId: userId,
        isDeleted: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ 
        MsgNo: 'Notification not found' 
      });
    }

    res.json({
      MsgYes: 'Notification marked as read',
      Data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id; // Changed from req.user._id to req.user._id
    
    const result = await Notification.updateMany(
      { 
        userId: userId, 
        isRead: false,
        isDeleted: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      MsgYes: 'All notifications marked as read',
      Data: { 
        modifiedCount: result.modifiedCount 
      }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Delete notification (soft delete)
exports.deleteNotification = async (req, res) => {
  console.log('notificationId: ', req.params.notificationId);
  try {
    const { notificationId } = req.params;
    const userId = req.user._id; // Changed from req.user._id to req.user._id

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        userId: userId 
      },
      { 
        isDeleted: true 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ 
        MsgNo: 'Notification not found' 
      });
    }

    res.json({
      MsgYes: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            isRead: '$isRead'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          total: { $sum: '$count' },
          read: {
            $sum: {
              $cond: [{ $eq: ['$_id.isRead', true] }, '$count', 0]
            }
          },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$_id.isRead', false] }, '$count', 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    const totalCount = await Notification.countDocuments({
      userId: userId,
      isDeleted: false
    });

    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({
      Data: {
        totalCount,
        unreadCount,
        readCount: totalCount - unreadCount,
        typeStats: stats
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};

// Get notifications by type
exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      userId: userId,
      type: type.toUpperCase(),
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('data.reservationId', 'reservationCode hotel totalAmount')
    .populate('data.promotionId', 'code name discountValue');

    const total = await Notification.countDocuments({
      userId: userId,
      type: type.toUpperCase(),
      isDeleted: false
    });

    res.json({
      Data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get notifications by type error:', error);
    res.status(500).json({ 
      MsgNo: 'Internal server error',
      error: error.message 
    });
  }
};