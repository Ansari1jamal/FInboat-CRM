const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const {
  FOLLOW_UP_STATUS,
} = require("./followup.status");


/*
|--------------------------------------------------------------------------
| Date / Time Helper
|--------------------------------------------------------------------------
| Example:
|
| followUpDate = 2026-09-04
| followUpTime = 11:00
|
| Result:
| 2026-09-04 11:00:00
|--------------------------------------------------------------------------
*/

const getFollowUpDateTime = (
  followUpDate,
  followUpTime
) => {
  if (!followUpDate || !followUpTime) {
    return null;
  }

  const date = new Date(followUpDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const [hours, minutes] = String(
    followUpTime
  )
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date;
};


/*
|--------------------------------------------------------------------------
| Overdue Duration Helper
|--------------------------------------------------------------------------
*/

const getOverdueDuration = (
  scheduledAt
) => {
  const now = new Date();

  const difference =
    now.getTime() -
    scheduledAt.getTime();

  const totalMinutes = Math.max(
    0,
    Math.floor(
      difference / (1000 * 60)
    )
  );

  const days = Math.floor(
    totalMinutes / (60 * 24)
  );

  const hours = Math.floor(
    (totalMinutes % (60 * 24)) / 60
  );

  const minutes =
    totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
    totalMinutes,
  };
};


/*
|--------------------------------------------------------------------------
| Create Follow-up
|--------------------------------------------------------------------------
*/

const createFollowUp = async ({
  leadId,
  followUpDate,
  followUpTime,
  notes,
  user,
}) => {

  // --------------------------------
  // 1. Find Lead
  // --------------------------------

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

  if (!lead) {
    throw new ApiError(
      404,
      "Lead not found"
    );
  }


  // --------------------------------
  // 2. Telecaller Scope
  // --------------------------------

  if (user.role === "TELECALLER") {

    if (
      lead.assignedToId !==
      user.userId
    ) {
      throw new ApiError(
        403,
        "You can only create follow-ups for your assigned leads"
      );
    }
  }


  // --------------------------------
  // 3. Validate Date
  // --------------------------------

  const date = new Date(
    followUpDate
  );

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(
      400,
      "Invalid follow-up date"
    );
  }


  // --------------------------------
  // 4. Validate Time
  // --------------------------------

  if (followUpTime) {

    const timePattern =
      /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(followUpTime)) {
      throw new ApiError(
        400,
        "Invalid follow-up time. Use HH:mm"
      );
    }
  }


  // --------------------------------
  // 5. Create Follow-up
  // --------------------------------

  const followUp =
    await prisma.followUp.create({
      data: {

        lead: {
          connect: {
            id: leadId,
          },
        },

        scheduledUser: {
          connect: {
            id: user.userId,
          },
        },

        followUpDate: date,

        followUpTime:
          followUpTime || null,

        status:
          FOLLOW_UP_STATUS.PENDING,

        notes:
          notes || null,
      },

      include: {
        lead: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            loanType: true,
            status: true,
          },
        },

        scheduledUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

  return followUp;
};


/*
|--------------------------------------------------------------------------
| Update / Complete Follow-up
|--------------------------------------------------------------------------
*/

const updateFollowUp = async ({
  followUpId,
  status,
  notes,
  user,
}) => {

  // --------------------------------
  // 1. Validate Status
  // --------------------------------

  if (
    !Object.values(
      FOLLOW_UP_STATUS
    ).includes(status)
  ) {
    throw new ApiError(
      400,
      "Invalid follow-up status"
    );
  }


  // --------------------------------
  // 2. Find Follow-up
  // --------------------------------

  const followUp =
    await prisma.followUp.findUnique({
      where: {
        id: followUpId,
      },

      include: {
        lead: true,
      },
    });

  if (!followUp) {
    throw new ApiError(
      404,
      "Follow-up not found"
    );
  }


  // --------------------------------
  // 3. Telecaller Scope
  // --------------------------------

  if (user.role === "TELECALLER") {

    if (
      followUp.lead.assignedToId !==
      user.userId
    ) {
      throw new ApiError(
        403,
        "You cannot update this follow-up"
      );
    }
  }


  // --------------------------------
  // 4. Update Follow-up
  // --------------------------------

  return prisma.followUp.update({
    where: {
      id: followUpId,
    },

    data: {
      status,

      notes:
        notes !== undefined
          ? notes
          : followUp.notes,
    },
  });
};


