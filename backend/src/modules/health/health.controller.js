const {
  prisma,
} = require("../../config/db");

const {
  redisConnection,
} = require("../../config/redis");

const {
  getQueueHealth,
} = require("./queue.health");

const logger =
  require("../../utils/logger");

const logHealthFailure = (message, error) => {
  const details = {
    errorName: error?.name,
    errorCode: error?.code,
  };

  if (process.env.NODE_ENV !== "production") {
    details.errorMessage = error?.message;
    details.stack = error?.stack;
  }

  logger.error(message, details);
};

// ========================================
// LIVENESS CHECK
// ========================================

const liveness = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,

    status: "ok",

    data: {
      service:
        "finboat-crm-api",

      uptime:
        process.uptime(),

      timestamp:
        new Date().toISOString(),
    },
  });
};

const basicHealth = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,
    message: "FinBoat CRM API is running",
  });
};

// ========================================
// DATABASE HEALTH
// ========================================

const checkDatabase =
  async () => {
    try {
      await prisma.$queryRaw`
        SELECT 1
      `;

      return {
        status: "up",
      };
    } catch (error) {
      logHealthFailure("Database health check failed", error);

      return {
        status: "down",
      };
    }
  };

// ========================================
// REDIS HEALTH
// ========================================

const checkRedis =
  async () => {
    try {
      await redisConnection.ping();

      return {
        status: "up",
      };
    } catch (error) {
      logHealthFailure("Redis health check failed", error);

      return {
        status: "down",
      };
    }
  };

// ========================================
// READINESS CHECK
// ========================================

const readiness = async (
  req,
  res
) => {
  const [
    database,
    redis,
  ] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  let queues = null;

  if (
    redis.status ===
    "up"
  ) {
    try {
      queues =
        await getQueueHealth();
    } catch (error) {
      logHealthFailure("Queue health check failed", error);
    }
  }

  const isReady =
    database.status === "up" &&
    redis.status === "up";

  return res
    .status(
      isReady
        ? 200
        : 503
    )
    .json({
      success:
        isReady,

      status:
        isReady
          ? "ready"
          : "not_ready",

      data: {
        service:
          "finboat-crm-api",

        database,

        redis,

        queues,

        timestamp:
          new Date().toISOString(),
      },
    });
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  basicHealth,
  liveness,
  readiness,
};