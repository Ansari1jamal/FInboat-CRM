const express = require("express");

const router = express.Router();

const controller = require("./lender.controller");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");

router.post(
  "/",
  auth,
  role("ADMIN"),
  controller.createLender
);

router.get(
  "/",
  auth,
  role(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  controller.getLenders
);

router.patch(
  "/:id",
  auth,
  role("ADMIN"),
  controller.updateLender
);

module.exports = router;