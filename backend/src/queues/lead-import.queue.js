const {
  Queue,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

const leadImportQueue =
  new Queue(
    "lead-import",
    {
      connection:
        redisConnection,

      defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 5000,
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

module.exports = {
  leadImportQueue,
};