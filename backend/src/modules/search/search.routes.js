const express = require("express");

const router =
  express.Router();

const {
  search,
} = require("./search.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware,
  search
);

module.exports = router;