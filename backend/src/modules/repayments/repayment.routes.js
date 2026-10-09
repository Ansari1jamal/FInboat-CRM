
const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../../middleware/auth.middleware");

const allowRoles =
  require("../../middleware/role.middleware");

const validate =
  require("../../middleware/validate.middleware");

const {
  generateEmiSchedule,
  getEmiSchedule,
  getRepayments,
  getRepaymentById,
  createRepayment,
  getLoanRepaymentSummary,
} = require("./repayment.controller");

const {
  generateEmiScheduleSchema,
  getEmiScheduleSchema,
  getRepaymentsSchema,
  getRepaymentByIdSchema,
  createRepaymentSchema,
  loanRepaymentSummarySchema,
} = require("./repayment.validation");

// ======================================
// GENERATE EMI SCHEDULE
// ======================================

router.post(
  "/loans/:loanAccountId/emi-schedule",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(generateEmiScheduleSchema),
  generateEmiSchedule
);

// ======================================
// GET EMI SCHEDULE
// ======================================

router.get(
  "/loans/:loanAccountId/emi-schedule",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(getEmiScheduleSchema),
  getEmiSchedule
);

router.get(
  "/loans/:loanAccountId/repayments/:repaymentId",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER", "TL", "TELECALLER"),
  validate(getRepaymentByIdSchema),
  getRepaymentById
);

router.get(
  "/loans/:loanAccountId/repayments",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER", "TL", "TELECALLER"),
  validate(getRepaymentsSchema),
  getRepayments
);

// ======================================
// CREATE REPAYMENT
// ======================================

router.post(
  "/loans/:loanAccountId/repayments",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(createRepaymentSchema),
  createRepayment
);

// ======================================
// REPAYMENT SUMMARY
// ======================================

router.get(
  "/loans/:loanAccountId/repayment-summary",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(loanRepaymentSummarySchema),
  getLoanRepaymentSummary
);

module.exports = router;
