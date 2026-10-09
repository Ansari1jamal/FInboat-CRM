
const express = require("express");

const router = express.Router();

const {
  createCollectionFollowUp,
  getCollectionFollowUps,
  getCollectionFollowUpById,
  getDueEmis,
  updateCollectionFollowUp,
  getCollectionSummary,
} = require("./collection.controller");

const authMiddleware =
  require("../../middleware/auth.middleware");

const allowRoles =
  require("../../middleware/role.middleware");

const validate =
  require("../../middleware/validate.middleware");

const {
  createCollectionFollowUpSchema,
  getCollectionFollowUpsSchema,
  getCollectionFollowUpByIdSchema,
  getDueEmisSchema,
  updateCollectionFollowUpSchema,
  collectionSummarySchema,
} = require("./collection.validation");

// ======================================================
// CREATE COLLECTION FOLLOW-UP
// ======================================================

router.post(
  "/loans/:loanAccountId/followups",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    createCollectionFollowUpSchema
  ),

  createCollectionFollowUp
);

// ======================================================
// GET COLLECTION FOLLOW-UPS
// ======================================================

router.get(
  "/collection-due-emis",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    getDueEmisSchema
  ),

  getDueEmis
);

// ======================================================
// GET COLLECTION FOLLOW-UP BY ID
// ======================================================

router.get(
  "/collection-followups/:id",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    getCollectionFollowUpByIdSchema
  ),

  getCollectionFollowUpById
);

router.get(
  "/collection-followups",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    getCollectionFollowUpsSchema
  ),

  getCollectionFollowUps
);

// ======================================================
// UPDATE COLLECTION FOLLOW-UP
// ======================================================

router.patch(
  "/collection-followups/:id",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    updateCollectionFollowUpSchema
  ),

  updateCollectionFollowUp
);

// ======================================================
// COLLECTION SUMMARY
// ======================================================

router.get(
  "/collection-summary",

  authMiddleware,

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  validate(
    collectionSummarySchema
  ),

  getCollectionSummary
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
