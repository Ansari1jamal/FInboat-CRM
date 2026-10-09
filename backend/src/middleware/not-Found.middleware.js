const logger =
  require("../utils/logger");

// ========================================
// 404 NOT FOUND MIDDLEWARE
// ========================================

const notFound = (
  req,
  res
) => {
  // ======================================
  // LOG 404 REQUEST
  // ======================================

  logger.warn(
    "Route not found",
    {
      requestId:
        req.requestId || null,

      method:
        req.method,

      path:
        req.path,

      ip:
        req.ip,

      userId:
        req.user?.userId ||
        null,

      userRole:
        req.user?.role ||
        null,
    }
  );

  // ======================================
  // RESPONSE
  // ======================================

  const response = {
    success: false,

    message:
      "Route not found",
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
  // SEND RESPONSE
  // ======================================

  return res
    .status(404)
    .json(response);
};

// ========================================
// EXPORT
// ========================================

module.exports =
  notFound;