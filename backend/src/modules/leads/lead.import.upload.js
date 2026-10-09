const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");
const ApiError = require("../../utils/ApiError");

const importDirectory = path.join(
  os.tmpdir(),
  "finboat-crm-lead-imports"
);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(importDirectory, { recursive: true }, (error) => {
      callback(error, importDirectory);
    });
  },
  filename: (req, file, callback) => {
    callback(
      null,
      `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`
    );
  },
});

const allowedExtensions = new Set([".csv", ".xls", ".xlsx"]);

const uploadLeadImport = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new ApiError(400, "Please upload a CSV, XLS, or XLSX file")
      );
    }

    callback(null, true);
  },
});

module.exports = {
  uploadLeadImport,
};
