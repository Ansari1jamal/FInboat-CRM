const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
//const allowRoles = require("../../middleware/role.middleware");
const allowRoles = require("../../middleware/role.middleware");
const {
  createCallLogController,
  getLeadCallLogsController,
} = require("./call.controller");

router.get(
  "/lead/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadCallLogsController
);

router.post(
  "/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  createCallLogController
);

module.exports = router;