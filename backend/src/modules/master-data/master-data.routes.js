
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const allowRoles = require("../../middleware/role.middleware");
const validate =require("../../middleware/validate.middleware");
const {
  createMasterData,
  getMasterData,
  getMasterDataById,
  updateMasterData,
  toggleMasterDataStatus,
} = require("./master-data.controller");

const {createMasterDataSchema,} = require("./master-data.validation");

// ========================================
// CREATE MASTER DATA
// ADMIN ONLY
// ========================================

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  createMasterData
);

// ========================================
// GET MASTER DATA LIST
// AUTHENTICATED USERS
// ========================================

router.get(
  "/",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getMasterData
);

// ========================================
// GET SINGLE MASTER DATA
// AUTHENTICATED USERS
// ========================================

router.get(
  "/:id",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getMasterDataById
);

// ========================================
// UPDATE MASTER DATA
// ADMIN ONLY
// ========================================

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  updateMasterData
);

// ========================================
// ACTIVATE / DEACTIVATE MASTER DATA
// ADMIN ONLY
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("ADMIN"),
  toggleMasterDataStatus
);

router.post(
  "/",
  validate(createMasterDataSchema),
  createMasterData
);
// ========================================
// EXPORT
// ========================================

module.exports = router;

