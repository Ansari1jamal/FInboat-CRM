const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");

const allowRoles = require("../../middleware/role.middleware");

const {
  createTargetController,
  getTargetsController,
  updateTargetController,
  deleteTargetController,
  getAchievementController,
} = require("./target.controller");

// Create

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  createTargetController
);

//get

router.get(
  "/",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getTargetsController
);


router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  updateTargetController
);


router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  deleteTargetController
);



router.get(
  "/:id/achievement",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getAchievementController
);

module.exports = router;