const express = require("express");

const router = express.Router();

const {
  createLoanAccount,
  getLoanAccounts,
  exportLoanAccounts,
  getLoanAccount,
  updateLoanStatus,
} = require("./loan.controller");

const auth = require("../../middleware/auth.middleware");

// Application -> Loan Account
router.post(
  "/applications/:applicationId/convert",
  auth,
  createLoanAccount
);

// Loan listing
router.get(
  "/",
  auth,
  getLoanAccounts
);

router.get(
  "/export",
  auth,
  exportLoanAccounts
);

// Single loan
router.get(
  "/:id",
  auth,
  getLoanAccount
);

// Loan status
router.patch(
  "/:id/status",
  auth,
  updateLoanStatus
);

module.exports = router;