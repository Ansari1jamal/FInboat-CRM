const cron = require("node-cron");

const { prisma } = require("../../config/db");

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

  const [hours, minutes] = String(followUpTime)
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

  date.setHours(hours, minutes, 0, 0);

  return date;
};

const startFollowUpReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const pendingFollowUps =
        await prisma.followUp.findMany({
          where: {
            status: "PENDING",
          },

          include: {
            lead: {
              select: {
                id: true,
                customerName: true,
                mobile: true,
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    tlId: true,
                    managerId: true,
                  },
                },
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

          take: 100,
        });

      for (const followUp of pendingFollowUps) {
        const scheduledAt = getFollowUpDateTime(
          followUp.followUpDate,
          followUp.followUpTime
        );

        // Invalid date/time
        if (!scheduledAt) {
          continue;
        }

        // Follow-up is not overdue yet
        if (scheduledAt >= now) {
          continue;
        }

        const assignedTelecaller =
          followUp.lead.assignedTo;

        console.log(
          "===================================="
        );

        console.log(
          "OVERDUE FOLLOW-UP"
        );

        console.log(
          "Follow-up ID:",
          followUp.id
        );

        console.log(
          "Customer:",
          followUp.lead.customerName
        );

        console.log(
          "Mobile:",
          followUp.lead.mobile
        );

        console.log(
          "Scheduled At:",
          scheduledAt
        );

        console.log(
          "Assigned Telecaller:",
          assignedTelecaller?.name
        );

        console.log(
          "TL ID:",
          assignedTelecaller?.tlId
        );

        console.log(
          "Manager ID:",
          assignedTelecaller?.managerId
        );

        console.log(
          "===================================="
        );
      }
    } catch (error) {
      console.error(
        "Follow-up reminder error:",
        error
      );
    }
  });

  console.log(
    "Follow-up reminder job started"
  );
};

module.exports = {
  startFollowUpReminderJob,
};