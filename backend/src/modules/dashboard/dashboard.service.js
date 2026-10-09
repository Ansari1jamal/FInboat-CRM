
const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const followUpService = require("../followups/followup.service");

const targetService = require("../targets/target.service");

const reportService = require("../reports/report.service");

// ========================================
// DASHBOARD SCOPE
// ========================================

const getDashboardScope = (user) => {
  switch (user.role) {
    // ADMIN
    case "ADMIN":
      return {};

    // MANAGER
    case "MANAGER":
      return {
        assignedTo: {
          managerId: user.userId,
        },
      };

    // TL
    case "TL":
      return {
        assignedTo: {
          tlId: user.userId,
        },
      };

    // TELECALLER
    case "TELECALLER":
      return {
        assignedToId: user.userId,
      };

    default:
      throw new ApiError(
        403,
        "Invalid user role"
      );
  }
};

// ========================================
// TODAY DATE RANGE
// ========================================

const getTodayRange = () => {
  const start = new Date();

  start.setHours(0, 0, 0, 0);

  const end = new Date();

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

// ========================================
// CURRENT MONTH
// ========================================

const getCurrentPeriod = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
};

// ========================================
// TARGET ACHIEVEMENT
// ========================================

const getDashboardTargetAchievement =
  async ({ user, period }) => {
    // --------------------------------
    // Get targets visible to user
    // --------------------------------

    const targets =
      await targetService.getTargets({
        user,
        period,
      });

    // No target
    if (!targets.length) {
      return {
        available: false,

        targetLeads: 0,

        achievedLeads: 0,

        achievementPercentage: 0,
      };
    }

    // --------------------------------
    // For dashboard we aggregate
    // visible targets
    // --------------------------------

    let targetLeads = 0;

    let achievedLeads = 0;

    // --------------------------------
    // Calculate achievement
    // for every target
    // --------------------------------

    for (const target of targets) {
      const achievement =
        await targetService.getTargetAchievement({
          targetId: target.id,
          user,
        });

      targetLeads += Number(
        achievement.target.targetLeads || 0
      );

      achievedLeads += Number(
        achievement.achievement.achievedLeads || 0
      );
    }

    const achievementPercentage =
      targetLeads > 0
        ? Number(
            (
              (achievedLeads /
                targetLeads) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      available: true,

      targetLeads,

      achievedLeads,

      achievementPercentage,
    };
  };

// ========================================
// TELECALLER PERFORMANCE
// ========================================

const getDashboardTelecallerPerformance =
  async ({ user, period }) => {
    const result =
      await reportService.getDetailedTelecallerPerformance({
        user,
        period,
      });

    return result;
  };

// ========================================
// GET DASHBOARD
// ========================================

const getDashboard = async ({ user }) => {
  // --------------------------------
  // Lead Scope
  // --------------------------------

  const leadScope =
    getDashboardScope(user);

  // --------------------------------
  // Today
  // --------------------------------

  const { start, end } =
    getTodayRange();

  // --------------------------------
  // Current Month
  // --------------------------------

  const currentPeriod =
    getCurrentPeriod();

  // ========================================
  // LEAD COUNTS
  // ========================================

  const [
    totalLeads,
    newLeads,
    interestedLeads,
    documentsPending,
    loginLeads,
    approvedLeads,
    disbursedLeads,
    rejectedLeads,
  ] = await Promise.all([
    // Total
    prisma.lead.count({
      where: leadScope,
    }),

    // NEW
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "NEW",
      },
    }),

    // INTERESTED
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "INTERESTED",
      },
    }),

    // DOCUMENTS PENDING
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "DOCUMENTS_PENDING",
      },
    }),

    // LOGIN
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "LOGIN",
      },
    }),

    // APPROVED
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "APPROVED",
      },
    }),

    // DISBURSED
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "DISBURSED",
      },
    }),

    // REJECTED
    prisma.lead.count({
      where: {
        ...leadScope,
        status: "REJECTED",
      },
    }),
  ]);

  // ========================================
  // CONVERSION
  // ========================================

  const conversionRate =
    totalLeads > 0
      ? Number(
          (
            (disbursedLeads /
              totalLeads) *
            100
          ).toFixed(2)
        )
      : 0;

  // ========================================
  // FOLLOW-UP SUMMARY
  // ========================================

  const followUpSummary =
    await followUpService.getFollowUpSummary({
      user,
    });

  // ========================================
  // CALLS TODAY
  // ========================================

  const callsToday =
    await prisma.callLog.count({
      where: {
        calledAt: {
          gte: start,
          lte: end,
        },

        ...(user.role === "TELECALLER"
          ? {
              telecallerId:
                user.userId,
            }
          : {}),
      },
    });

  // ========================================
  // TARGET ACHIEVEMENT
  // ========================================

  const targetAchievement =
    await getDashboardTargetAchievement({
      user,
      period: currentPeriod,
    });

  // ========================================
  // TELECALLER PERFORMANCE
  // ========================================

  const telecallerPerformance =
    await getDashboardTelecallerPerformance({
      user,
      period: currentPeriod,
    });

  // ========================================
  // FINAL RESPONSE
  // ========================================

  return {
    role: user.role,

    // ========================================
    // LEADS
    // ========================================

    leads: {
      total: totalLeads,

      new: newLeads,

      interested: interestedLeads,

      documentsPending,

      login: loginLeads,

      approved: approvedLeads,

      disbursed: disbursedLeads,

      rejected: rejectedLeads,
    },

    // ========================================
    // FOLLOW UPS
    // ========================================

    followUps: {
      pendingCount:
        followUpSummary.pendingCount,

      overdueCount:
        followUpSummary.overdueCount,

      dueTodayCount:
        followUpSummary.dueTodayCount,
    },

    // ========================================
    // CALLS
    // ========================================

    calls: {
      today: callsToday,
    },

    // ========================================
    // CONVERSION
    // ========================================

    conversion: {
      rate: conversionRate,
    },

    // ========================================
    // TARGET
    // ========================================

    target: {
      period: currentPeriod,

      available:
        targetAchievement.available,

      targetLeads:
        targetAchievement.targetLeads,

      achievedLeads:
        targetAchievement.achievedLeads,

      achievementPercentage:
        targetAchievement.achievementPercentage,
    },

    // ========================================
    // TELECALLER PERFORMANCE
    // ========================================

    performance:
      telecallerPerformance,
  };
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getDashboard,
};

