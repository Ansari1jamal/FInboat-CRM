const fs = require("fs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "documents"
    );

    fs.mkdirSync(uploadDir, {
      recursive: true,
    });

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname || "")
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}${extension}`;

    cb(null, fileName);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const allowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isValidMimeType =
    allowedMimeTypes.includes(file.mimetype);

  const isValidExtension =
    allowedExtensions.includes(extension);

  if (!isValidMimeType && !isValidExtension) {
    return cb(
      new Error(
        "Only PDF, JPG, JPEG and PNG files are allowed"
      )
    );
  }

  cb(null, true);
};

const uploadDocument = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
}).single("document");

module.exports = {
  uploadDocument,
};