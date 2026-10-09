const express =
  require("express");

const {
  basicHealth,
  liveness,
  readiness,
} =
  require("./health.controller");

const router =
  express.Router();

router.get(
  "/health",
  basicHealth
);

// ========================================
// LIVENESS
// ========================================

router.get(
  "/health/live",
  liveness
);

// ========================================
// READINESS
// ========================================

router.get(
  "/health/ready",
  readiness
);

// ========================================
// EXPORT
// ========================================

module.exports =
  router;