const express = require("express");

const router = express.Router();

const dashboardController = require("./dashboard.controller");

const auth = require("../../middleware/auth.middleware");

router.use(auth);

router.get(
  "/",
  dashboardController.getDashboard
);

module.exports = router;