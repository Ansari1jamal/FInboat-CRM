
const crypto = require("crypto");

const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

const {
  APPLICATION_TRANSITIONS,
} = require("./application.status");

const {
  createLoanAccountWithTransaction,
} = require("../loans/loan.service");

// ======================================
// AUDIT LOG
// ======================================

const {
  createAuditLog,
} = require("../audit/audit.service");

// ======================================
// NOTIFICATION
// ======================================

const {
  createNotificationOnce,
} = require("../notifications/notification.service");

// ======================================
// GENERATE APPLICATION NUMBER
// ======================================

const generateApplicationNumber = () => {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `APP-${date}-${random}`;
};

// ======================================
// CHECK LEAD ACCESS
// ======================================

const checkLeadAccess = (lead, user) => {
  // ====================================
  // ADMIN
  // ====================================

  if (user.role === "ADMIN") {
    return true;
  }

  // ====================================
  // TELECALLER
  // ====================================

  if (user.role === "TELECALLER") {
    if (lead.assignedToId !== user.userId) {
      throw new ApiError(
        403,
        "You cannot access this lead"
      );
    }

    return true;
  }

  // ====================================
  // TL
  // ====================================

  if (user.role === "TL") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.tlId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You cannot access this lead"
      );
    }

    return true;
  }

  // ====================================
  // MANAGER
  // ====================================

  if (user.role === "MANAGER") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.managerId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You cannot access this lead"
      );
    }

    return true;
  }

  throw new ApiError(
    403,
    "You are not allowed to access this lead"
  );
};

// ======================================
// 23.6 CREATE APPLICATION
// ======================================

const createApplication = async ({
  leadId,
  lenderId,
  requestedAmount,
  user,
}) => {
  // ====================================
  // FIND LEAD
  // ====================================

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },

    include: {
      assignedTo: {
        select: {
          id: true,
          managerId: true,
          tlId: true,
        },
      },
    },
  });

  if (!lead) {
    throw new ApiError(
      404,
      "Lead not found"
    );
  }

  // ====================================
  // CHECK ACCESS
  // ====================================

  checkLeadAccess(
    lead,
    user
  );

  // ====================================
  // CHECK ACTIVE APPLICATION
  // ====================================

  const existingApplication =
    await prisma.loanApplication.findFirst({
      where: {
        leadId,

        status: {
          notIn: [
            "REJECTED",
            "CANCELLED",
          ],
        },
      },
    });

  if (existingApplication) {
    throw new ApiError(
      409,
      "Active application already exists for this lead"
    );
  }

  // ====================================
  // CHECK LENDER
  // ====================================

  if (lenderId) {
    const lender =
      await prisma.lender.findUnique({
        where: {
          id: lenderId,
        },
      });

    if (!lender) {
      throw new ApiError(
        404,
        "Lender not found"
      );
    }

    if (!lender.isActive) {
      throw new ApiError(
        400,
        "Lender is inactive"
      );
    }
  }

  // ====================================
  // APPLICATION + HISTORY
  // SAME TRANSACTION
  // ====================================

  const application =
    await prisma.$transaction(
      async (tx) => {
        // ==================================
        // CREATE APPLICATION
        // ==================================

        const created =
          await tx.loanApplication.create({
            data: {
              leadId,

              lenderId:
                lenderId || null,

              requestedAmount:
                requestedAmount !== undefined
                  ? requestedAmount
                  : null,

              applicationNumber:
                generateApplicationNumber(),

              createdById:
                user.userId,
            },

            include: {
              lead: true,

              lender: true,

              createdBy: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          });

        // ==================================
        // INITIAL APPLICATION HISTORY
        // ==================================

        await tx.applicationStatusHistory.create({
          data: {
            applicationId:
              created.id,

            fromStatus:
              null,

            toStatus:
              "DRAFT",

            changedById:
              user.userId,

            note:
              "Application created",
          },
        });

        // ==================================
        // AUDIT LOG
        // ==================================

        await createAuditLog({
          db: tx,

          userId:
            user.userId,

          action:
            "CREATE",

          module:
            "APPLICATION",

          recordId:
            created.id,

          metadata: {
            applicationNumber:
              created.applicationNumber,

            leadId:
              created.leadId,

            lenderId:
              created.lenderId,

            requestedAmount:
              created.requestedAmount,

            status:
              "DRAFT",
          },
        });

        return created;
      }
    );

  return application;
};

