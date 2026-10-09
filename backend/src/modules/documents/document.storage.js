const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const STORAGE_ROOT = path.join(
  process.cwd(),
  "storage",
  "documents"
);

const ensureStorageDirectory = async () => {
  await fs.mkdir(STORAGE_ROOT, {
    recursive: true,
  });
};

const saveDocument = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("File buffer is missing");
  }

  await ensureStorageDirectory();

  const extension = path.extname(
    file.originalname
  );

  const safeExtension =
    extension.toLowerCase();

  const fileName =
    `${crypto.randomUUID()}${safeExtension}`;

  const filePath = path.join(
    STORAGE_ROOT,
    fileName
  );

  await fs.writeFile(
    filePath,
    file.buffer
  );

  return {
    fileName,
    filePath,
  };
};

const deleteDocumentFile = async (
  fileName
) => {
  if (!fileName) return;

  const filePath = path.join(
    STORAGE_ROOT,
    path.basename(fileName)
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const getDocumentFilePath = (
  fileName
) => {
  return path.join(
    STORAGE_ROOT,
    path.basename(fileName)
  );
};

module.exports = {
  saveDocument,
  deleteDocumentFile,
  getDocumentFilePath,
};