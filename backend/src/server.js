require("dotenv").config();

const app = require("./app");

const env =
  require("./config/env");

const {
  connectDB,
  prisma,
} = require("./config/db");

const logger =
  require("./utils/logger");

const getErrorLogContext = (error) => {
  const context = {
    errorName: error?.name,
    errorCode: error?.code,
  };

  if (process.env.NODE_ENV !== "production") {
    context.errorMessage =
      error instanceof Error
        ? error.message
        : String(error);
    context.stack =
      error instanceof Error
        ? error.stack
        : undefined;
  }

  return context;
};

// ========================================
// SERVER
// ========================================

let server;

// ========================================
// SHUTDOWN STATE
// ========================================

let isShuttingDown = false;

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {
    // ======================================
    // DATABASE CONNECTION
    // ======================================

    logger.info(
      "Connecting to database..."
    );

    await connectDB();

    logger.info(
      "Database connected successfully"
    );

    // ======================================
    // START HTTP SERVER
    // ======================================

    server = app.listen(
      env.PORT,
      () => {
        logger.info(
          "FinBoat CRM server started",
          {
            port: env.PORT,

            environment:
              process.env.NODE_ENV ||
              "development",

            url:
              `http://localhost:${env.PORT}`,
          }
        );
      }
    );

    // ======================================
    // SERVER ERROR
    // ======================================

    server.on(
      "error",
      (error) => {
        logger.error(
          "HTTP server error",
          getErrorLogContext(error)
        );

        process.exit(1);
      }
    );
  } catch (error) {
    logger.error(
      "Server startup failed",
      getErrorLogContext(error)
    );

    process.exit(1);
  }
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = async (
  signal
) => {
  // ======================================
  // PREVENT DOUBLE SHUTDOWN
  // ======================================

  if (isShuttingDown) {
    logger.warn(
      "Shutdown already in progress",
      {
        signal,
      }
    );

    return;
  }

  isShuttingDown = true;

  logger.info(
    "Graceful shutdown started",
    {
      signal,
    }
  );

  // ======================================
  // STOP ACCEPTING NEW REQUESTS
  // ======================================

  if (server) {
    server.close(
      async (error) => {
        if (error) {
          logger.error(
            "Error while closing HTTP server",
            getErrorLogContext(error)
          );
        } else {
          logger.info(
            "HTTP server closed successfully"
          );
        }

        // ==================================
        // DISCONNECT DATABASE
        // ==================================

        try {
          await prisma.$disconnect();

          logger.info(
            "Database connection closed"
          );
        } catch (dbError) {
          logger.error(
            "Database disconnect failed",
            getErrorLogContext(dbError)
          );
        }

        // ==================================
        // EXIT PROCESS
        // ==================================

        process.exit(
          error ? 1 : 0
        );
      }
    );

    return;
  }

  // ======================================
  // SERVER WAS NOT STARTED
  // ======================================

  try {
    await prisma.$disconnect();

    logger.info(
      "Database connection closed"
    );
  } catch (dbError) {
    logger.error(
      "Database disconnect failed",
      getErrorLogContext(dbError)
    );
  }

  process.exit(0);
};

// ========================================
// SIGTERM
// ========================================

process.on(
  "SIGTERM",
  () => {
    gracefulShutdown(
      "SIGTERM"
    );
  }
);

// ========================================
// SIGINT
// ========================================

process.on(
  "SIGINT",
  () => {
    gracefulShutdown(
      "SIGINT"
    );
  }
);

// ========================================
// UNCAUGHT EXCEPTION
// ========================================

process.on(
  "uncaughtException",
  async (error) => {
    logger.error(
      "Uncaught exception",
      getErrorLogContext(error)
    );

    await gracefulShutdown(
      "uncaughtException"
    );
  }
);

// ========================================
// UNHANDLED PROMISE REJECTION
// ========================================

process.on(
  "unhandledRejection",
  async (reason) => {
    logger.error(
      "Unhandled promise rejection",
      getErrorLogContext(reason)
    );

    await gracefulShutdown(
      "unhandledRejection"
    );
  }
);

// ========================================
// START APPLICATION
// ========================================

startServer();