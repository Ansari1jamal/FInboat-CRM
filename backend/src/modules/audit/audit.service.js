const { prisma } = require("../../config/db");

// =====================================
// CREATE AUDIT LOG
// =====================================

const createAuditLog = async ({
  db = prisma,
  userId,
  action,
  module,
  recordId = null,
  metadata = null,
}) => {
  return db.auditLog.create({
    data: {
      userId,
      action,
      module,
      recordId,
      metadata,
    },
  });
};

// =====================================
// GET AUDIT LOGS
// =====================================

const getAuditLogs = async ({
  user,
  page = 1,
  limit = 20,
  module,
  action,
  userId,
  recordId,
}) => {
  page = Number(page);
  limit = Number(limit);

  // =====================================
  // PAGINATION VALIDATION
  // =====================================

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 20;
  }

  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  // =====================================
  // FILTER
  // =====================================

  const where = {};

  if (module) {
    where.module = module;
  }

  if (action) {
    where.action = action;
  }

  if (userId) {
    where.userId = userId;
  }

  if (recordId) {
    where.recordId = recordId;
  }

  // =====================================
  // GET LOGS + COUNT
  // =====================================

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  // =====================================
  // RESPONSE
  // =====================================

  return {
    logs,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createAuditLog,
  getAuditLogs,
};