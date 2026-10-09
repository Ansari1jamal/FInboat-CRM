
const { prisma } = require("../../config/db");

const {
  ALLOWED_MASTER_CATEGORIES,
} = require("./master-data.constants");

// ========================================
// Helper: Validate Category
// ========================================

const normalizeCategory = (category) => {
  category = String(category || "")
    .trim()
    .toUpperCase();

  if (!category) {
    throw new Error("Category is required");
  }

  if (!ALLOWED_MASTER_CATEGORIES.includes(category)) {
    throw new Error("Invalid master data category");
  }

  return category;
};

// ========================================
// Helper: Boolean Conversion
// ========================================

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
};

// ========================================
// Create Master Data
// ========================================

const createMasterData = async ({
  category,
  code,
  name,
  description,
  sortOrder,
  metadata,
}) => {
  category = normalizeCategory(category);

  code = String(code || "")
    .trim()
    .toUpperCase();

  name = String(name || "").trim();

  if (!code) {
    throw new Error("Code is required");
  }

  if (!name) {
    throw new Error("Name is required");
  }

  const existing = await prisma.masterData.findUnique({
    where: {
      category_code: {
        category,
        code,
      },
    },
  });

  if (existing) {
    throw new Error(
      "Master data with this code already exists"
    );
  }

  let parsedSortOrder = 0;

  if (sortOrder !== undefined) {
    parsedSortOrder = Number(sortOrder);

    if (Number.isNaN(parsedSortOrder)) {
      throw new Error("Sort order must be a valid number");
    }
  }

  return prisma.masterData.create({
    data: {
      category,
      code,
      name,
      description:
        description !== undefined
          ? description
          : null,
      sortOrder: parsedSortOrder,
      metadata:
        metadata !== undefined
          ? metadata
          : null,
    },
  });
};

// ========================================
// Get Master Data
// ========================================

const getMasterData = async ({
  category,
  isActive,
}) => {
  const where = {};

  if (category) {
    category = normalizeCategory(category);

    where.category = category;
  }

  if (isActive !== undefined) {
    where.isActive = parseBoolean(isActive);
  }

  return prisma.masterData.findMany({
    where,

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
};

// ========================================
// Get Single Master Data
// ========================================

const getMasterDataById = async (id) => {
  if (!id) {
    throw new Error("Master data ID is required");
  }

  const item = await prisma.masterData.findUnique({
    where: {
      id,
    },
  });

  if (!item) {
    throw new Error("Master data not found");
  }

  return item;
};

// ========================================
// Update Master Data
// ========================================

const updateMasterData = async ({
  id,
  name,
  description,
  sortOrder,
  isActive,
  metadata,
}) => {
  if (!id) {
    throw new Error("Master data ID is required");
  }

  const existing = await prisma.masterData.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Master data not found");
  }

  const data = {};

  // ----------------------------------------
  // Name
  // ----------------------------------------

  if (name !== undefined) {
    name = String(name).trim();

    if (!name) {
      throw new Error("Name cannot be empty");
    }

    data.name = name;
  }

  // ----------------------------------------
  // Description
  // ----------------------------------------

  if (description !== undefined) {
    data.description = description;
  }

  // ----------------------------------------
  // Sort Order
  // ----------------------------------------

  if (sortOrder !== undefined) {
    const parsedSortOrder = Number(sortOrder);

    if (Number.isNaN(parsedSortOrder)) {
      throw new Error("Sort order must be a valid number");
    }

    data.sortOrder = parsedSortOrder;
  }

  // ----------------------------------------
  // Active Status
  // ----------------------------------------

  if (isActive !== undefined) {
    data.isActive = parseBoolean(isActive);
  }

  // ----------------------------------------
  // Metadata
  // ----------------------------------------

  if (metadata !== undefined) {
    data.metadata = metadata;
  }

  // ----------------------------------------
  // Update
  // ----------------------------------------

  return prisma.masterData.update({
    where: {
      id,
    },

    data,
  });
};

// ========================================
// Toggle Master Data Status
// ========================================

const toggleMasterDataStatus = async ({
  id,
  isActive,
}) => {
  if (!id) {
    throw new Error("Master data ID is required");
  }

  if (isActive === undefined) {
    throw new Error("isActive is required");
  }

  const existing = await prisma.masterData.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Master data not found");
  }

  return prisma.masterData.update({
    where: {
      id,
    },

    data: {
      isActive: parseBoolean(isActive),
    },
  });
};

// ========================================
// Export Service
// ========================================

module.exports = {
  createMasterData,
  getMasterData,
  getMasterDataById,
  updateMasterData,
  toggleMasterDataStatus,
};

