const express = require("express");

const teamController = require("./team.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const allowRoles = require("../../middleware/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  allowRoles("ADMIN"),
  teamController.createTeam
);

router.get(
  "/",
  allowRoles("ADMIN", "MANAGER", "TL"),
  teamController.getTeams
);

router.get(
  "/:id",
  allowRoles("ADMIN", "MANAGER", "TL"),
  teamController.getTeamById
);

router.patch(
  "/:id",
  allowRoles("ADMIN"),
  teamController.updateTeam
);

router.delete(
  "/:id",
  allowRoles("ADMIN"),
  teamController.deleteTeam
);

module.exports = router;