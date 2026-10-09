const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

/*
|--------------------------------------------------------------------------
| Helper — Get Month Start
|--------------------------------------------------------------------------
| Input:
|   "2026-09"
|
| Store:
|   2026-09-01T00:00:00
|--------------------------------------------------------------------------
*/

const getMonthStart = (period) => {
  if (!period) {
    throw new ApiError(
      400,
      "Period is required"
    );
  }

  const date = new Date(`${period}-01`);

   // YYYY-MM format
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    throw new ApiError(
      400,
      "Invalid period. Use YYYY-MM"
    );
  }

  return period;
};

/*
|--------------------------------------------------------------------------
| 14.7 Create Target
|--------------------------------------------------------------------------
*/
const createTarget = async ({
  userId,
  teamId,
  period,
  targetLeads,
  targetDisbursement,
  user,
}) => {
  // --------------------------------
  // 1. Admin / Manager permission
  // --------------------------------

  if (!["ADMIN", "MANAGER"].includes(user.role)) {
    throw new ApiError(
      403,
      "You are not allowed to create targets"
    );
  }

  // --------------------------------
  // 2. User OR Team
  // --------------------------------

  if (!userId && !teamId) {
    throw new ApiError(
      400,
      "Either userId or teamId is required"
    );
  }

  if (userId && teamId) {
    throw new ApiError(
      400,
      "Target can belong to either user or team, not both"
    );
  }

  // --------------------------------
  // 3. Validate numbers
  // --------------------------------

  if (
    targetLeads === undefined ||
    Number(targetLeads) < 0
  ) {
    throw new ApiError(
      400,
      "Invalid targetLeads"
    );
  }

  if (
    targetDisbursement === undefined ||
    Number(targetDisbursement) < 0
  ) {
    throw new ApiError(
      400,
      "Invalid targetDisbursement"
    );
  }

  const monthStart = getMonthStart(period);

  // --------------------------------
  // 4. Check target user
  // --------------------------------

  if (userId) {
    const targetUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!targetUser) {
      throw new ApiError(
        404,
        "Target user not found"
      );
    }

    if (targetUser.role !== "TELECALLER") {
      throw new ApiError(
        400,
        "Targets can only be assigned to telecallers"
      );
    }

    if (
      user.role === "MANAGER" &&
      targetUser.managerId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You can only set targets for your telecallers"
      );
    }
  }

  // --------------------------------
  // 5. Check target team
  // --------------------------------

  if (teamId) {
    const team =
      await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });

    if (!team) {
      throw new ApiError(
        404,
        "Target team not found"
      );
    }

    if (
      user.role === "MANAGER" &&
      team.managerId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You can only set targets for your teams"
      );
    }
  }

  // --------------------------------
  // 6. Prevent duplicate target
  // --------------------------------

  const existingTarget =
    await prisma.target.findFirst({
      where: {
        period: monthStart,

        ...(userId
          ? { userId }
          : { teamId }),
      },
    });

  if (existingTarget) {
    throw new ApiError(
      409,
      "Target already exists for this period"
    );
  }

  // --------------------------------
  // 7. Create
  // --------------------------------

  const target =
    await prisma.target.create({
      data: {
        userId: userId || null,
        teamId: teamId || null,

        period: monthStart,

        targetLeads: Number(targetLeads),

        targetDisbursement:
          Number(targetDisbursement),
      },
    });

  return target;
};

/*
|--------------------------------------------------------------------------
| 14.8 Get Targets
|--------------------------------------------------------------------------
*/

const getTargets = async ({
  user,
  period,
}) => {
  const where = {};

  if (period) {
    where.period = getMonthStart(period);
  }

  // --------------------------------
  // Manager scope
  // --------------------------------

  if (user.role === "MANAGER") {
    where.OR = [
      {
        user: {
          managerId: user.userId,
        },
      },
      {
        team: {
          managerId: user.userId,
        },
      },
    ];
  }

  // --------------------------------
  // TL scope
  // --------------------------------

  if (user.role === "TL") {
    where.OR = [
      {
        user: {
          tlId: user.userId,
        },
      },
      {
        team: {
          tlId: user.userId,
        },
      },
    ];
  }

  // --------------------------------
  // Telecaller
  // --------------------------------

  if (user.role === "TELECALLER") {
    where.userId = user.userId;
  }

  const targets =
    await prisma.target.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        period: "desc",
      },
    });

  return targets;
};

/*
|--------------------------------------------------------------------------
| 14.9 Update Target
|--------------------------------------------------------------------------
*/

const updateTarget = async ({
  targetId,
  targetLeads,
  targetDisbursement,
  user,
}) => {
  if (!["ADMIN", "MANAGER"].includes(user.role)) {
    throw new ApiError(
      403,
      "You are not allowed to update targets"
    );
  }

  const target =
    await prisma.target.findUnique({
      where: {
        id: targetId,
      },

      include: {
        user: true,
        team: true,
      },
    });

  if (!target) {
    throw new ApiError(
      404,
      "Target not found"
    );
  }

  if (
    user.role === "MANAGER"
  ) {
    const belongsToManager =
      target.user?.managerId === user.userId ||
      target.team?.managerId === user.userId;

    if (!belongsToManager) {
      throw new ApiError(
        403,
        "You can only update your team's targets"
      );
    }
  }

  const updatedTarget =
    await prisma.target.update({
      where: {
        id: targetId,
      },

      data: {
        ...(targetLeads !== undefined && {
          targetLeads: Number(targetLeads),
        }),

        ...(targetDisbursement !== undefined && {
          targetDisbursement:
            Number(targetDisbursement),
        }),
      },
    });

  return updatedTarget;
};

