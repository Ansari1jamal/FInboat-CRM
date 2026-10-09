const { z } = require("zod");

// ========================================
// CREATE LEAD VALIDATION
// ========================================

const createLeadSchema = z.object({
  body: z.object({
    customerName: z
      .string()
      .trim()
      .min(
        2,
        "Customer name is required"
      ),

    mobile: z
      .string()
      .trim()
      .regex(
        /^\d{10}$/,
        "Mobile must be 10 digits"
      ),

    loanType: z
      .string()
      .trim()
      .min(
        1,
        "Loan type is required"
      ),

    loanAmount: z.coerce
      .number()
      .positive(
        "Loan amount must be positive"
      ),

    source: z
      .string()
      .trim()
      .optional(),

    assignedToId: z
      .string()
      .optional(),

    assignedTeamId: z
      .string()
      .optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

// ========================================
// LEAD ID VALIDATION
// ========================================

const leadIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: z
      .string()
      .min(
        1,
        "Lead ID is required"
      ),
  }),

  query: z.object({}),
});

// ========================================
// LEAD LIST QUERY VALIDATION
// ========================================

// ========================================
// LEAD LIST QUERY VALIDATION
// ========================================

const leadListSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    // Search by customer name / mobile
    search: z
      .string()
      .trim()
      .optional(),

    // Lead status filter
    status: z
      .string()
      .trim()
      .optional(),

    // Loan type filter
    loanType: z
      .string()
      .trim()
      .optional(),

    fromDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "fromDate must use YYYY-MM-DD format")
      .optional(),

    toDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "toDate must use YYYY-MM-DD format")
      .optional(),

    // Pagination
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    // Sorting
    sortOrder: z
      .enum([
        "asc",
        "desc",
      ])
      .default("desc"),
  }),
});

// ========================================
// EXPORT
// ========================================

module.exports = {
  createLeadSchema,
  leadIdSchema,
  leadListSchema,
};