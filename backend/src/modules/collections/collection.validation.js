
const { z } = require("zod");

// ======================================================
// COMMON PARAMS
// ======================================================

const loanAccountIdParams = z.object({
  loanAccountId: z
    .string()
    .trim()
    .min(
      1,
      "Loan account ID is required"
    ),
});

const collectionFollowUpIdParams =
  z.object({
    id: z
      .string()
      .trim()
      .min(
        1,
        "Collection follow-up ID is required"
      ),
  });

// ======================================================
// DATE VALIDATION HELPER
// ======================================================

const validDateString = (message) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) =>
        !Number.isNaN(
          new Date(value).getTime()
        ),
      "Invalid date"
    );

// ======================================================
// COLLECTION FOLLOW-UP TYPES
// ======================================================

const collectionFollowUpType =
  z.enum([
    "EMI_DUE",
    "EMI_OVERDUE",
    "PAYMENT_PROMISE",
    "COLLECTION_CALL",
  ]);

// ======================================================
// COLLECTION FOLLOW-UP STATUSES
// ======================================================

const collectionFollowUpStatus =
  z.enum([
    "PENDING",
    "CONTACTED",
    "PROMISED",
    "PAID",
    "MISSED",
    "CANCELLED",
  ]);

// ======================================================
// CREATE COLLECTION FOLLOW-UP
// ======================================================

const createCollectionFollowUpSchema =
  z.object({
    body: z.object({
      emiScheduleId: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

      assignedToId: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

      type:
        collectionFollowUpType,

      scheduledDate:
        validDateString(
          "Scheduled date is required"
        ),

      scheduledTime: z
        .string()
        .trim()
        .min(
          1,
          "Scheduled time is required"
        ),

      notes: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

      promisedAmount:
        z.coerce
          .number()
          .positive(
            "Promised amount must be greater than 0"
          )
          .optional(),

      promisedDate:
        validDateString(
          "Invalid promised date"
        ).optional(),
    }),

    params:
      loanAccountIdParams,

    query: z.object({}),
  });

// ======================================================
// GET COLLECTION FOLLOW-UPS
// ======================================================

const getCollectionFollowUpsSchema =
  z.object({
    body: z.object({}),

    params: z.object({}),

    query: z.object({
      status:
        collectionFollowUpStatus
          .optional(),

      loanAccountId: z
        .string()
        .trim()
        .optional(),

      page: z.coerce
        .number()
        .int()
        .min(
          1,
          "Page must be at least 1"
        )
        .default(1),

      limit: z.coerce
        .number()
        .int()
        .min(
          1,
          "Limit must be at least 1"
        )
        .max(
          100,
          "Limit cannot exceed 100"
        )
        .default(20),
    }),
  });

const getCollectionFollowUpByIdSchema =
  z.object({
    body: z.object({}),
    params: collectionFollowUpIdParams,
    query: z.object({}),
  });

const getDueEmisSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// ======================================================
// UPDATE COLLECTION FOLLOW-UP
// ======================================================

const updateCollectionFollowUpSchema =
  z.object({
    body: z.object({
      status:
        collectionFollowUpStatus
          .optional(),

      notes: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

      promisedAmount:
        z.coerce
          .number()
          .positive(
            "Promised amount must be greater than 0"
          )
          .optional(),

      promisedDate:
        validDateString(
          "Invalid promised date"
        ).optional(),
    }),

    params:
      collectionFollowUpIdParams,

    query: z.object({}),
  });

// ======================================================
// COLLECTION SUMMARY
// ======================================================

const collectionSummarySchema =
  z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  });

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createCollectionFollowUpSchema,
  getCollectionFollowUpsSchema,
  getCollectionFollowUpByIdSchema,
  getDueEmisSchema,
  updateCollectionFollowUpSchema,
  collectionSummarySchema,
};
