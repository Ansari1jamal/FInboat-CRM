const {
  Worker,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

// ========================================
// REMINDER WORKER
// ========================================

const reminderWorker =
  new Worker(
    "reminders",

    async (job) => {
      console.log(
        `Processing reminder job: ${job.id}`
      );

      switch (job.name) {
        // ==================================
        // EMI DUE
        // ==================================

        case "emi-due":
          console.log(
            "Processing EMI due reminder",
            job.data
          );

          // TODO:
          // Notification queue mein job add karenge
          break;

        // ==================================
        // EMI OVERDUE
        // ==================================

        case "emi-overdue":
          console.log(
            "Processing EMI overdue reminder",
            job.data
          );

          // TODO:
          // Notification queue mein job add karenge
          break;

        // ==================================
        // FOLLOW-UP DUE
        // ==================================

        case "followup-due":
          console.log(
            "Processing follow-up due reminder",
            job.data
          );

          // TODO:
          // Notification queue mein job add karenge
          break;

        // ==================================
        // UNKNOWN JOB
        // ==================================

        default:
          throw new Error(
            `Unknown reminder job: ${job.name}`
          );
      }

      return {
        success: true,
        jobId: job.id,
        type: job.name,
      };
    },

    {
      connection:
        redisConnection,

      concurrency: 5,
    }
  );

// ========================================
// COMPLETED
// ========================================

reminderWorker.on(
  "completed",
  (job) => {
    console.log(
      `Reminder job completed: ${job.id}`
    );
  }
);

// ========================================
// FAILED
// ========================================

reminderWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Reminder job failed: ${job?.id}`,
      error
    );
  }
);

// ========================================
// ERROR
// ========================================

reminderWorker.on(
  "error",
  (error) => {
    console.error(
      "Reminder worker error:",
      error
    );
  }
);

// ========================================
// EXPORT
// ========================================

module.exports = {
  reminderWorker,
};