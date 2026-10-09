const {
  exportQueue,
} = require("../../queues/export.queue");

// ========================================
// EXPORT LEADS
// ========================================

const exportLeadsController =
  async (req, res, next) => {
    try {
      // ======================================
      // USER CHECK
      // ======================================

      if (
        !req.user ||
        !req.user.userId
      ) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ======================================
      // FILTERS
      // ======================================

      const filters = {
        status:
          req.query.status ||
          null,

        loanType:
          req.query.loanType ||
          null,

        source:
          req.query.source ||
          null,
      };

      // ======================================
      // ADD JOB TO QUEUE
      // ======================================

      const job =
        await exportQueue.add(
          "export-leads",
          {
            user: {
              userId:
                req.user.userId,

              role:
                req.user.role,
            },

            filters,
          }
        );

      // ======================================
      // RESPONSE
      // ======================================

      return res.status(202).json({
        success: true,

        message:
          "Lead export queued successfully",

        data: {
          jobId:
            job.id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ========================================
// EXPORT
// ========================================

module.exports = {
  exportLeadsController,
};