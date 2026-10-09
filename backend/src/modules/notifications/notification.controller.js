const notificationService = require("./notification.service");

// ========================================
// CREATE NOTIFICATION
// ========================================

const createNotification = async (req, res, next) => {
  try {
    const notification =
      await notificationService.createNotification({
        userId: req.user.userId,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
        leadId: req.body.leadId || null,
      });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET NOTIFICATIONS
// ========================================

const getNotifications = async (req, res, next) => {
  try {
    const result =
      await notificationService.getNotifications({
        user: req.user,
        page: req.query.page,
        limit: req.query.limit,
        isRead: req.query.isRead,
      });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        items: result.notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET UNREAD COUNT
// ========================================

const getUnreadCount = async (req, res, next) => {
  try {
    const count =
      await notificationService.getUnreadCount({
        user: req.user,
      });

    return res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// MARK ONE AS READ
// ========================================

const markAsRead = async (req, res, next) => {
  try {
    const notification =
      await notificationService.markAsRead({
        user: req.user,
        notificationId: req.params.id,
      });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// MARK ALL AS READ
// ========================================

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead({
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};