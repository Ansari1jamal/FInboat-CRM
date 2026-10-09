const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");
const { generateLoanAccountNumber } = require("./loan.number");

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * -----------------------------------------
 * Get Loan Scope
 * -----------------------------------------
 *
 * ADMIN
 *   -> All loans
 *
 * MANAGER
 *   -> Loans of leads assigned to their team
 *
 * TL
 *   -> Loans of leads assigned to their telecallers
 *
 * TELECALLER
 *   -> Loans of their assigned leads
 */
const getLoanScope = (user) => {
  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      leads: {
        assignedTo: {
          managerId: user.userId,
        },
      },
    };
  }

  if (user.role === "TL") {
    return {
      leads: {
        assignedTo: {
          tlId: user.userId,
        },
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      leads: {
        assignedToId: user.userId,
      },
    };
  }

  throw new ApiError(403, "Unauthorized");
};

const normalizeLoanAccount = (loanAccount) => {
  if (!loanAccount) {
    return loanAccount;
  }

  return {
    ...loanAccount,
    application: loanAccount.loan_applications,
    lead: loanAccount.leads,
    lender: loanAccount.Lender,
  };
};

/**
 * -----------------------------------------
 * Create Loan Account
 * -----------------------------------------
 *
 * This function can be used for:
 *
 * 1. Manual /convert API
 * 2. Other internal services
 *
 * Application must be DISBURSED.
 */
const createLoanAccountFromApplication = async ({
  applicationId,
  user,
}) => {
  /**
   * Find application
   */
  const application =
    await prisma.loanApplication.findUnique({
      where: {
        id: applicationId,
      },

      include: {
        lead: {
          include: {
            assignedTo: true,
          },
        },

        lender: true,

        loan_accounts: true,
      },
    });

  /**
   * Application not found
   */
  if (!application) {
    throw new ApiError(
      404,
      "Loan application not found"
    );
  }

  /**
   * Check access
   */
  if (user.role !== "ADMIN") {
    const lead = application.lead;

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found"
      );
    }

    /**
     * MANAGER
     */
    if (user.role === "MANAGER") {
      if (
        !lead.assignedTo ||
        lead.assignedTo.managerId !== user.userId
      ) {
        throw new ApiError(
          403,
          "You do not have access to this loan application"
        );
      }
    }

    /**
     * TL
     */
    if (user.role === "TL") {
      if (
        !lead.assignedTo ||
        lead.assignedTo.tlId !== user.userId
      ) {
        throw new ApiError(
          403,
          "You do not have access to this loan application"
        );
      }
    }

    /**
     * TELECALLER
     */
    if (user.role === "TELECALLER") {
      if (
        lead.assignedToId !== user.userId
      ) {
        throw new ApiError(
          403,
          "You do not have access to this loan application"
        );
      }
    }
  }

  /**
   * Application must be DISBURSED
   */
  if (
    application.status !== "DISBURSED"
  ) {
    throw new ApiError(
      400,
      "Loan account can only be created for a DISBURSED application"
    );
  }

  /**
   * If already created,
   * return existing loan account.
   */
  if (application.loan_accounts) {
    return normalizeLoanAccount(application.loan_accounts);
  }

  /**
   * Disbursed amount required
   */
  if (!application.disbursedAmount) {
    throw new ApiError(
      400,
      "Disbursed amount is required"
    );
  }

  /**
   * Generate loan account number
   */
  const loanAccountNumber =
    generateLoanAccountNumber();

  /**
   * Create loan account
   */
  const loanAccount =
    await prisma.loanAccount.create({
      data: {
        applicationId:
          application.id,

        leadId:
          application.leadId,

        lenderId:
          application.lenderId,

        loanAccountNumber,

        principalAmount:
          application.sanctionedAmount ||
          application.disbursedAmount,

        disbursedAmount:
          application.disbursedAmount,

        disbursedAt:
          application.disbursementDate ||
          new Date(),

        status: "ACTIVE",
      },

      include: {
        loan_applications: true,
        leads: true,
        Lender: true,
      },
    });

  return normalizeLoanAccount(loanAccount);
};

/**
 * -----------------------------------------
 * Create Loan Account Inside Transaction
 * -----------------------------------------
 *
 * IMPORTANT:
 *
 * This function is specifically for
 * Application Service.
 *
 * Application Service should NOT import
 * createLoanAccountFromApplication()
 * because that would use another Prisma
 * transaction.
 *
 * Instead updateApplicationStatus()
 * will call this logic directly using tx.
 */
const createLoanAccountWithTransaction = async ({
  tx,
  application,
}) => {
  /**
   * Check if loan already exists
   */
  const existingLoan =
    await tx.loanAccount.findUnique({
      where: {
        applicationId:
          application.id,
      },
    });

  /**
   * Already exists
   */
  if (existingLoan) {
    return existingLoan;
  }

  /**
   * Disbursed amount required
   */
  if (!application.disbursedAmount) {
    throw new ApiError(
      400,
      "Disbursed amount is required"
    );
  }

  /**
   * Generate account number
   */
  const loanAccountNumber =
    generateLoanAccountNumber();

  /**
   * Create loan account
   */
  const loanAccount =
    await tx.loanAccount.create({
      data: {
        applicationId:
          application.id,

        leadId:
          application.leadId,

        lenderId:
          application.lenderId,

        loanAccountNumber,

        principalAmount:
          application.sanctionedAmount ||
          application.disbursedAmount,

        disbursedAmount:
          application.disbursedAmount,

        disbursedAt:
          application.disbursementDate ||
          new Date(),

        status: "ACTIVE",
      },

      include: {
        loan_applications: true,
        leads: true,
        Lender: true,
      },
    });

  return normalizeLoanAccount(loanAccount);
};

