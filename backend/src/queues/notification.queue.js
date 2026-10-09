const {
  Queue,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

// ========================================
// NOTIFICATION QUEUE
// ========================================

const notificationQueue =
  new Queue(
    "notifications",
    {
      connection:
        redisConnection,

      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 3000,
        },

        removeOnComplete: {
          age: 3600,
          count: 1000,
        },

        removeOnFail: {
          age: 86400,
          count: 5000,
        },
      },
    }
  );

// ========================================
// EXPORT
// ========================================

module.exports = {
  notificationQueue,
};