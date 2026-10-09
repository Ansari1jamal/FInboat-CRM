const crypto = require("crypto");

const requestId = (req, res, next) => {
  // ======================================
  // CHECK EXISTING REQUEST ID
  // ======================================

  const incomingRequestId =
    req.headers["x-request-id"];

  // ======================================
  // GENERATE REQUEST ID
  // ======================================

  const id =
    typeof incomingRequestId === "string" &&
    /^[A-Za-z0-9._:-]{1,128}$/.test(incomingRequestId)
      ? incomingRequestId
      : crypto.randomUUID();

  // ======================================
  // ATTACH TO REQUEST
  // ======================================

  req.requestId = id;

  // ======================================
  // SEND ID BACK TO CLIENT
  // ======================================

  res.setHeader(
    "X-Request-ID",
    id
  );

  next();
};

module.exports =
  requestId;