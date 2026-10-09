const { z } = require("zod");

// ========================================
// LOAN ACCOUNT ID
// ========================================

const loanAccountIdParams = z.object({
  loanAccountId: z
    .string()
    .trim()
    .min(
      1,
      "Loan account ID is required"
    ),
});

// ========================================
// GENERATE EMI SCHEDULE
// ========================================

const generateEmiScheduleSchema = z.object({
  body: z.object({
    interestRate: z.coerce
      .number()
      .min(
        0,
        "Interest rate cannot be negative"
      ),

    tenureMonths: z.coerce
      .number()
      .int()
      .positive(
        "Tenure months must be a positive number"
      ),

    firstEmiDate: z
      .string()
      .trim()
      .min(
        1,
        "First EMI date is required"
      )
      .refine(
        (value) =>
          !Number.isNaN(
            new Date(value).getTime()
          ),
        "Invalid first EMI date"
      ),
  }),

  params: loanAccountIdParams,

  query: z.object({}),
});

// ========================================
// GET EMI SCHEDULE
// ========================================

const getEmiScheduleSchema = z.object({
  body: z.object({}),

  params: loanAccountIdParams,

  query: z.object({}),
});

const getRepaymentsSchema = z.object({
  body: z.object({}),
  params: loanAccountIdParams,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const getRepaymentByIdSchema = z.object({
  body: z.object({}),
  params: loanAccountIdParams.extend({
    repaymentId: z.string().trim().min(1),
  }),
  query: z.object({}),
});

// ========================================
// CREATE REPAYMENT
// ========================================

const createRepaymentSchema = z.object({
  body: z.object({
    emiScheduleId: z
      .string()
      .trim()
      .min(
        1,
        "EMI schedule ID is required"
      ),

    amount: z.coerce
      .number()
      .positive(
        "Repayment amount must be greater than 0"
      ),

    paymentDate: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => value === undefined || !Number.isNaN(new Date(value).getTime()),
        "Invalid payment date"
      ),

    paymentMode: z
      .string()
      .trim()
      .min(
        1,
        "Payment mode is required"
      ),

    transactionId: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    referenceNumber: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),

    remarks: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  }),

  params: loanAccountIdParams,

  query: z.object({}),
});

// ========================================
// LOAN REPAYMENT SUMMARY
// ========================================

const loanRepaymentSummarySchema =
  z.object({
    body: z.object({}),

    params: loanAccountIdParams,

    query: z.object({}),
  });

// ========================================
// EXPORT
// ========================================

module.exports = {
  generateEmiScheduleSchema,
  getEmiScheduleSchema,
  getRepaymentsSchema,
  getRepaymentByIdSchema,
  createRepaymentSchema,
  loanRepaymentSummarySchema,
};