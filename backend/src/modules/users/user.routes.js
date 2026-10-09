const express = require("express");

const userController = require("./user.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const allowRoles = require("../../middleware/role.middleware");

const router = express.Router();

// All user APIs require authentication
router.use(authMiddleware);

// Create user
router.post(
  "/",
  allowRoles("ADMIN"),
  userController.createUser
);

// Get users
router.get(
  "/",
  allowRoles("ADMIN", "MANAGER", "TL"),
  userController.getUsers
);

// Get user
router.get(
  "/:id",
  allowRoles("ADMIN", "MANAGER", "TL"),
  userController.getUserById
);

// Update
router.patch(
  "/:id",
  allowRoles("ADMIN"),
  userController.updateUser
);

// Activate / Deactivate
router.patch(
  "/:id/status",
  allowRoles("ADMIN"),
  userController.updateUserStatus
);

module.exports = router;