
const { prisma } = require("../../config/db");

const XLSX = require("xlsx");

// ========================================
// APPLICATION ROLE SCOPE
// ========================================

const getApplicationScope = (user) => {
  if (!user || !user.userId || !user.role) {
    throw new Error(
      "Authenticated user information is missing"
    );
  }

  // ADMIN -> All applications
  if (user.role === "ADMIN") {
    return {};
  }

  // MANAGER -> Own team applications
  if (user.role === "MANAGER") {
    return {
      lead: {
        assignedTo: {
          managerId: user.userId,
        },
      },
    };
  }

  // TL -> Own telecaller applications
  if (user.role === "TL") {
    return {
      lead: {
        assignedTo: {
          tlId: user.userId,
        },
      },
    };
  }

  // TELECALLER -> Own leads applications
  if (user.role === "TELECALLER") {
    return {
      lead: {
        assignedToId: user.userId,
      },
    };
  }

  // Unknown role -> No access
  return {
    id: "__NO_ACCESS__",
  };
};

// ========================================
// EXPORT APPLICATIONS
// ========================================

const exportApplications = async ({
  user,
  filters = {},
}) => {
  const where = {
    ...getApplicationScope(user),
  };

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Date filter
  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};

    if (filters.fromDate) {
      where.createdAt.gte = new Date(
        filters.fromDate
      );
    }

    if (filters.toDate) {
      const toDate = new Date(
        filters.toDate
      );

      toDate.setHours(
        23,
        59,
        59,
        999
      );

      where.createdAt.lte = toDate;
    }
  }

  const applications =
    await prisma.loanApplication.findMany({
      where,

      include: {
        lead: {
          select: {
            customerName: true,
            mobile: true,
            loanType: true,
          },
        },

        lender: {
          select: {
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return applications;
};

// ========================================
// FORMAT APPLICATION ROW
// ========================================

const formatApplicationRow = (
  application
) => {
  return {
    "Application Number":
      application.applicationNumber || "",

    Customer:
      application.lead?.customerName || "",

    Mobile:
      application.lead?.mobile || "",

    "Loan Type":
      application.lead?.loanType || "",

    Lender:
      application.lender?.name || "",

    Status:
      application.status || "",

    "Requested Amount":
      application.requestedAmount !== null &&
      application.requestedAmount !== undefined
        ? Number(
            application.requestedAmount
          )
        : "",

    "Sanctioned Amount":
      application.sanctionedAmount !== null &&
      application.sanctionedAmount !== undefined
        ? Number(
            application.sanctionedAmount
          )
        : "",

    "Disbursed Amount":
      application.disbursedAmount !== null &&
      application.disbursedAmount !== undefined
        ? Number(
            application.disbursedAmount
          )
        : "",

    "Login Date":
      application.loginDate || "",

    "Approval Date":
      application.approvalDate || "",

    "Disbursement Date":
      application.disbursementDate || "",

    "Created At":
      application.createdAt || "",
  };
};

// ========================================
// CREATE APPLICATION EXCEL
// ========================================

const createApplicationExcel = (
  applications
) => {
  const rows =
    applications.map(
      formatApplicationRow
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Applications"
  );

  return XLSX.write(
    workbook,
    {
      type: "buffer",
      bookType: "xlsx",
    }
  );
};

// ========================================
// CREATE APPLICATION CSV
// ========================================

const createApplicationCSV = (
  applications
) => {
  const rows =
    applications.map(
      formatApplicationRow
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  return XLSX.utils.sheet_to_csv(
    worksheet
  );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  exportApplications,
  createApplicationExcel,
  createApplicationCSV,
};

