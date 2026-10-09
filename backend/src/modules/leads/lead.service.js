
const { prisma } =
  require("../../config/db");

const ApiError =
  require("../../utils/ApiError");

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

const {
  normalizeMobile,
  findDuplicateLead,
} = require("./lead.duplicateCheck");

const {
  createAuditLog,
} = require("../audit/audit.service");

const {
  canAssignLeadToUser,
} = require("./lead.authorization");

// =====================================
// CREATE LEAD
// =====================================

const createLead = async ({
  customerName,
  mobile,
  loanType,
  loanAmount,
  source,
  status,
  assignedToId,
  assignedTeamId,
  createdBy,
  createdByRole,
}) => {

  // =====================================
  // BASIC VALIDATION
  // =====================================

  if (!customerName) {
    throw new ApiError(
      400,
      "Customer name is required"
    );
  }

  if (!mobile) {
    throw new ApiError(
      400,
      "Mobile number is required"
    );
  }

  if (!loanType) {
    throw new ApiError(
      400,
      "Loan type is required"
    );
  }

  if (
    loanAmount === undefined ||
    loanAmount === null ||
    loanAmount === ""
  ) {
    throw new ApiError(
      400,
      "Loan amount is required"
    );
  }

  // =====================================
  // NORMALIZE MOBILE
  // =====================================

  const normalizedMobile =
    normalizeMobile(mobile);

  if (
    !normalizedMobile ||
    normalizedMobile.length !== 10
  ) {
    throw new ApiError(
      400,
      "Please provide a valid 10 digit mobile number"
    );
  }

  // =====================================
  // DUPLICATE CHECK
  // =====================================

  const duplicate =
    await findDuplicateLead(
      normalizedMobile
    );

  if (duplicate) {
    return {
      lead: duplicate,
      isDuplicate: true,
      duplicateOf: duplicate.id,
    };
  }

  // =====================================
  // ASSIGNED TELECALLER VALIDATION
  // =====================================

  if (assignedToId) {

    const telecaller =
      await prisma.user.findUnique({
        where: {
          id: assignedToId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          managerId: true,
          tlId: true,
        },
      });

    if (!telecaller) {
      throw new ApiError(
        404,
        "Assigned user not found"
      );
    }

    if (
      telecaller.role !==
      "TELECALLER"
    ) {
      throw new ApiError(
        400,
        "Lead can only be assigned to a telecaller"
      );
    }

    if (!telecaller.isActive) {
      throw new ApiError(
        400,
        "Selected telecaller is inactive"
      );
    }

    // =====================================
    // ASSIGNMENT AUTHORIZATION
    // =====================================

    await canAssignLeadToUser({
      actorId: createdBy,
      actorRole: createdByRole,
      targetUserId: assignedToId,
    });
  }

  // =====================================
  // TEAM VALIDATION
  // =====================================

  if (assignedTeamId) {

    const team =
      await prisma.team.findUnique({
        where: {
          id: assignedTeamId,
        },

        select: {
          id: true,
          name: true,
          managerId: true,
          tlId: true,
        },
      });

    if (!team) {
      throw new ApiError(
        404,
        "Assigned team not found"
      );
    }

    // =====================================
    // TEAM + TELECALLER CONSISTENCY
    // =====================================

    if (assignedToId) {

      const assignedUser =
        await prisma.user.findUnique({
          where: {
            id: assignedToId,
          },

          select: {
            managerId: true,
            tlId: true,
          },
        });

      if (!assignedUser) {
        throw new ApiError(
          404,
          "Assigned user not found"
        );
      }

      const sameTeam =
        assignedUser.managerId ===
          team.managerId &&
        assignedUser.tlId ===
          team.tlId;

      if (!sameTeam) {
        throw new ApiError(
          400,
          "Assigned user does not belong to the selected team"
        );
      }
    }
  }

  // =====================================
  // CREATE LEAD
  // =====================================

  const lead =
    await prisma.lead.create({
      data: {
        customerName,

        mobile:
          normalizedMobile,

        loanType,

        loanAmount,

        source:
          source || "MANUAL",

        status:
          status || "NEW",

        assignedToId,

        assignedTeamId,

        isDuplicate: false,
      },

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        assignedTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  // =====================================
  // INITIAL STATUS HISTORY
  // =====================================

  await prisma.leadStatusHistory.create({
    data: {
      leadId: lead.id,

      oldStatus: null,

      newStatus:
        lead.status,

      changedBy:
        createdBy,
    },
  });

  // =====================================
  // AUDIT LOG
  // =====================================

  await createAuditLog({
    userId: createdBy,

    action: "CREATE",

    module: "LEAD",

    recordId: lead.id,

    metadata: {
      customerName:
        lead.customerName,

      mobile:
        lead.mobile,

      loanType:
        lead.loanType,

      assignedToId:
        lead.assignedToId,

      assignedTeamId:
        lead.assignedTeamId,
    },
  });

  // =====================================
  // RESPONSE
  // =====================================

  return {
    lead,

    isDuplicate: false,

    duplicateOf: null,
  };
};

// =====================================
// GET LEADS
// =====================================

const getLeads = async ({
  user,
  search,
  status,
  loanType,
  source,
  assignedToId,
  assignedTeamId,
  fromDate,
  toDate,
  minAmount,
  maxAmount,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {

  // =====================================
  // PAGINATION
  // =====================================

  page = Number(page);

  limit = Number(limit);

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    page = 1;
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    limit = 20;
  }

  if (limit > 100) {
    limit = 100;
  }

  const skip =
    (page - 1) * limit;

  // =====================================
  // WHERE
  // =====================================

  const where = {};

  // =====================================
  // USER VALIDATION
  // =====================================

  if (!user || !user.role) {
    throw new ApiError(
      401,
      "Authentication required"
    );
  }

  if (!["ADMIN", "MANAGER", "TL", "TELECALLER"].includes(user.role)) {
    throw new ApiError(403, "Unauthorized");
  }

  // =====================================
  // ROLE BASED DATA SCOPE
  // =====================================

  // ADMIN
  // Admin can see all leads.

  // MANAGER
  if (
    user.role === "MANAGER"
  ) {
    where.assignedTo = {
      managerId:
        user.userId,
    };
  }

  // TL
  if (
    user.role === "TL"
  ) {
    where.assignedTo = {
      tlId:
        user.userId,
    };
  }

  // TELECALLER
  if (
    user.role ===
    "TELECALLER"
  ) {
    where.assignedToId =
      user.userId;
  }

  // =====================================
  // SEARCH
  // =====================================

  if (search) {
    where.OR = [
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },

      {
        mobile: {
          contains: search,
        },
      },
    ];
  }

  // =====================================
  // STATUS
  // =====================================

  if (status) {
    where.status = status;
  }

  // =====================================
  // LOAN TYPE
  // =====================================

  if (loanType) {
    where.loanType =
      loanType;
  }

  // =====================================
  // SOURCE
  // =====================================

  if (source) {
    where.source =
      source;
  }

  // =====================================
  // ASSIGNED USER
  // =====================================

  if (assignedToId) {
    if (
      user.role === "TELECALLER" &&
      assignedToId !== user.userId
    ) {
      throw new ApiError(
        403,
        "Telecallers can only filter leads assigned to themselves"
      );
    }

    where.assignedToId =
      assignedToId;
  }

  // =====================================
  // ASSIGNED TEAM
  // =====================================

  if (assignedTeamId) {
    where.assignedTeamId =
      assignedTeamId;
  }

  // =====================================
  // DATE FILTER
  // =====================================

  if (
    fromDate ||
    toDate
  ) {

    where.createdAt = {};

    // ===================================
    // FROM DATE
    // ===================================

    if (fromDate) {

      const startDate =
        new Date(
          `${fromDate}T00:00:00`
        );

      if (!isValidDateOnly(fromDate)) {
        throw new ApiError(
          400,
          "Invalid fromDate"
        );
      }

      where.createdAt.gte =
        startDate;
    }

    // ===================================
    // TO DATE
    // ===================================

    if (toDate) {

      const endDate =
        new Date(
          `${toDate}T23:59:59.999`
        );

      if (!isValidDateOnly(toDate)) {
        throw new ApiError(
          400,
          "Invalid toDate"
        );
      }

      where.createdAt.lte =
        endDate;
    }

    if (
      where.createdAt.gte &&
      where.createdAt.lte &&
      where.createdAt.gte > where.createdAt.lte
    ) {
      throw new ApiError(
        400,
        "fromDate must be on or before toDate"
      );
    }
  }

  // =====================================
  // AMOUNT FILTER
  // =====================================

  if (
    minAmount !== undefined ||
    maxAmount !== undefined
  ) {

    where.loanAmount = {};

    // ===================================
    // MIN
    // ===================================

    if (
      minAmount !== undefined
    ) {

      const minimum =
        Number(minAmount);

      if (
        Number.isNaN(minimum)
      ) {
        throw new ApiError(
          400,
          "Invalid minAmount"
        );
      }

      where.loanAmount.gte =
        minimum;
    }

    // ===================================
    // MAX
    // ===================================

    if (
      maxAmount !== undefined
    ) {

      const maximum =
        Number(maxAmount);

      if (
        Number.isNaN(maximum)
      ) {
        throw new ApiError(
          400,
          "Invalid maxAmount"
        );
      }

      where.loanAmount.lte =
        maximum;
    }
  }

  // =====================================
  // SORTING
  // =====================================

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "customerName",
    "loanAmount",
    "status",
  ];

  if (
    !allowedSortFields.includes(
      sortBy
    )
  ) {
    sortBy =
      "createdAt";
  }

  if (
    !["asc", "desc"].includes(
      sortOrder
    )
  ) {
    sortOrder =
      "desc";
  }

  // =====================================
  // DATABASE QUERY
  // =====================================

  const [
    leads,
    total,
  ] =
    await prisma.$transaction([
      prisma.lead.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          [sortBy]:
            sortOrder,
        },

        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          assignedTeam: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.lead.count({
        where,
      }),
    ]);

  // =====================================
  // PAGINATION
  // =====================================

  const totalPages =
    Math.ceil(
      total / limit
    );

  return {
    leads,

    pagination: {
      page,

      limit,

      total,

      totalPages,

      hasNextPage:
        page <
        totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
};

// =====================================
// GET SINGLE LEAD
// =====================================

const getLeadById = async (
  id,
  user
) => {

  if (!user || !user.role) {
    throw new ApiError(
      401,
      "Authentication required"
    );
  }

  if (!id) {
    throw new ApiError(
      400,
      "Lead ID is required"
    );
  }

  const where = {
    id,
  };

  // =====================================
  // TELECALLER
  // =====================================

  if (
    user.role ===
    "TELECALLER"
  ) {
    where.assignedToId =
      user.userId;
  }

  // =====================================
  // TL
  // =====================================

  if (
    user.role === "TL"
  ) {
    where.assignedTo = {
      tlId:
        user.userId,
    };
  }

  // =====================================
  // MANAGER
  // =====================================

  if (
    user.role ===
    "MANAGER"
  ) {
    where.assignedTo = {
      managerId:
        user.userId,
    };
  }

  // =====================================
  // FIND
  // =====================================

  const lead =
    await prisma.lead.findFirst({
      where,

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        assignedTeam: {
          select: {
            id: true,
            name: true,
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

  return lead;
};

// =====================================
// UPDATE LEAD
// =====================================

const updateLead = async (
  id,
  data,
  user
) => {

  // =====================================
  // GET EXISTING LEAD
  // =====================================

  const existingLead =
    await getLeadById(
      id,
      user
    );

  const {
    customerName,
    mobile,
    loanType,
    loanAmount,
    source,
    assignedToId,
    assignedTeamId,
  } = data;

  // =====================================
  // MOBILE
  // =====================================

  let normalizedMobile =
    existingLead.mobile;

  if (
    mobile &&
    mobile !==
      existingLead.mobile
  ) {

    normalizedMobile =
      normalizeMobile(
        mobile
      );

    if (
      !normalizedMobile ||
      normalizedMobile.length !==
        10
    ) {
      throw new ApiError(
        400,
        "Please provide a valid 10 digit mobile number"
      );
    }

    const duplicate =
      await findDuplicateLead(
        normalizedMobile
      );

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new ApiError(
        409,
        "Another lead already exists with this mobile number"
      );
    }
  }

  // =====================================
  // ASSIGNMENT
  // =====================================

  if (
    assignedToId !==
      undefined &&
    assignedToId !==
      existingLead.assignedToId
  ) {

    if (!assignedToId) {
      throw new ApiError(
        400,
        "Assigned telecaller cannot be removed without proper reassignment"
      );
    }

    const telecaller =
      await prisma.user.findUnique({
        where: {
          id: assignedToId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          managerId: true,
          tlId: true,
        },
      });

    if (!telecaller) {
      throw new ApiError(
        404,
        "Assigned user not found"
      );
    }

    if (
      telecaller.role !==
      "TELECALLER"
    ) {
      throw new ApiError(
        400,
        "Lead can only be assigned to a telecaller"
      );
    }

    if (!telecaller.isActive) {
      throw new ApiError(
        400,
        "Selected telecaller is inactive"
      );
    }

    await canAssignLeadToUser({
      actorId:
        user.userId,

      actorRole:
        user.role,

      targetUserId:
        assignedToId,
    });
  }

  // =====================================
  // TEAM
  // =====================================

  if (
    assignedTeamId !==
    undefined
  ) {

    if (!assignedTeamId) {
      throw new ApiError(
        400,
        "Assigned team cannot be removed"
      );
    }

    const team =
      await prisma.team.findUnique({
        where: {
          id: assignedTeamId,
        },

        select: {
          id: true,
          name: true,
          managerId: true,
          tlId: true,
        },
      });

    if (!team) {
      throw new ApiError(
        404,
        "Assigned team not found"
      );
    }

    const finalAssignedToId =
      assignedToId !==
      undefined
        ? assignedToId
        : existingLead.assignedToId;

    if (finalAssignedToId) {

      const assignedUser =
        await prisma.user.findUnique({
          where: {
            id: finalAssignedToId,
          },

          select: {
            managerId: true,
            tlId: true,
          },
        });

      if (!assignedUser) {
        throw new ApiError(
          404,
          "Assigned user not found"
        );
      }

      const sameTeam =
        assignedUser.managerId ===
          team.managerId &&
        assignedUser.tlId ===
          team.tlId;

      if (!sameTeam) {
        throw new ApiError(
          400,
          "Assigned user does not belong to the selected team"
        );
      }
    }
  }

  // =====================================
  // UPDATE DATA
  // =====================================

  const updateData = {};

  if (
    customerName !==
    undefined
  ) {
    updateData.customerName =
      customerName;
  }

  if (
    mobile !==
    undefined
  ) {
    updateData.mobile =
      normalizedMobile;
  }

  if (
    loanType !==
    undefined
  ) {
    updateData.loanType =
      loanType;
  }

  if (
    loanAmount !==
    undefined
  ) {
    updateData.loanAmount =
      loanAmount;
  }

  if (
    source !==
    undefined
  ) {
    updateData.source =
      source;
  }

  if (
    assignedToId !==
    undefined
  ) {
    updateData.assignedToId =
      assignedToId;
  }

  if (
    assignedTeamId !==
    undefined
  ) {
    updateData.assignedTeamId =
      assignedTeamId;
  }

  // =====================================
  // UPDATE
  // =====================================

  const updatedLead =
    await prisma.lead.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        assignedTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  // =====================================
  // AUDIT LOG
  // =====================================

  await createAuditLog({
    userId:
      user.userId,

    action:
      "UPDATE",

    module:
      "LEAD",

    recordId:
      updatedLead.id,

    metadata: {
      updatedFields:
        Object.keys(
          updateData
        ),

      assignedToId:
        updatedLead.assignedToId,

      assignedTeamId:
        updatedLead.assignedTeamId,
    },
  });

  return updatedLead;
};

// =====================================
// DELETE LEAD
// =====================================

const deleteLead = async (
  id,
  user
) => {

  // =====================================
  // GET LEAD
  // =====================================

  const lead =
    await getLeadById(
      id,
      user
    );

  // =====================================
  // DELETE
  // =====================================

  await prisma.lead.delete({
    where: {
      id: lead.id,
    },
  });

  // =====================================
  // AUDIT LOG
  // =====================================

  await createAuditLog({
    userId:
      user.userId,

    action:
      "DELETE",

    module:
      "LEAD",

    recordId:
      lead.id,

    metadata: {
      customerName:
        lead.customerName,

      mobile:
        lead.mobile,
    },
  });

  return null;
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createLead,

  getLeads,

  getLeadById,

  updateLead,

  deleteLead,
};
