const XLSX = require("xlsx");
const { prisma } = require("../../config/db");
const leadService = require("./lead.service");
const ApiError = require("../../utils/ApiError");

const MAX_IMPORT_ROWS = 5000;
const MAX_REPORTED_ERRORS = 100;
const ALLOWED_LEAD_STATUSES = new Set([
  "NEW",
  "INTERESTED",
  "DOCUMENTS_PENDING",
  "LOGIN",
  "APPROVED",
  "DISBURSED",
  "REJECTED",
]);

const normalizeHeader = (header) =>
  String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const headerAliases = {
  customername: "customerName",
  customer: "customerName",
  name: "customerName",
  fullname: "customerName",
  mobile: "mobile",
  phone: "mobile",
  phonenumber: "mobile",
  loantype: "loanType",
  loanamount: "loanAmount",
  amount: "loanAmount",
  source: "source",
  status: "status",
};

const parseImportRows = (buffer, originalName) => {
  let workbook;

  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });
  } catch {
    throw new ApiError(400, "Unable to read the uploaded spreadsheet");
  }

  const firstSheetName = workbook.SheetNames[0];
  const sheet = firstSheetName && workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new ApiError(400, "The uploaded file has no worksheet data");
  }

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  if (matrix.length < 2) {
    throw new ApiError(400, "The file must contain a header and at least one lead row");
  }

  const headers = matrix[0].map((header) => {
    const key = normalizeHeader(header);
    return headerAliases[key] || null;
  });

  const requiredHeaders = ["customerName", "mobile", "loanType", "loanAmount"];
  const missingHeaders = requiredHeaders.filter(
    (required) => !headers.includes(required)
  );

  if (missingHeaders.length > 0) {
    throw new ApiError(
      400,
      `Missing required columns: ${missingHeaders.join(", ")}`
    );
  }

  const rows = matrix.slice(1).map((values, index) => {
    const row = {};
    headers.forEach((field, columnIndex) => {
      if (field) {
        row[field] = values[columnIndex] ?? "";
      }
    });

    return {
      rowNumber: index + 2,
      row,
    };
  }).filter(({ row }) =>
    Object.values(row).some((value) => String(value).trim() !== "")
  );

  if (rows.length > MAX_IMPORT_ROWS) {
    throw new ApiError(
      400,
      `The file exceeds the ${MAX_IMPORT_ROWS} row import limit`
    );
  }

  if (rows.length === 0) {
    throw new ApiError(400, "The file contains no lead rows");
  }

  return {
    rows,
    fileName: originalName,
  };
};

const processLeadImport = async ({
  buffer,
  originalName,
  userId,
  assignedToId,
  onProgress,
}) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiError(400, "The uploaded file is empty");
  }

  const { rows } = parseImportRows(buffer, originalName);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Importing user is unavailable");
  }

  let imported = 0;
  let duplicates = 0;
  let failed = 0;
  const errors = [];

  for (let index = 0; index < rows.length; index += 1) {
    const { rowNumber, row } = rows[index];
    const customerName = String(row.customerName || "").trim();
    const mobile = String(row.mobile || "").replace(/\D/g, "").slice(-10);
    const loanType = String(row.loanType || "").trim().toUpperCase();
    const loanAmount = Number(
      String(row.loanAmount || "").replace(/[,\s₹]/g, "")
    );
    const status = String(row.status || "NEW").trim().toUpperCase();

    const validationError =
      customerName.length < 2
        ? "Customer name must contain at least 2 characters"
        : !/^\d{10}$/.test(mobile)
          ? "Mobile must contain 10 digits"
          : !loanType
            ? "Loan type is required"
            : !Number.isFinite(loanAmount) || loanAmount <= 0
              ? "Loan amount must be a positive number"
              : !ALLOWED_LEAD_STATUSES.has(status)
                ? "Status is not a valid lead status"
                : null;

    if (validationError) {
      failed += 1;
      if (errors.length < MAX_REPORTED_ERRORS) {
        errors.push({
          row: rowNumber,
          message: validationError,
        });
      }
    } else {
      try {
        const result = await leadService.createLead({
          customerName,
          mobile,
          loanType,
          loanAmount,
          source: String(row.source || "BULK_IMPORT").trim(),
          status,
          assignedToId: assignedToId || undefined,
          createdBy: user.id,
          createdByRole: user.role,
        });

        if (result.isDuplicate) {
          duplicates += 1;
        } else {
          imported += 1;
        }
      } catch (error) {
        if (!error.statusCode || error.statusCode >= 500) {
          throw error;
        }

        failed += 1;
        if (errors.length < MAX_REPORTED_ERRORS) {
          errors.push({
            row: rowNumber,
            message: error.message || "Unable to import this row",
          });
        }
      }
    }

    if (onProgress) {
      await onProgress(Math.round(((index + 1) / rows.length) * 100));
    }
  }

  return {
    fileName: originalName,
    totalRows: rows.length,
    imported,
    duplicates,
    failed,
    errors,
    errorsTruncated: failed > errors.length,
  };
};

module.exports = {
  parseImportRows,
  processLeadImport,
};
