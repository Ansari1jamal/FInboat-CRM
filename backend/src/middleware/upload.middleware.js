const multer = require("multer");

// ========================================
// MEMORY STORAGE
// ========================================

const storage =
  multer.memoryStorage();

// ========================================
// ALLOWED MIME TYPES
// ========================================

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ========================================
// DOCUMENT UPLOAD
// ========================================

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024, // 10 MB
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      if (
        ALLOWED_MIME_TYPES.includes(
          file.mimetype
        )
      ) {
        return cb(
          null,
          true
        );
      }

      return cb(
        new Error(
          "Unsupported file type"
        )
      );
    },
  });

module.exports = {
  upload,
  ALLOWED_MIME_TYPES,
};