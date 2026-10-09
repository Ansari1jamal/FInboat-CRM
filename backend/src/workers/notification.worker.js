const {
  Worker,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

const {
  createNotificationOnce,
} = require(
  "../modules/notifications/notification.service"
);

// ========================================
// NOTIFICATION WORKER
// ========================================

const notificationWorker =
  new Worker(
    "notifications",

    async (job) => {
      console.log(
        `Processing notification job: ${job.id}`
      );

      // ======================================
      // CREATE NOTIFICATION
      // ======================================

      const result =
        await createNotificationOnce(
          job.data
        );

      return {
        success: true,

        jobId:
          job.id,

        result,
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

notificationWorker.on(
  "completed",
  (job) => {
    console.log(
      `Notification job completed: ${job.id}`
    );
  }
);

// ========================================
// FAILED
// ========================================

notificationWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Notification job failed: ${job?.id}`,
      error
    );
  }
);

// ========================================
// ERROR
// ========================================

notificationWorker.on(
  "error",
  (error) => {
    console.error(
      "Notification worker error:",
      error
    );
  }
);

// ========================================
// EXPORT
// ========================================

module.exports = {
  notificationWorker,
};