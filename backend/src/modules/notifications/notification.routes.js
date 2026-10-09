const express = require("express");

const router = express.Router();

const notificationController = require("./notification.controller");

const auth = require("../../middleware/auth.middleware");

router.use(auth);

// ========================================
// CREATE NOTIFICATION
// ========================================

router.post(
  "/",
  notificationController.createNotification
);

router.get("/", notificationController.getNotifications);

router.get(
  "/unread-count",
  notificationController.getUnreadCount
);

router.patch(
  "/:id/read",
  notificationController.markAsRead
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

module.exports = router;