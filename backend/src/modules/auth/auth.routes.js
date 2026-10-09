
const express = require("express");

const router = express.Router();

// ========================================
// CONTROLLERS
// ========================================

const authController =
  require("./auth.controller");

// ========================================
// MIDDLEWARE
// ========================================

const authMiddleware =
  require("../../middleware/auth.middleware");

const allowRoles =
  require("../../middleware/role.middleware");

const {
  loginLimiter,
} = require("../../middleware/rate-limit.middleware");

const {
  csrfProtection,
} = require("../../middleware/csrf.middleware");

const validate =
  require("../../middleware/validate.middleware");

// ========================================
// VALIDATION
// ========================================

const {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} = require("./auth.validation");

// ========================================
// REGISTER
// ========================================

router.post(
  "/register",

  authMiddleware,

  allowRoles("ADMIN"),

  csrfProtection,

  validate(registerSchema),

  authController.register
);

// ========================================
// LOGIN
// ========================================

router.post(
  "/login",

  // Brute-force protection
  loginLimiter,

  // CSRF protection
  csrfProtection,

  // Request validation
  validate(loginSchema),

  // Controller
  authController.login
);

// ========================================
// REFRESH TOKEN
// ========================================

router.post(
  "/refresh",

  csrfProtection,

  validate(refreshSchema),

  authController.refresh
);

// ========================================
// CSRF TOKEN
// ========================================
//
// GET request hai, isliye csrfProtection
// intentionally nahi lagaya gaya.
//

router.get(
  "/csrf-token",

  authController.csrfToken
);

// ========================================
// LOGOUT
// ========================================

router.post(
  "/logout",

  csrfProtection,

  validate(logoutSchema),

  authController.logout
);

// ========================================
// CURRENT USER
// ========================================

router.get(
  "/me",

  authMiddleware,

  authController.me
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
