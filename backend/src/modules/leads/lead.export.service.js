
const { prisma } = require("../../config/db");
const XLSX = require("xlsx");
const ApiError = require("../../utils/ApiError");

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

// ========================================
// LEAD ROLE SCOPE
// ========================================

const getLeadScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new Error(
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
// EXPORT LEADS
// ========================================

const exportLeads = async ({
  user,
  filters = {},
}) => {
  const where = {
    ...getLeadScope(user),
  };

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Loan type filter
  if (filters.loanType) {
    where.loanType = filters.loanType;
  }

  // Source filter
  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.search) {
    where.OR = [
      {
        customerName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        mobile: {
          contains: filters.search,
        },
      },
    ];
  }

  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};

    if (filters.fromDate) {
      const startDate = new Date(`${filters.fromDate}T00:00:00`);

      if (!isValidDateOnly(filters.fromDate)) {
        throw new ApiError(400, "Invalid fromDate");
      }

      where.createdAt.gte = startDate;
    }

    if (filters.toDate) {
      const endDate = new Date(`${filters.toDate}T00:00:00`);

      if (!isValidDateOnly(filters.toDate)) {
        throw new ApiError(400, "Invalid toDate");
      }

      endDate.setDate(endDate.getDate() + 1);
      where.createdAt.lt = endDate;
    }

    if (
      where.createdAt.gte &&
      where.createdAt.lt &&
      where.createdAt.gte >= where.createdAt.lt
    ) {
      throw new ApiError(400, "fromDate must be on or before toDate");
    }
  }

  const leads = await prisma.lead.findMany({
    where,

    include: {
      assignedTo: {
        select: {
          name: true,
          role: true,
        },
      },

      assignedTeam: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return leads;
};

// ========================================
// CREATE LEAD EXCEL
// ========================================

const createLeadExcel = (leads) => {
  const rows = leads.map((lead) => ({
    Customer: lead.customerName || "",

    Mobile: lead.mobile || "",

    LoanType: lead.loanType || "",

    LoanAmount:
      lead.loanAmount !== null &&
      lead.loanAmount !== undefined
        ? Number(lead.loanAmount)
        : "",

    Source: lead.source || "",

    Status: lead.status || "",

    AssignedTo:
      lead.assignedTo?.name || "",

    AssignedRole:
      lead.assignedTo?.role || "",

    Team:
      lead.assignedTeam?.name || "",

    CreatedAt: lead.createdAt
      ? new Date(lead.createdAt).toISOString()
      : "",
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Leads"
  );

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
};

const createLeadCSV = (leads) => {
  const rows = leads.map((lead) => ({
    Customer: lead.customerName || "",
    Mobile: lead.mobile || "",
    LoanType: lead.loanType || "",
    LoanAmount:
      lead.loanAmount !== null && lead.loanAmount !== undefined
        ? Number(lead.loanAmount)
        : "",
    Source: lead.source || "",
    Status: lead.status || "",
    AssignedTo: lead.assignedTo?.name || "",
    AssignedRole: lead.assignedTo?.role || "",
    Team: lead.assignedTeam?.name || "",
    CreatedAt: lead.createdAt
      ? new Date(lead.createdAt).toISOString()
      : "",
  }));

  return XLSX.utils.sheet_to_csv(
    XLSX.utils.json_to_sheet(rows)
  );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  exportLeads,
  createLeadExcel,
  createLeadCSV,
};
