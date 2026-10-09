const logger =
  require("../utils/logger");

const requestLogger =
  (req, res, next) => {
    const startTime =
      Date.now();

    res.on("finish", () => {
      const duration =
        Date.now() - startTime;

      const log =
        res.statusCode >= 500
          ? logger.error
          : [401, 403].includes(res.statusCode)
            ? logger.warn
            : logger.info;

      log.call(
        logger,
        "HTTP Request",
        {
          event: "http_request",
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: duration,
          userId: req.user?.userId || null,
          userRole: req.user?.role || null,
          ip: req.ip,
        }
      );
    });

    next();
  };

module.exports =
  requestLogger;