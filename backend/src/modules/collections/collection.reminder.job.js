
const cron = require("node-cron");

const { prisma } = require("../../config/db");

const {
  createNotificationOnce,
} = require("../notifications/notification.service");

// ======================================================
// Due Soon Reminder
// EMI due tomorrow
// ======================================================

const sendEmiDueSoonNotifications = async () => {
  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const start = new Date(tomorrow);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tomorrow);
  end.setHours(23, 59, 59, 999);

  const emis = await prisma.emiSchedule.findMany({
    where: {
      dueDate: {
        gte: start,
        lte: end,
      },

      status: {
        in: ["PENDING", "PARTIAL"],
      },
    },

    include: {
      loanAccount: {
        include: {
          lead: {
            include: {
              assignedTo: true,
            },
          },
        },
      },
    },
  });

  for (const emi of emis) {
    const assignedUser =
      emi.loanAccount?.lead?.assignedTo;

    if (!assignedUser) {
      continue;
    }

    await createNotificationOnce({
      userId: assignedUser.id,

      type: "EMI_DUE_SOON",

      title: "EMI Due Tomorrow",

      message:
        `EMI #${emi.emiNumber} of ` +
        `${emi.emiAmount} is due tomorrow. ` +
        `Outstanding: ${emi.outstandingAmount}`,

      leadId: emi.loanAccount.leadId,
    });
  }

  return emis.length;
};

// ======================================================
// EMI Due Today
// ======================================================

const sendEmiDueTodayNotifications = async () => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const emis = await prisma.emiSchedule.findMany({
    where: {
      dueDate: {
        gte: start,
        lte: end,
      },

      status: {
        in: ["PENDING", "PARTIAL"],
      },
    },

    include: {
      loanAccount: {
        include: {
          lead: {
            include: {
              assignedTo: true,
            },
          },
        },
      },
    },
  });

  for (const emi of emis) {
    const assignedUser =
      emi.loanAccount?.lead?.assignedTo;

    if (!assignedUser) {
      continue;
    }

    await createNotificationOnce({
      userId: assignedUser.id,

      type: "EMI_DUE_TODAY",

      title: "EMI Due Today",

      message:
        `EMI #${emi.emiNumber} is due today. ` +
        `Outstanding: ${emi.outstandingAmount}`,

      leadId: emi.loanAccount.leadId,
    });
  }

  return emis.length;
};

// ======================================================
// Overdue Notification
// ======================================================

const sendOverdueNotifications = async () => {
  const emis = await prisma.emiSchedule.findMany({
    where: {
      status: "OVERDUE",
    },

    include: {
      loanAccount: {
        include: {
          lead: {
            include: {
              assignedTo: true,
            },
          },
        },
      },
    },
  });

  for (const emi of emis) {
    const assignedUser =
      emi.loanAccount?.lead?.assignedTo;

    if (!assignedUser) {
      continue;
    }

    await createNotificationOnce({
      userId: assignedUser.id,

      type: "EMI_OVERDUE",

      title: "EMI Overdue",

      message:
        `EMI #${emi.emiNumber} is overdue. ` +
        `Outstanding: ${emi.outstandingAmount}`,

      leadId: emi.loanAccount.leadId,
    });
  }

  return emis.length;
};

// ======================================================
// Cron Job
// Runs every hour
// ======================================================

const startCollectionReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        "Collection reminder job started..."
      );

      const dueSoonCount =
        await sendEmiDueSoonNotifications();

      const dueTodayCount =
        await sendEmiDueTodayNotifications();

      const overdueCount =
        await sendOverdueNotifications();

      console.log(
        "Collection reminder job completed",
        {
          dueSoon: dueSoonCount,
          dueToday: dueTodayCount,
          overdue: overdueCount,
        }
      );
    } catch (error) {
      console.error(
        "Collection reminder job error:",
        error
      );
    }
  });

  console.log(
    "Collection reminder cron job started"
  );
};

module.exports = {
  startCollectionReminderJob,
  sendEmiDueSoonNotifications,
  sendEmiDueTodayNotifications,
  sendOverdueNotifications,
};