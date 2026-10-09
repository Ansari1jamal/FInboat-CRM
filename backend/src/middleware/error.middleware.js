const logger =
  require("../utils/logger");

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

const errorHandler = (
  err,
  req,
  res,
  next
) => {
  // ======================================
  // DEFAULT STATUS & MESSAGE
  // ======================================

  let statusCode =
    err?.statusCode || 500;

  let message =
    err?.message ||
    "Internal server error";

  // ======================================
  // PRISMA - DUPLICATE
  // ======================================

  if (
    err?.code === "P2002"
  ) {
    statusCode = 409;

    message =
      "Duplicate record";
  }

  // ======================================
  // PRISMA - RECORD NOT FOUND
  // ======================================

  else if (
    err?.code === "P2025"
  ) {
    statusCode = 404;

    message =
      "Record not found";
  }

  // ======================================
  // PRISMA - FOREIGN KEY
  // ======================================

  else if (
    err?.code === "P2003"
  ) {
    statusCode = 400;

    message =
      "Related record does not exist";
  }

  // ======================================
  // PRISMA - REQUIRED RELATION
  // ======================================

  else if (
    err?.code === "P2014"
  ) {
    statusCode = 400;

    message =
      "The requested operation violates a required relationship";
  }

  // ======================================
  // PRISMA - INVALID QUERY
  // ======================================

  else if (
    err?.code === "P2016"
  ) {
    statusCode = 400;

    message =
      "Invalid database query";
  }

  // ======================================
  // PRISMA - DATABASE TIMEOUT
  // ======================================

  else if (
    err?.code === "P2024"
  ) {
    statusCode = 503;

    message =
      "Database connection timeout. Please try again";
  }

  // ======================================
  // PRISMA - TRANSACTION CONFLICT
  // ======================================

  else if (
    err?.code === "P2034"
  ) {
    statusCode = 409;

    message =
      "Database transaction conflict. Please try again";
  }

  // ======================================
  // ZOD VALIDATION ERROR
  // ======================================

  else if (
    err?.name === "ZodError"
  ) {
    statusCode = 400;

    message =
      "Validation failed";
  }

  // ======================================
  // MULTER ERROR
  // ======================================

  else if (
    err?.name === "MulterError"
  ) {
    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      statusCode = 413;

      message =
        "File size exceeds the allowed limit";
    } else {
      statusCode = 400;

      message =
        "File upload failed";
    }
  }

  // ======================================
  // INVALID JSON
  // ======================================

  else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    statusCode = 400;

    message =
      "Invalid JSON request";
  }

  // ======================================
  // STATUS CODE SAFETY
  // ======================================

  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
  }

  // ======================================
  // PRODUCTION ERROR MASKING
  // ======================================

  if (
    statusCode >= 500 &&
    !(err?.name === "ApiError" && statusCode === 503)
  ) {
    message =
      "Internal server error";
  }

  // ======================================
  // ERROR LOGGING
  // ======================================

  const log =
    statusCode >= 500
      ? logger.error
      : logger.warn;

  const errorContext = {
    event: "http_error",
    requestId: req.requestId || null,
    method: req.method,
    path: req.path,
    statusCode,
    userId: req.user?.userId || null,
    userRole: req.user?.role || null,
    errorName: err?.name,
    errorCode: err?.code,
  };

  if (process.env.NODE_ENV !== "production") {
    errorContext.errorMessage = err?.message;
    errorContext.stack = err?.stack;
  }

  log.call(logger, "Request failed", errorContext);

  // ======================================
  // STANDARD RESPONSE
  // ======================================

  const response = {
    success: false,

    message,
  };

  // ======================================
  // REQUEST ID
  // ======================================

  if (
    req.requestId
  ) {
    response.requestId =
      req.requestId;
  }

  // ======================================
  // ZOD ERRORS
  // ======================================

  if (
    err?.name === "ZodError" &&
    statusCode < 500
  ) {
    response.errors =
      err.issues.map(
        (issue) => ({
          field:
            issue.path.length > 0
              ? issue.path.join(".")
              : "request",

          message:
            issue.message,
        })
      );
  }

  // ======================================
  // API ERROR CUSTOM ERRORS
  // ======================================

  else if (
    err?.errors &&
    statusCode < 500
  ) {
    response.errors =
      err.errors;
  }

  // ======================================
  // DEVELOPMENT ONLY STACK
  // ======================================

  if (
    process.env.NODE_ENV !==
      "production" &&
    statusCode >= 500
  ) {
    response.stack =
      err?.stack;
  }

  // ======================================
  // SEND RESPONSE
  // ======================================

  return res
    .status(statusCode)
    .json(response);
};

// ========================================
// EXPORT
// ========================================

module.exports =
  errorHandler;