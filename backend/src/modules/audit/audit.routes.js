const express = require("express");

const router = express.Router();

const auditController = require("./audit.controller");

const auth = require("../../middleware/auth.middleware");

const roleMiddleware = require("../../middleware/role.middleware");

router.use(auth);

router.get(
  "/",
  roleMiddleware("ADMIN", "MANAGER"),
  auditController.getAuditLogs
);

module.exports = router;