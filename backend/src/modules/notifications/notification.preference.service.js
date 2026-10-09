
const { prisma } = require("../../config/db");

// ========================================
// GET PREFERENCES
// ========================================

const getPreferences = async (
  userId
) => {
  let preferences =
    await prisma.notificationPreference.findUnique({
      where: {
        userId,
      },
    });

  // ======================================
  // CREATE DEFAULT PREFERENCES
  // ======================================

  if (!preferences) {
    preferences =
      await prisma.notificationPreference.create({
        data: {
          userId,
        },
      });
  }

  return preferences;
};

// ========================================
// UPDATE PREFERENCES
// ========================================

const updatePreferences = async ({
  userId,
  data,
}) => {
  return prisma.notificationPreference.upsert({
    where: {
      userId,
    },

    update: data,

    create: {
      userId,
      ...data,
    },
  });
};

// ========================================
// CHECK NOTIFICATION PREFERENCE
// ========================================

const isNotificationAllowed = async ({
  userId,
  type,
}) => {
  const preferences =
    await getPreferences(userId);

  switch (type) {
    // ====================================
    // EMI
    // ====================================

    case "EMI_DUE_SOON":
      return preferences.emiDueSoon;

    case "EMI_DUE_TODAY":
      return preferences.emiDueToday;

    case "EMI_OVERDUE":
      return preferences.emiOverdue;

    // ====================================
    // FOLLOW UP
    // ====================================

    case "FOLLOW_UP_DUE":
      return preferences.followUpDue;

    case "FOLLOW_UP_OVERDUE":
      return preferences.followUpOverdue;

    // ====================================
    // LEAD
    // ====================================

    case "LEAD_ASSIGNED":
      return preferences.leadAssigned;

    case "LEAD_TRANSFERRED":
      return preferences.leadTransferred;

    // ====================================
    // TARGET
    // ====================================

    case "TARGET_UPDATED":
      return preferences.targetUpdated;

    // ====================================
    // SYSTEM
    // ====================================

    case "SYSTEM":
      return preferences.system;

    // ====================================
    // DEFAULT
    // ====================================

    default:
      return true;
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getPreferences,
  updatePreferences,
  isNotificationAllowed,
};

