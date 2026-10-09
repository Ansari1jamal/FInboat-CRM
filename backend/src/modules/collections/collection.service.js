const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const {
  canAssignLeadToUser,
} = require("../leads/lead.authorization");

// ======================================================
// Role Scope
// ======================================================

const getCollectionScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(401, "Authenticated user information is missing");
  }

  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      loan_accounts: {
        leads: {
          assignedTo: {
            managerId: user.userId,
          },
        },
      },
    };
  }

  if (user.role === "TL") {
    return {
      loan_accounts: {
        leads: {
          assignedTo: {
            tlId: user.userId,
          },
        },
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      loan_accounts: {
        leads: {
          assignedToId: user.userId,
        },
      },
    };
  }

  throw new ApiError(403, "Unauthorized");
};

const getLoanRecordScope = (user) => {
  const scope = getCollectionScope(user);
  return scope.loan_accounts
    ? { leads: scope.loan_accounts.leads }
    : {};
};

const normalizeCollectionFollowUp = (followUp) => {
  if (!followUp) {
    return followUp;
  }

  const loan = followUp.loan_accounts;
  return {
    ...followUp,
    loanAccount: loan
      ? {
          ...loan,
          lead: loan.leads,
        }
      : loan,
  };
};

// ======================================================
// Create Collection Follow-up
// ======================================================

