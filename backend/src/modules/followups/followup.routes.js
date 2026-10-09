const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");

const allowRoles = require("../../middleware/role.middleware");

const {
  createFollowUpController,
  updateFollowUpController,
  getPendingFollowUpsController,
  getOverdueFollowUpsController,
  getFollowUpSummaryController,
} = require("./followup.controller");

// ==========================================
// CREATE FOLLOW-UP
// ==========================================

router.post(
  "/:leadId",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  createFollowUpController
);

// ==========================================
// PENDING FOLLOW-UPS
// ==========================================

router.get(
  "/pending",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  getPendingFollowUpsController
);

// ==========================================
// OVERDUE FOLLOW-UPS
// ==========================================

router.get(
  "/overdue",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  getOverdueFollowUpsController
);

// ==========================================
// FOLLOW-UP SUMMARY
// ==========================================

router.get(
  "/summary",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  getFollowUpSummaryController
);

// ==========================================
// UPDATE FOLLOW-UP
// ==========================================

router.patch(
  "/:id",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  updateFollowUpController
);

module.exports = router;