/*
|--------------------------------------------------------------------------
| 16.5 Get Pending Follow-ups
|--------------------------------------------------------------------------
*/

const getPendingFollowUps = async ({
  user,
}) => {

  const where = {
    status:
      FOLLOW_UP_STATUS.PENDING,
  };


  // --------------------------------
  // TELECALLER
  // --------------------------------

  if (user.role === "TELECALLER") {

    where.lead = {
      assignedToId:
        user.userId,
    };
  }


  // --------------------------------
  // TL
  // --------------------------------

  if (user.role === "TL") {

    where.lead = {
      assignedTo: {
        tlId: user.userId,
      },
    };
  }


  // --------------------------------
  // MANAGER
  // --------------------------------

  if (user.role === "MANAGER") {

    where.lead = {
      assignedTo: {
        managerId:
          user.userId,
      },
    };
  }


  // --------------------------------
  // ADMIN
  // --------------------------------
  // Admin ke liye koi additional
  // filter nahi lagega.


  // --------------------------------
  // Fetch Follow-ups
  // --------------------------------

  const followUps =
    await prisma.followUp.findMany({
      where,

      include: {

        lead: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            loanType: true,
            status: true,

            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        /*
         * IMPORTANT:
         *
         * Prisma schema mein relation
         * `scheduledUser` hai.
         *
         * `scheduledBy` scalar field hai.
         */

        scheduledUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },

      orderBy: [
        {
          followUpDate:
            "asc",
        },
        {
          createdAt:
            "asc",
        },
      ],
    });

  return followUps;
};


/*
|--------------------------------------------------------------------------
| 16.6 Get Overdue Follow-ups
|--------------------------------------------------------------------------
*/

const getOverdueFollowUps = async ({
  user,
}) => {

  const pendingFollowUps =
    await getPendingFollowUps({
      user,
    });

  const now = new Date();


  const overdueFollowUps =
    pendingFollowUps
      .map((followUp) => {

        const scheduledAt =
          getFollowUpDateTime(
            followUp.followUpDate,
            followUp.followUpTime
          );

        if (
          !scheduledAt ||
          scheduledAt >= now
        ) {
          return null;
        }


        return {
          ...followUp,

          overdue: true,

          scheduledAt,

          overdueDuration:
            getOverdueDuration(
              scheduledAt
            ),
        };
      })
      .filter(Boolean);

  return overdueFollowUps;
};


/*
|--------------------------------------------------------------------------
| 16.8 Overdue Days / Hours
|--------------------------------------------------------------------------
|
| Example:
|
| scheduledAt:
| 2026-09-03 10:00
|
| now:
| 2026-09-04 14:20
|
| Result:
|
| days: 1
| hours: 4
| minutes: 20
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| 16.9 Follow-up Summary
|--------------------------------------------------------------------------
*/

const getFollowUpSummary = async ({
  user,
}) => {

  const pending =
    await getPendingFollowUps({
      user,
    });

  const now = new Date();


  // --------------------------------
  // Start of Today
  // --------------------------------

  const startOfToday =
    new Date();

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );


  // --------------------------------
  // End of Today
  // --------------------------------

  const endOfToday =
    new Date(
      startOfToday
    );

  endOfToday.setDate(
    endOfToday.getDate() + 1
  );


  let overdueCount = 0;
  let dueTodayCount = 0;


  // --------------------------------
  // Calculate
  // --------------------------------

  pending.forEach(
    (followUp) => {

      const scheduledAt =
        getFollowUpDateTime(
          followUp.followUpDate,
          followUp.followUpTime
        );

      if (!scheduledAt) {
        return;
      }


      // Overdue
      if (scheduledAt < now) {
        overdueCount++;
      }


      // Due Today
      if (
        scheduledAt >=
          startOfToday &&
        scheduledAt <
          endOfToday
      ) {
        dueTodayCount++;
      }
    }
  );


  // --------------------------------
  // Return Summary
  // --------------------------------

  return {
    pendingCount:
      pending.length,

    overdueCount,

    dueTodayCount,
  };
};


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  createFollowUp,
  updateFollowUp,

  getPendingFollowUps,
  getOverdueFollowUps,
  getFollowUpSummary,

  getFollowUpDateTime,
  getOverdueDuration,
};