// ======================================
// 23.7 GET APPLICATIONS
// ======================================

const getApplications = async ({
  user,
  search,
  status,
  lenderId,
  leadId,
  loanType,
  fromDate,
  toDate,
  minAmount,
  maxAmount,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  // ====================================
  // PAGINATION
  // ====================================

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

  const skip =
    (page - 1) * limit;

  // ====================================
  // MAIN WHERE
  // ====================================

  const where = {};

  // ====================================
  // STATUS FILTER
  // ====================================

  if (status) {
    where.status = status;
  }

  // ====================================
  // LENDER FILTER
  // ====================================

  if (lenderId) {
    where.lenderId = lenderId;
  }

  // ====================================
  // LEAD FILTER
  // ====================================

  if (leadId) {
    where.leadId = leadId;
  }

  // ====================================
  // LEAD FILTERS
  // ====================================

  const leadWhere = {};

  // ====================================
  // LOAN TYPE
  // ====================================

  if (loanType) {
    leadWhere.loanType = loanType;
  }

  // ====================================
  // SEARCH
  // Customer Name / Mobile
  // ====================================

  if (search) {
    leadWhere.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        mobile: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // ====================================
  // APPLY LEAD FILTER
  // ====================================

  if (
    Object.keys(leadWhere).length > 0
  ) {
    where.lead = {
      ...leadWhere,
    };
  }

  // ====================================
  // DATE FILTER
  // ====================================

  if (fromDate || toDate) {
    where.createdAt = {};

    // ==================================
    // FROM DATE
    // ==================================

    if (fromDate) {
      const start = new Date(
        `${fromDate}T00:00:00`
      );

      if (
        Number.isNaN(
          start.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid fromDate"
        );
      }

      where.createdAt.gte = start;
    }

    // ==================================
    // TO DATE
    // ==================================

    if (toDate) {
      const end = new Date(
        `${toDate}T23:59:59.999`
      );

      if (
        Number.isNaN(
          end.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid toDate"
        );
      }

      where.createdAt.lte = end;
    }
  }

  // ======================================
  // AMOUNT FILTERS
  // ======================================

  if (
    minAmount !== undefined ||
    maxAmount !== undefined
  ) {
    where.requestedAmount = {};

    // ====================================
    // MINIMUM AMOUNT
    // ====================================

    if (
      minAmount !== undefined &&
      minAmount !== ""
    ) {
      const amount =
        Number(minAmount);

      if (
        Number.isNaN(amount)
      ) {
        throw new ApiError(
          400,
          "Invalid minAmount"
        );
      }

      where.requestedAmount.gte =
        amount;
    }

    // ====================================
    // MAXIMUM AMOUNT
    // ====================================

    if (
      maxAmount !== undefined &&
      maxAmount !== ""
    ) {
      const amount =
        Number(maxAmount);

      if (
        Number.isNaN(amount)
      ) {
        throw new ApiError(
          400,
          "Invalid maxAmount"
        );
      }

      where.requestedAmount.lte =
        amount;
    }
  }

  // ======================================
  // ROLE BASED SCOPE
  // ======================================

  // ====================================
  // TELECALLER
  // ====================================

  if (
    user.role === "TELECALLER"
  ) {
    where.lead = {
      ...(where.lead || {}),

      assignedToId:
        user.userId,
    };
  }

  // ====================================
  // TL
  // ====================================

  if (
    user.role === "TL"
  ) {
    const existingLeadWhere =
      where.lead || {};

    where.lead = {
      ...existingLeadWhere,

      assignedTo: {
        ...(existingLeadWhere.assignedTo || {}),

        tlId:
          user.userId,
      },
    };
  }

  // ====================================
  // MANAGER
  // ====================================

  if (
    user.role === "MANAGER"
  ) {
    const existingLeadWhere =
      where.lead || {};

    where.lead = {
      ...existingLeadWhere,

      assignedTo: {
        ...(existingLeadWhere.assignedTo || {}),

        managerId:
          user.userId,
      },
    };
  }

  // ====================================
  // INVALID ROLE
  // ====================================

  if (
    ![
      "ADMIN",
      "MANAGER",
      "TL",
      "TELECALLER",
    ].includes(user.role)
  ) {
    throw new ApiError(
      403,
      "Invalid user role"
    );
  }

  // ======================================
  // SORTING
  // ======================================

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "status",
    "requestedAmount",
    "sanctionedAmount",
    "disbursedAmount",
    "applicationNumber",
  ];

  if (
    !allowedSortFields.includes(
      sortBy
    )
  ) {
    sortBy = "createdAt";
  }

  sortOrder =
    sortOrder === "asc"
      ? "asc"
      : "desc";

  // ======================================
  // FETCH APPLICATIONS
  // ======================================

  const [
    applications,
    total,
  ] = await Promise.all([
    prisma.loanApplication.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        [sortBy]: sortOrder,
      },

      include: {
        // =================================
        // LEAD
        // =================================

        lead: {
          select: {
            id: true,

            customerName: true,

            mobile: true,

            loanType: true,

            loanAmount: true,

            status: true,

            assignedTo: {
              select: {
                id: true,

                name: true,

                role: true,
              },
            },
          },
        },

        // =================================
        // LENDER
        // =================================

        lender: true,

        // =================================
        // CREATED BY
        // =================================

        createdBy: {
          select: {
            id: true,

            name: true,

            role: true,
          },
        },

        // =================================
        // DOCUMENTS
        // IMPORTANT:
        // documentType DOES NOT EXIST
        // Actual field is docType
        // =================================

        documents: {
          select: {
            id: true,

            docType: true,

            status: true,

            fileName: true,

            createdAt: true,
          },
        },
      },
    }),

    // ====================================
    // TOTAL COUNT
    // ====================================

    prisma.loanApplication.count({
      where,
    }),
  ]);

  // ======================================
  // TOTAL PAGES
  // ======================================

  const totalPages =
    Math.ceil(
      total / limit
    );

  // ======================================
  // RESPONSE
  // ======================================

  return {
    applications,

    pagination: {
      page,

      limit,

      total,

      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
};

// ======================================
// 23.8 GET SINGLE APPLICATION
// ======================================

const getApplicationById = async ({
  id,
  user,
}) => {
  const application =
    await prisma.loanApplication.findUnique({
      where: {
        id,
      },

      include: {
        lead: {
          include: {
            assignedTo: true,

            assignedTeam: true,
          },
        },

        lender: true,

        loan_accounts: true,

        createdBy: {
          select: {
            id: true,

            name: true,

            role: true,
          },
        },
      },
    });

  if (!application) {
    throw new ApiError(
      404,
      "Application not found"
    );
  }

  // ====================================
  // CHECK ACCESS
  // ====================================

  checkLeadAccess(
    application.lead,
    user
  );

  return {
    ...application,
    loanAccount: application.loan_accounts,
  };
};

// ======================================
// 23.9 UPDATE APPLICATION
// ======================================

const updateApplication = async ({
  id,
  lenderId,
  requestedAmount,
  sanctionedAmount,
  disbursedAmount,
  rejectionReason,
  user,
}) => {
  // ====================================
  // GET APPLICATION
  // ====================================

  const application =
    await getApplicationById({
      id,
      user,
    });

  // ====================================
  // COMPLETED CHECK
  // ====================================

  if (
    [
      "DISBURSED",
      "CANCELLED",
    ].includes(
      application.status
    )
  ) {
    throw new ApiError(
      400,
      "Completed application cannot be updated"
    );
  }

  // ====================================
  // VALIDATE LENDER
  // ====================================

  if (
    lenderId !== undefined &&
    lenderId !== null
  ) {
    const lender =
      await prisma.lender.findUnique({
        where: {
          id: lenderId,
        },
      });

    if (!lender) {
      throw new ApiError(
        404,
        "Lender not found"
      );
    }

    if (!lender.isActive) {
      throw new ApiError(
        400,
        "Lender is inactive"
      );
    }
  }

  // ====================================
  // BUILD DATA
  // ====================================

  const data = {};

  if (
    lenderId !== undefined
  ) {
    data.lenderId =
      lenderId;
  }

  if (
    requestedAmount !== undefined
  ) {
    data.requestedAmount =
      requestedAmount;
  }

  if (
    sanctionedAmount !== undefined
  ) {
    data.sanctionedAmount =
      sanctionedAmount;
  }

  if (
    disbursedAmount !== undefined
  ) {
    data.disbursedAmount =
      disbursedAmount;
  }

  if (
    rejectionReason !== undefined
  ) {
    data.rejectionReason =
      rejectionReason;
  }

  // ====================================
  // UPDATE
  // ====================================

  const updatedApplication =
    await prisma.loanApplication.update({
      where: {
        id,
      },

      data,

      include: {
        lead: true,

        lender: true,

        createdBy: {
          select: {
            id: true,

            name: true,

            role: true,
          },
        },
      },
    });

  // ====================================
  // AUDIT LOG
  // ====================================

  await createAuditLog({
    userId:
      user.userId,

    action:
      "UPDATE",

    module:
      "APPLICATION",

    recordId:
      updatedApplication.id,

    metadata: {
      applicationNumber:
        updatedApplication.applicationNumber,

      leadId:
        updatedApplication.leadId,

      changes:
        data,
    },
  });

  return updatedApplication;
};

// ======================================
// 23.10 CHANGE APPLICATION STATUS
// ======================================

const changeApplicationStatus = async ({
  id,
  status,
  sanctionedAmount,
  disbursedAmount,
  rejectionReason,
  user,
}) => {
  // ====================================
  // GET APPLICATION
  // ====================================

  const application =
    await getApplicationById({
      id,
      user,
    });

  // ====================================
  // CHECK TRANSITION
  // ====================================

  const allowed =
    APPLICATION_TRANSITIONS[
      application.status
    ] || [];

  if (
    !allowed.includes(status)
  ) {
    throw new ApiError(
      400,
      `Invalid status transition: ${application.status} -> ${status}`
    );
  }

  // ====================================
  // APPROVAL PERMISSION
  // ====================================

  if (
    [
      "APPROVED",
      "DISBURSED",
    ].includes(status) &&
    ![
      "ADMIN",
      "MANAGER",
      "TL",
    ].includes(user.role)
  ) {
    throw new ApiError(
      403,
      "You do not have permission for this status"
    );
  }

  // ====================================
  // APPROVED VALIDATION
  // ====================================

  if (
    status === "APPROVED" &&
    (
      sanctionedAmount === undefined ||
      sanctionedAmount === null ||
      Number(sanctionedAmount) <= 0
    )
  ) {
    throw new ApiError(
      400,
      "Sanctioned amount is required"
    );
  }

  // ====================================
  // DISBURSED VALIDATION
  // ====================================

  if (
    status === "DISBURSED" &&
    (
      disbursedAmount === undefined ||
      disbursedAmount === null ||
      Number(disbursedAmount) <= 0
    )
  ) {
    throw new ApiError(
      400,
      "Disbursed amount is required"
    );
  }

  // ====================================
  // REJECTED VALIDATION
  // ====================================

  if (
    status === "REJECTED" &&
    !rejectionReason?.trim()
  ) {
    throw new ApiError(
      400,
      "Rejection reason is required"
    );
  }

  const now =
    new Date();

  // ====================================
  // TRANSACTION
  // ====================================

  const updatedApplication =
    await prisma.$transaction(
      async (tx) => {
        const data = {
          status,
        };

        // ==================================
        // LOGIN
        // ==================================

        if (
          status === "LOGIN"
        ) {
          data.loginDate =
            now;
        }

        // ==================================
        // APPROVED
        // ==================================

        if (
          status === "APPROVED"
        ) {
          data.approvalDate =
            now;

          data.sanctionedAmount =
            sanctionedAmount;
        }

        // ==================================
        // DISBURSED
        // ==================================

        if (
          status === "DISBURSED"
        ) {
          data.disbursementDate =
            now;

          data.disbursedAmount =
            disbursedAmount;
        }

        // ==================================
        // REJECTED
        // ==================================

        if (
          status === "REJECTED"
        ) {
          data.rejectionReason =
            rejectionReason.trim();
        }

        // ==================================
        // UPDATE APPLICATION
        // ==================================

        const updated =
          await tx.loanApplication.update({
            where: {
              id,
            },

            data,

            include: {
              lead: true,

              lender: true,

              createdBy: {
                select: {
                  id: true,

                  name: true,

                  role: true,
                },
              },
            },
          });

        // ==================================
        // APPLICATION STATUS HISTORY
        // ==================================

        await tx.applicationStatusHistory.create({
          data: {
            applicationId:
              id,

            fromStatus:
              application.status,

            toStatus:
              status,

            changedById:
              user.userId,

            note:
              status === "REJECTED"
                ? rejectionReason.trim()
                : `Application status changed to ${status}`,
          },
        });

        // ==================================
        // APPLICATION AUDIT LOG
        // ==================================

        await createAuditLog({
          db: tx,

          userId:
            user.userId,

          action:
            "STATUS_CHANGE",

          module:
            "APPLICATION",

          recordId:
            application.id,

          metadata: {
            applicationNumber:
              application.applicationNumber,

            leadId:
              application.leadId,

            fromStatus:
              application.status,

            toStatus:
              status,

            ...(sanctionedAmount !==
              undefined && {
              sanctionedAmount,
            }),

            ...(disbursedAmount !==
              undefined && {
              disbursedAmount,
            }),

            ...(status ===
              "REJECTED" && {
              rejectionReason:
                rejectionReason.trim(),
            }),
          },
        });

        // ==================================
        // APPLICATION -> LEAD STATUS MAP
        // ==================================

        const leadStatusMap = {
          LOGIN:
            "LOGIN",

          APPROVED:
            "APPROVED",

          DISBURSED:
            "DISBURSED",

          REJECTED:
            "REJECTED",
        };

        const newLeadStatus =
          leadStatusMap[status];

        // ==================================
        // SYNC LEAD STATUS
        // ==================================

        if (newLeadStatus) {
          const lead =
            await tx.lead.findUnique({
              where: {
                id:
                  application.leadId,
              },
            });

          if (!lead) {
            throw new ApiError(
              404,
              "Lead not found"
            );
          }

          // =================================
          // STATUS CHANGED?
          // =================================

          if (
            lead.status !==
            newLeadStatus
          ) {
            // ===============================
            // UPDATE LEAD
            // ===============================

            await tx.lead.update({
              where: {
                id:
                  application.leadId,
              },

              data: {
                status:
                  newLeadStatus,
              },
            });

            // ===============================
            // LEAD STATUS HISTORY
            // ===============================

            await tx.leadStatusHistory.create({
              data: {
                leadId:
                  application.leadId,

                oldStatus:
                  lead.status,

                newStatus:
                  newLeadStatus,

                changedBy:
                  user.userId,
              },
            });
          }
        }

        if (status === "DISBURSED") {
          await createLoanAccountWithTransaction({
            tx,
            application: updated,
          });
        }

        return updated;
      }
    );

  // ====================================
  // NOTIFICATION
  // ====================================

  // ====================================
  // APPROVED
  // ====================================

  if (
    status === "APPROVED"
  ) {
    await createNotificationOnce({
      userId:
        updatedApplication.createdById,

      type:
        "SYSTEM",

      title:
        "Application Approved",

      message:
        `Application ${updatedApplication.applicationNumber} has been approved.`,

      leadId:
        updatedApplication.leadId,
    });
  }

  // ====================================
  // DISBURSED
  // ====================================

  if (
    status === "DISBURSED"
  ) {
    await createNotificationOnce({
      userId:
        updatedApplication.createdById,

      type:
        "SYSTEM",

      title:
        "Loan Disbursed",

      message:
        `Application ${updatedApplication.applicationNumber} has been disbursed.`,

      leadId:
        updatedApplication.leadId,
    });
  }

  // ====================================
  // REJECTED
  // ====================================

  if (
    status === "REJECTED"
  ) {
    await createNotificationOnce({
      userId:
        updatedApplication.createdById,

      type:
        "SYSTEM",

      title:
        "Application Rejected",

      message:
        `Application ${updatedApplication.applicationNumber} was rejected. Reason: ${rejectionReason.trim()}`,

      leadId:
        updatedApplication.leadId,
    });
  }

  return updatedApplication;
};

// ======================================
// 26.7 GET APPLICATION STATUS HISTORY
// ======================================

const getApplicationStatusHistory =
  async ({
    id,
    user,
  }) => {
    // ==================================
    // ACCESS CHECK
    // ==================================

    await getApplicationById({
      id,
      user,
    });

    // ==================================
    // GET HISTORY
    // ==================================

    const history =
      await prisma.applicationStatusHistory.findMany({
        where: {
          applicationId:
            id,
        },

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          changedBy: {
            select: {
              id: true,

              name: true,

              role: true,
            },
          },
        },
      });

    return history;
  };

// ======================================
// EXPORTS
// ======================================

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  changeApplicationStatus,
  getApplicationStatusHistory,
};