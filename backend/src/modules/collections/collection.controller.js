
const collectionService =
  require("./collection.service");

const asyncHandler =
  require("../../utils/asyncHandler");

// ======================================================
// Create Collection Follow-up
// ======================================================

const createCollectionFollowUp =
  asyncHandler(
    async (req, res) => {
      const body =
        req.validated?.body || {};

      const params =
        req.validated?.params || {};

      const result =
        await collectionService.createCollectionFollowUp({
          loanAccountId:
            params.loanAccountId,

          emiScheduleId:
            body.emiScheduleId,

          assignedToId:
            body.assignedToId ||
            req.user.userId,

          type:
            body.type,

          scheduledDate:
            body.scheduledDate,

          scheduledTime:
            body.scheduledTime,

          notes:
            body.notes,

          promisedAmount:
            body.promisedAmount,

          promisedDate:
            body.promisedDate,

          user:
            req.user,
        });

      return res.status(201).json({
        success: true,
        message:
          "Collection follow-up created successfully",
        data: result,
      });
    }
  );

// ======================================================
// Get Collection Follow-ups
// ======================================================

const getCollectionFollowUps =
  asyncHandler(
    async (req, res) => {
      const query =
        req.validated?.query || {};

      const result =
        await collectionService.getCollectionFollowUps({
          user: req.user,

          status:
            query.status,

          loanAccountId:
            query.loanAccountId,

          page:
            query.page || 1,

          limit:
            query.limit || 20,
        });

      return res.json({
        success: true,
        ...result,
      });
    }
  );

const getCollectionFollowUpById =
  asyncHandler(
    async (req, res) => {
      const result =
        await collectionService.getCollectionFollowUpById({
          id: req.validated?.params?.id,
          user: req.user,
        });

      return res.json({
        success: true,
        data: result,
      });
    }
  );

const getDueEmis =
  asyncHandler(
    async (req, res) => {
      const query = req.validated?.query || {};
      const result =
        await collectionService.getDueEmis({
          user: req.user,
          page: query.page,
          limit: query.limit,
        });

      return res.json({
        success: true,
        ...result,
      });
    }
  );

// ======================================================
// Update Collection Follow-up
// ======================================================

const updateCollectionFollowUp =
  asyncHandler(
    async (req, res) => {
      const body =
        req.validated?.body || {};

      const params =
        req.validated?.params || {};

      const result =
        await collectionService.updateCollectionFollowUp({
          id:
            params.id,

          status:
            body.status,

          notes:
            body.notes,

          promisedAmount:
            body.promisedAmount,

          promisedDate:
            body.promisedDate,

          user:
            req.user,
        });

      return res.json({
        success: true,
        message:
          "Collection follow-up updated successfully",
        data: result,
      });
    }
  );

// ======================================================
// Collection Summary
// ======================================================

const getCollectionSummary =
  asyncHandler(
    async (req, res) => {
      const result =
        await collectionService.getCollectionSummary({
          user: req.user,
        });

      const outstanding =
        await collectionService.getOutstandingCollection({
          user: req.user,
        });

      return res.json({
        success: true,

        data: {
          ...result,
          ...outstanding,
        },
      });
    }
  );

// ======================================================
// Exports
// ======================================================

module.exports = {
  createCollectionFollowUp,
  getCollectionFollowUps,
  getCollectionFollowUpById,
  getDueEmis,
  updateCollectionFollowUp,
  getCollectionSummary,
};
