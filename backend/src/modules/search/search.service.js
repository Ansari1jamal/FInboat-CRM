
const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

// ========================================
// LEAD ROLE SCOPE
// ========================================

const getLeadScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new ApiError(
      401,
      "Authenticated user information is missing"
    );
  }

  if (user.role === "ADMIN") {
    return {};
  }

  if (user.role === "MANAGER") {
    return {
      assignedTo: {
        managerId: user.userId,
      },
    };
  }

  if (user.role === "TL") {
    return {
      assignedTo: {
        tlId: user.userId,
      },
    };
  }

  if (user.role === "TELECALLER") {
    return {
      assignedToId: user.userId,
    };
  }

  return {
    id: "__NO_ACCESS__",
  };
};

// ========================================
// SEARCH LIMIT HELPER
// ========================================

const getSafeLimit = (limit) => {
  const parsedLimit = Number(limit);

  if (!Number.isFinite(parsedLimit) || parsedLimit < 1) {
    return 10;
  }

  return Math.min(Math.floor(parsedLimit), 50);
};

// ========================================
// SEARCH LEADS
// ========================================

const searchLeads = async ({
  user,
  q,
  limit = 10,
}) => {
  const scope = getLeadScope(user);
  const safeLimit = getSafeLimit(limit);

  return prisma.lead.findMany({
    where: {
      AND: [
        scope,

        {
          OR: [
            {
              customerName: {
                contains: q,
                mode: "insensitive",
              },
            },

            {
              mobile: {
                contains: q,
              },
            },
          ],
        },
      ],
    },

    select: {
      id: true,
      customerName: true,
      mobile: true,
      loanType: true,
      loanAmount: true,
      status: true,
      source: true,

      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    take: safeLimit,

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ========================================
// SEARCH APPLICATIONS
// ========================================

const searchApplications = async ({
  user,
  q,
  limit = 10,
}) => {
  const leadScope = getLeadScope(user);
  const safeLimit = getSafeLimit(limit);

  return prisma.loanApplication.findMany({
    where: {
      AND: [
        {
          lead: leadScope,
        },

        {
          OR: [
            {
              applicationNumber: {
                contains: q,
                mode: "insensitive",
              },
            },

            {
              lead: {
                customerName: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },

            {
              lead: {
                mobile: {
                  contains: q,
                },
              },
            },
          ],
        },
      ],
    },

    select: {
      id: true,
      applicationNumber: true,
      status: true,
      requestedAmount: true,
      sanctionedAmount: true,
      disbursedAmount: true,

      lead: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
        },
      },

      lender: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    take: safeLimit,

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ========================================
// SEARCH LOAN ACCOUNTS
// ========================================

const searchLoans = async ({
  user,
  q,
  limit = 10,
}) => {
  const leadScope = getLeadScope(user);
  const safeLimit = getSafeLimit(limit);

  return prisma.loanAccount.findMany({
    where: {
      AND: [
        {
          leads: leadScope,
        },

        {
          OR: [
            {
              loanAccountNumber: {
                contains: q,
                mode: "insensitive",
              },
            },

            {
              leads: {
                customerName: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },

            {
              leads: {
                mobile: {
                  contains: q,
                },
              },
            },
          ],
        },
      ],
    },

    select: {
      id: true,
      loanAccountNumber: true,
      principalAmount: true,
      disbursedAmount: true,
      status: true,
      disbursedAt: true,

      leads: {
        select: {
          id: true,
          customerName: true,
          mobile: true,
        },
      },

      Lender: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    take: safeLimit,

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ========================================
// GLOBAL SEARCH
// ========================================

const globalSearch = async ({
  user,
  q,
  type = "all",
  limit = 10,
}) => {
  q = String(q || "").trim();

  if (q.length < 2) {
    throw new ApiError(
      400,
      "Search query must contain at least 2 characters"
    );
  }

  const allowedTypes = ["all", "lead", "application", "loan"];
  const searchType = String(type || "all").toLowerCase();

  if (!allowedTypes.includes(searchType)) {
    throw new ApiError(
      400,
      "Search type must be all, lead, application, or loan"
    );
  }

  const safeLimit = getSafeLimit(limit);
  const [leads, applications, loans] = await Promise.all([
    searchType === "all" || searchType === "lead"
      ? searchLeads({ user, q, limit: safeLimit })
      : Promise.resolve([]),
    searchType === "all" || searchType === "application"
      ? searchApplications({ user, q, limit: safeLimit })
      : Promise.resolve([]),
    searchType === "all" || searchType === "loan"
      ? searchLoans({ user, q, limit: safeLimit })
      : Promise.resolve([]),
  ]);

  const formatAmount = (amount) =>
    amount === null || amount === undefined
      ? ""
      : `₹${Number(amount).toLocaleString("en-IN")}`;

  const items = [
    ...leads.map((lead) => ({
      type: "lead",
      id: lead.id,
      title: lead.customerName,
      subtitle: [lead.mobile, lead.loanType].filter(Boolean).join(" • "),
      meta: formatAmount(lead.loanAmount),
      status: lead.status,
    })),
    ...applications.map((application) => ({
      type: "application",
      id: application.id,
      title: application.applicationNumber,
      subtitle: [
        application.lead?.customerName,
        application.lead?.mobile,
      ].filter(Boolean).join(" • "),
      meta: [
        application.lender?.name,
        formatAmount(
          application.disbursedAmount ??
            application.sanctionedAmount ??
            application.requestedAmount
        ),
      ].filter(Boolean).join(" • "),
      status: application.status,
    })),
    ...loans.map((loan) => ({
      type: "loan",
      id: loan.id,
      title: loan.loanAccountNumber,
      subtitle: [
        loan.leads?.customerName,
        loan.leads?.mobile,
      ].filter(Boolean).join(" • "),
      meta: [
        loan.Lender?.name,
        formatAmount(loan.disbursedAmount),
      ].filter(Boolean).join(" • "),
      status: loan.status,
    })),
  ];

  return {
    query: q,
    type: searchType,
    items,

    leads,
    applications,
    loans,

    counts: {
      leads: leads.length,
      applications: applications.length,
      loans: loans.length,
      total:
        leads.length +
        applications.length +
        loans.length,
    },
  };
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  getLeadScope,
  searchLeads,
  searchApplications,
  searchLoans,
  globalSearch,
};
