const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ========================================
// IMPORT STORAGE DIRECTORY
// ========================================

const importDirectory = path.join(
  process.cwd(),
  "storage",
  "imports"
);

// ========================================
// CREATE DIRECTORY IF NOT EXISTS
// ========================================

if (!fs.existsSync(importDirectory)) {
  fs.mkdirSync(importDirectory, {
    recursive: true,
  });
}

// ========================================
// MULTER DISK STORAGE
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, importDirectory);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const baseName =
      path
        .basename(
          file.originalname,
          extension
        )
        .replace(/[^a-zA-Z0-9-_]/g, "_");

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedExtensions = [
    ".xlsx",
    ".xls",
    ".csv",
  ];

  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  if (
    !allowedExtensions.includes(
      extension
    )
  ) {
    return cb(
      new Error(
        "Only CSV, XLS and XLSX files are allowed"
      )
    );
  }

  cb(null, true);
};

// ========================================
// UPLOAD
// ========================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});

module.exports = {
  upload,
};