const createCollectionFollowUp = async ({
  loanAccountId,
  emiScheduleId,
  assignedToId,
  type,
  scheduledDate,
  scheduledTime,
  notes,
  promisedAmount,
  promisedDate,
  user,
}) => {
  const allowedTypes = [
    "EMI_DUE",
    "EMI_OVERDUE",
    "PAYMENT_PROMISE",
    "COLLECTION_CALL",
  ];

  if (!allowedTypes.includes(type)) {
    throw new ApiError(400, "Invalid collection follow-up type");
  }

  // ----------------------------------------------------
  // Check loan + access
  // ----------------------------------------------------

  const loan = await prisma.loanAccount.findFirst({
    where: {
      id: loanAccountId,
      ...getLoanRecordScope(user),
    },

    include: {
      leads: {
        include: {
          assignedTo: true,
        },
      },
    },
  });

  if (!loan) {
    throw new ApiError(404,
      "Loan account not found or unauthorized access"
    );
  }

  // ----------------------------------------------------
  // Validate EMI if provided
  // ----------------------------------------------------

  if (emiScheduleId) {
    const emi = await prisma.emiSchedule.findUnique({
      where: {
        id: emiScheduleId,
      },
    });

    if (!emi) {
      throw new ApiError(404, "EMI schedule not found");
    }

    if (emi.loanAccountId !== loanAccountId) {
      throw new ApiError(400, "EMI does not belong to this loan");
    }
  }

  // ----------------------------------------------------
  // Validate assigned user
  // ----------------------------------------------------

  if (assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: {
        id: assignedToId,
      },

      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!assignedUser) {
      throw new ApiError(404, "Assigned user not found");
    }

    if (!assignedUser.isActive) {
      throw new ApiError(400, "Assigned user is inactive");
    }

    if (assignedToId !== user.userId) {
      await canAssignLeadToUser({
        actorId: user.userId,
        actorRole: user.role,
        targetUserId: assignedToId,
      });
    }
  } else {
    throw new ApiError(400, "assignedToId is required");
  }

  // ----------------------------------------------------
  // Create follow-up
  // ----------------------------------------------------

  const followUp =
    await prisma.collectionFollowUp.create({
      data: {
        loanAccountId,
        emiScheduleId: emiScheduleId || null,

        assignedToId,

        type,

        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || null,

        notes: notes || null,

        promisedAmount:
          promisedAmount !== undefined
            ? promisedAmount
            : null,

        promisedDate:
          promisedDate !== undefined
            ? new Date(promisedDate)
            : null,
      },

      include: {
        loan_accounts: {
          select: {
            id: true,
            loanAccountNumber: true,
            status: true,
          },
        },

        emiSchedule: {
          select: {
            id: true,
            emiNumber: true,
            dueDate: true,
            emiAmount: true,
            outstandingAmount: true,
            status: true,
          },
        },

        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

  return normalizeCollectionFollowUp(followUp);
};

// ======================================================
// Get Collection Follow-ups
// ======================================================

const getCollectionFollowUps = async ({
  user,
  status,
  loanAccountId,
  page = 1,
  limit = 20,
}) => {
  page = Math.max(Number(page) || 1, 1);

  limit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const where = {
    ...getCollectionScope(user),
  };

  if (status) {
    const allowedStatuses = [
      "PENDING",
      "CONTACTED",
      "PROMISED",
      "PAID",
      "MISSED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400,
        "Invalid collection follow-up status"
      );
    }

    where.status = status;
  }

  if (loanAccountId) {
    where.loanAccountId = loanAccountId;
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.collectionFollowUp.findMany({
      where,

      skip,
      take: limit,

      orderBy: [
        {
          scheduledDate: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      include: {
        loan_accounts: {
          select: {
            id: true,
            loanAccountNumber: true,
            disbursedAmount: true,
            status: true,

            leads: {
              select: {
                id: true,
                customerName: true,
                mobile: true,
              },
            },
          },
        },

        emiSchedule: {
          select: {
            id: true,
            emiNumber: true,
            dueDate: true,
            emiAmount: true,
            outstandingAmount: true,
            status: true,
          },
        },

        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),

    prisma.collectionFollowUp.count({
      where,
    }),
  ]);

  return {
    data: data.map(normalizeCollectionFollowUp),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ======================================================
// Update Collection Follow-up
// ======================================================

const updateCollectionFollowUp = async ({
  id,
  status,
  notes,
  promisedAmount,
  promisedDate,
  user,
}) => {
  const existing =
    await prisma.collectionFollowUp.findUnique({
      where: {
        id,
      },

      include: {
        loan_accounts: {
          include: {
            leads: {
              include: {
                assignedTo: true,
              },
            },
          },
        },
      },
    });

  if (!existing) {
    throw new ApiError(404,
      "Collection follow-up not found"
    );
  }

  // ----------------------------------------------------
  // Access check
  // ----------------------------------------------------

  if (user.role !== "ADMIN") {
    const lead = existing.loan_accounts.leads;

    if (
      user.role === "MANAGER" &&
      lead.assignedTo?.managerId !== user.userId
    ) {
      throw new ApiError(403, "Unauthorized");
    }

    if (
      user.role === "TL" &&
      lead.assignedTo?.tlId !== user.userId
    ) {
      throw new ApiError(403, "Unauthorized");
    }

    if (
      user.role === "TELECALLER" &&
      lead.assignedToId !== user.userId
    ) {
      throw new ApiError(403, "Unauthorized");
    }

    if (
      !["MANAGER", "TL", "TELECALLER"].includes(
        user.role
      )
    ) {
      throw new ApiError(403, "Unauthorized");
    }
  }

  // ----------------------------------------------------
  // Prepare update
  // ----------------------------------------------------

  const data = {};

  if (status !== undefined) {
    const allowedStatuses = [
      "PENDING",
      "CONTACTED",
      "PROMISED",
      "PAID",
      "MISSED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400,
        "Invalid collection follow-up status"
      );
    }

    data.status = status;

    if (
      ["PAID", "CANCELLED"].includes(status)
    ) {
      data.completedAt = new Date();
    }

    if (
      ["PENDING", "CONTACTED", "PROMISED", "MISSED"].includes(
        status
      )
    ) {
      data.completedAt = null;
    }
  }

  if (notes !== undefined) {
    data.notes = notes;
  }

  if (promisedAmount !== undefined) {
    data.promisedAmount = promisedAmount;
  }

  if (promisedDate !== undefined) {
    data.promisedDate = new Date(promisedDate);
  }

  // Nothing to update
  if (Object.keys(data).length === 0) {
    return existing;
  }

  const updated = await prisma.collectionFollowUp.update({
    where: {
      id,
    },

    data,

    include: {
      loan_accounts: {
        select: {
          id: true,
          loanAccountNumber: true,
          status: true,
        },
      },

      emiSchedule: {
        select: {
          id: true,
          emiNumber: true,
          dueDate: true,
          emiAmount: true,
          outstandingAmount: true,
          status: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return normalizeCollectionFollowUp(updated);
};

const getCollectionFollowUpById = async ({ id, user }) => {
  const followUp = await prisma.collectionFollowUp.findFirst({
    where: {
      id,
      ...getCollectionScope(user),
    },
    include: {
      loan_accounts: {
        select: {
          id: true,
          loanAccountNumber: true,
          status: true,
          leads: {
            select: {
              id: true,
              customerName: true,
              mobile: true,
            },
          },
        },
      },
      emiSchedule: {
        select: {
          id: true,
          emiNumber: true,
          dueDate: true,
          emiAmount: true,
          outstandingAmount: true,
          status: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!followUp) {
    throw new ApiError(404, "Collection follow-up not found");
  }

  return normalizeCollectionFollowUp(followUp);
};

const getDueEmis = async ({ user, page = 1, limit = 20 }) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const where = {
    ...getCollectionScope(user),
    status: {
      in: ["PENDING", "PARTIAL", "OVERDUE"],
    },
    dueDate: {
      lte: today,
    },
  };

  const [items, total] = await Promise.all([
    prisma.emiSchedule.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ dueDate: "asc" }, { emiNumber: "asc" }],
      include: {
        loan_accounts: {
          select: {
            id: true,
            loanAccountNumber: true,
            status: true,
            leads: {
              select: {
                id: true,
                customerName: true,
                mobile: true,
              },
            },
          },
        },
      },
    }),
    prisma.emiSchedule.count({ where }),
  ]);

  return {
    data: items.map((emi) => ({
      ...emi,
      loanAccount: {
        ...emi.loan_accounts,
        lead: emi.loan_accounts.leads,
      },
      daysOverdue: Math.max(
        0,
        Math.floor((Date.now() - new Date(emi.dueDate).getTime()) / 86400000)
      ),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ======================================================
// Collection Summary
// ======================================================

const getCollectionSummary = async ({
  user,
}) => {
  const scope = getCollectionScope(user);

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const [pending, overdue, dueToday] =
    await Promise.all([
      prisma.emiSchedule.count({
        where: {
          ...scope,

          status: {
            in: ["PENDING", "PARTIAL"],
          },
        },
      }),

      prisma.emiSchedule.count({
        where: {
          ...scope,

          status: "OVERDUE",
        },
      }),

      prisma.emiSchedule.count({
        where: {
          ...scope,

          dueDate: {
            gte: startOfToday,
            lte: endOfToday,
          },

          status: {
            in: ["PENDING", "PARTIAL"],
          },
        },
      }),
    ]);

  return {
    pendingEmis: pending,
    overdueEmis: overdue,
    dueTodayEmis: dueToday,
  };
};

// ======================================================
// Outstanding Collection Amount
// ======================================================

const getOutstandingCollection = async ({
  user,
}) => {
  const scope = getCollectionScope(user);

  const emis =
    await prisma.emiSchedule.findMany({
      where: {
        ...scope,

        status: {
          in: [
            "PENDING",
            "PARTIAL",
            "OVERDUE",
          ],
        },
      },

      select: {
        outstandingAmount: true,
      },
    });

  const totalOutstanding = emis.reduce(
    (sum, emi) =>
      sum + Number(emi.outstandingAmount),
    0
  );

  return {
    totalOutstanding: Number(
      totalOutstanding.toFixed(2)
    ),
  };
};

// ======================================================
// Exports
// ======================================================

module.exports = {
  getCollectionScope,
  createCollectionFollowUp,
  getCollectionFollowUps,
  getCollectionFollowUpById,
  getDueEmis,
  updateCollectionFollowUp,
  getCollectionSummary,
  getOutstandingCollection,
};