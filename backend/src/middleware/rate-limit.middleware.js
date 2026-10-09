const rateLimit =
  require("express-rate-limit");

// ========================================
// GENERAL API RATE LIMITER
// ========================================

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000, // 15 minutes

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests, please try again later.",
    },
  });

  // ========================================
// LOGIN RATE LIMITER
// ========================================

const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many login attempts. Try again later.",
    },
  });

module.exports = {
  apiLimiter,
  loginLimiter,
};