/**
 * -----------------------------------------
 * Get Loan Account By ID
 * -----------------------------------------
 */
const getLoanAccountById = async ({
  id,
  user,
}) => {
  /**
   * Get role scope
   */
  const scope = getLoanScope(user);

  /**
   * Find loan
   */
  const loanAccount =
    await prisma.loanAccount.findFirst({
      where: {
        id,
        ...scope,
      },

      include: {
        loan_applications: {
          include: {
            lender: true,
          },
        },

        leads: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },

        Lender: true,
      },
    });

  /**
   * Not found / no access
   */
  if (!loanAccount) {
    throw new ApiError(
      404,
      "Loan account not found"
    );
  }

  return normalizeLoanAccount(loanAccount);
};

/**
 * -----------------------------------------
 * Get All Loan Accounts
 * -----------------------------------------
 */
const getLoanAccounts = async ({
  user,
  status,
  lenderId,
  page = 1,
  limit = 20,
}) => {
  /**
   * Role scope
   */
  const scope =
    getLoanScope(user);

  /**
   * Pagination
   */
  page = Math.max(
    Number(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  /**
   * Where
   */
  const where = {
    ...scope,
  };

  /**
   * Status filter
   */
  if (status) {
    where.status = status;
  }

  /**
   * Lender filter
   */
  if (lenderId) {
    where.lenderId = lenderId;
  }

  /**
   * Pagination skip
   */
  const skip =
    (page - 1) * limit;

  /**
   * Fetch loans + count
   */
  const [loans, total] =
    await Promise.all([
      prisma.loanAccount.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          loan_applications: {
            select: {
              id: true,
              applicationNumber: true,
              status: true,
            },
          },

          leads: {
            select: {
              id: true,
              customerName: true,
              mobile: true,
              loanType: true,
            },
          },

          Lender: true,
        },
      }),

      prisma.loanAccount.count({
        where,
      }),
    ]);

  return {
    data: loans.map(normalizeLoanAccount),

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total / limit
        ),

      hasNextPage:
        page * limit < total,

      hasPreviousPage:
        page > 1,
    },
  };
};

const exportLoanAccounts = async ({
  user,
  status,
  lenderId,
  search,
  fromDate,
  toDate,
}) => {
  const where = {
    ...getLoanScope(user),
  };

  if (status) {
    where.status = status;
  }

  if (lenderId) {
    where.lenderId = lenderId;
  }

  if (search) {
    where.OR = [
      {
        loanAccountNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        leads: {
          customerName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        leads: {
          mobile: {
            contains: search,
          },
        },
      },
    ];
  }

  if (fromDate || toDate) {
    where.disbursedAt = {};

    if (fromDate) {
      const startDate = new Date(`${fromDate}T00:00:00`);
      if (!isValidDateOnly(fromDate)) {
        throw new ApiError(400, "Invalid fromDate");
      }
      where.disbursedAt.gte = startDate;
    }

    if (toDate) {
      const endDate = new Date(`${toDate}T00:00:00`);
      if (!isValidDateOnly(toDate)) {
        throw new ApiError(400, "Invalid toDate");
      }
      endDate.setDate(endDate.getDate() + 1);
      where.disbursedAt.lt = endDate;
    }

    if (
      where.disbursedAt.gte &&
      where.disbursedAt.lt &&
      where.disbursedAt.gte >= where.disbursedAt.lt
    ) {
      throw new ApiError(400, "fromDate must be on or before toDate");
    }
  }

  return prisma.loanAccount.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      loan_applications: {
        select: {
          applicationNumber: true,
        },
      },
      leads: {
        select: {
          customerName: true,
          mobile: true,
          loanType: true,
        },
      },
      Lender: {
        select: {
          name: true,
        },
      },
    },
  });
};

/**
 * -----------------------------------------
 * Update Loan Status
 * -----------------------------------------
 *
 * ACTIVE
 * CLOSED
 * FORECLOSED
 * WRITTEN_OFF
 */
const updateLoanStatus = async ({
  id,
  status,
  user,
}) => {
  /**
   * Allowed statuses
   */
  const allowedStatuses = [
    "ACTIVE",
    "CLOSED",
    "FORECLOSED",
    "WRITTEN_OFF",
  ];

  /**
   * Validate status
   */
  if (
    !allowedStatuses.includes(status)
  ) {
    throw new ApiError(
      400,
      "Invalid loan status"
    );
  }

  /**
   * Get loan with access check
   */
  const loan =
    await getLoanAccountById({
      id,
      user,
    });

  /**
   * Terminal statuses
   */
  const terminalStatuses = [
    "CLOSED",
    "FORECLOSED",
    "WRITTEN_OFF",
  ];

  /**
   * Cannot update terminal loan
   */
  if (
    terminalStatuses.includes(
      loan.status
    )
  ) {
    throw new ApiError(
      400,
      "Loan is already in a terminal status"
    );
  }

  /**
   * Update
   */
  const updatedLoan =
    await prisma.loanAccount.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        loan_applications: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
          },
        },

        leads: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            loanType: true,
          },
        },

        Lender: true,
      },
    });

  return normalizeLoanAccount(updatedLoan);
};

/**
 * -----------------------------------------
 * Exports
 * -----------------------------------------
 */
module.exports = {
  getLoanScope,

  createLoanAccountFromApplication,

  createLoanAccountWithTransaction,

  getLoanAccountById,

  getLoanAccounts,
  exportLoanAccounts,

  updateLoanStatus,
};