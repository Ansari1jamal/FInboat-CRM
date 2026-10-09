
const { prisma } = require("../../config/db");

// ========================================
// CREATE NORMAL NOTIFICATION
// ========================================

const createNotification = async ({
  userId,
  type,
  title,
  message,
  priority = "NORMAL",

  leadId = null,
  loanAccountId = null,
  emiScheduleId = null,
  followUpId = null,
}) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      priority,

      leadId,
      loanAccountId,
      emiScheduleId,
      followUpId,
    },
  });
};

// ========================================
// CREATE NOTIFICATION ONCE
// Prevent duplicate notifications
// ========================================

const createNotificationOnce = async ({
  userId,
  type,
  title,
  message,
  priority = "NORMAL",

  leadId = null,
  loanAccountId = null,
  emiScheduleId = null,
  followUpId = null,

  dedupeKey,
}) => {
  // ======================================
  // No dedupe key
  // Normal notification create
  // ======================================

  if (!dedupeKey) {
    return createNotification({
      userId,
      type,
      title,
      message,
      priority,

      leadId,
      loanAccountId,
      emiScheduleId,
      followUpId,
    });
  }

  // ======================================
  // DEDUPE NOTIFICATION
  // ======================================

  return prisma.notification.upsert({
    where: {
      userId_dedupeKey: {
        userId,
        dedupeKey,
      },
    },

    // Already exists
    update: {},

    // Create only once
    create: {
      userId,
      type,
      title,
      message,
      priority,

      leadId,
      loanAccountId,
      emiScheduleId,
      followUpId,

      dedupeKey,
    },
  });
};

// ========================================
// GET NOTIFICATIONS
// Pagination + Filters
// ========================================

const getNotifications = async ({
  user,
  page = 1,
  limit = 20,
  isRead,
  type,
  priority,
}) => {
  // ======================================
  // PAGINATION SAFETY
  // ======================================

  page = Math.max(
    Number(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  const skip =
    (page - 1) * limit;

  // ======================================
  // BASE WHERE
  // ======================================

  const where = {
    userId: user.userId,
  };

  // ======================================
  // READ FILTER
  // ======================================

  if (isRead !== undefined) {
    where.isRead =
      isRead === true ||
      isRead === "true";
  }

  // ======================================
  // TYPE FILTER
  // ======================================

  if (type) {
    where.type = type;
  }

  // ======================================
  // PRIORITY FILTER
  // ======================================

  if (priority) {
    where.priority = priority;
  }

  // ======================================
  // FETCH
  // ======================================

  const [
    notifications,
    total,
  ] = await Promise.all([
    prisma.notification.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        lead: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            status: true,
          },
        },

        loanAccount: {
          select: {
            id: true,
            loanAccountNumber: true,
            status: true,
          },
        },

        emiSchedule: {
          select: {
            id: true,
            emiNumber: true,
            dueDate: true,
            emiAmount: true,
            outstandingAmount: true,
            status: true,
          },
        },

        followUp: {
          select: {
            id: true,
            followUpDate: true,
            followUpTime: true,
            status: true,
          },
        },
      },
    }),

    prisma.notification.count({
      where,
    }),
  ]);

  // ======================================
  // RESPONSE
  // ======================================

  return {
    notifications,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total / limit
        ),
    },
  };
};

// ========================================
// GET UNREAD COUNT
// ========================================

const getUnreadCount = async ({
  user,
}) => {
  return prisma.notification.count({
    where: {
      userId: user.userId,
      isRead: false,
    },
  });
};

// ========================================
// MARK ONE AS READ
// ========================================

const markAsRead = async ({
  user,
  notificationId,
}) => {
  // ======================================
  // FIND NOTIFICATION
  // ======================================

  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.userId,
      },
    });

  // ======================================
  // SECURITY
  // ======================================

  if (!notification) {
    throw new Error(
      "Notification not found"
    );
  }

  // ======================================
  // ALREADY READ
  // ======================================

  if (notification.isRead) {
    return notification;
  }

  // ======================================
  // MARK READ
  // ======================================

  return prisma.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ========================================
// MARK ALL AS READ
// ========================================

const markAllAsRead = async ({
  user,
}) => {
  return prisma.notification.updateMany({
    where: {
      userId: user.userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createNotification,
  createNotificationOnce,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