/*
|--------------------------------------------------------------------------
| 14.10 Delete Target
|--------------------------------------------------------------------------
*/

const deleteTarget = async ({
  targetId,
  user,
}) => {
    // --------------------------------
  // 1. Permission
  // --------------------------------

  if (!["ADMIN", "MANAGER"].includes(user.role)) {
    throw new ApiError(
      403,
      "You are not allowed to delete targets"
    );
  }

    // --------------------------------
  // 2. Find target
  // --------------------------------
  const target =
    await prisma.target.findUnique({
      where: {
        id: targetId,
      },

      include: {
        user: true,
        team: true,
      },
    });

  if (!target) {
    throw new ApiError(
      404,
      "Target not found"
    );
  }

  // --------------------------------
  // 3. Manager scope
  // --------------------------------
  if (user.role === "MANAGER") {
    const belongsToManager =
      target.user?.managerId === user.userId ||
      target.team?.managerId === user.userId;

    if (!belongsToManager) {
      throw new ApiError(
        403,
        "You can only delete your team's targets"
      );
    }
  }
 // --------------------------------
  // 4. Delete
  // --------------------------------
  await prisma.target.delete({
    where: {
      id: targetId,
    },
  });
};

/*
|--------------------------------------------------------------------------
| 14.11 Target vs Achievement
|--------------------------------------------------------------------------
*/

const getTargetAchievement = async ({
  targetId,
  user,
}) => {

  // --------------------------------
  // 1. Find target
  // --------------------------------

  const target =
    await prisma.target.findUnique({
      where: {
        id: targetId,
      },

      include: {
        user: true,
        team: true,
      },
    });

  if (!target) {
    throw new ApiError(
      404,
      "Target not found"
    );
  }


  // --------------------------------
  // 2. Access check
  // --------------------------------

  if (user.role === "MANAGER") {

    const allowed =
      target.user?.managerId === user.userId ||
      target.team?.managerId === user.userId;

    if (!allowed) {
      throw new ApiError(
        403,
        "You are not allowed to view this target"
      );
    }
  }


  if (user.role === "TL") {

    const allowed =
      target.user?.tlId === user.userId ||
      target.team?.tlId === user.userId;

    if (!allowed) {
      throw new ApiError(
        403,
        "You are not allowed to view this target"
      );
    }
  }


  if (
    user.role === "TELECALLER" &&
    target.userId !== user.userId
  ) {
    throw new ApiError(
      403,
      "You are not allowed to view this target"
    );
  }


  // --------------------------------
  // 3. Month range
  // --------------------------------

  const startDate = new Date(target.period);

  const endDate = new Date(startDate);

  endDate.setMonth(
    endDate.getMonth() + 1
  );


  // --------------------------------
  // 4. Lead filter
  // --------------------------------

  const leadWhere = {
    createdAt: {
      gte: startDate,
      lt: endDate,
    },
  };


  // --------------------------------
  // Target belongs to user
  // --------------------------------

  if (target.userId) {
    leadWhere.assignedToId =
      target.userId;
  }


  // --------------------------------
  // Target belongs to team
  // --------------------------------

  if (target.teamId) {
    leadWhere.assignedTeamId =
      target.teamId;
  }


  // --------------------------------
  // 5. Achievements
  // --------------------------------

  const [
    achievedLeads,
    achievedDisbursement,
  ] = await Promise.all([

    // Total leads created in target month
    prisma.lead.count({
      where: leadWhere,
    }),

    // Disbursed leads in target month
    prisma.lead.count({
      where: {
        ...leadWhere,
        status: "DISBURSED",
      },
    }),
  ]);


  // --------------------------------
  // 6. Percentages
  // --------------------------------

  const leadAchievementPercentage =
    target.targetLeads > 0
      ? Number(
          (
            (achievedLeads /
              target.targetLeads) *
            100
          ).toFixed(2)
        )
      : 0;


  /*
   * IMPORTANT:
   *
   * achievedDisbursement abhi actual
   * rupee amount nahi hai.
   *
   * Current Lead model mein actual
   * disbursement amount ka field nahi hai.
   *
   * Isliye abhi ye DISBURSED leads
   * ki count represent kar raha hai.
   *
   * Actual ₹ achievement hum later
   * Disbursement module ke through
   * calculate karenge.
   */

  const disbursementAchievementPercentage =
    target.targetDisbursement > 0
      ? Number(
          (
            (achievedDisbursement /
              Number(target.targetDisbursement)) *
            100
          ).toFixed(2)
        )
      : 0;


  // --------------------------------
  // 7. Return
  // --------------------------------

  return {
    target: {
      id: target.id,
      period: target.period,

      targetLeads:
        target.targetLeads,

      targetDisbursement:
        target.targetDisbursement,
    },

    achievement: {
      achievedLeads,
      achievedDisbursement,
    },

    percentage: {
      leadAchievement:
        leadAchievementPercentage,

      disbursementAchievement:
        disbursementAchievementPercentage,
    },
  };
};


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  getMonthStart,
  createTarget,
  getTargets,
  updateTarget,
  deleteTarget,
  getTargetAchievement,
};