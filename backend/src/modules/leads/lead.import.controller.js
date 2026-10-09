
const fs = require("fs/promises");

const {
  redisConnection,
} = require("../../config/redis");
const {
  leadImportQueue,
} = require("../../queues/lead-import.queue");
const ApiError = require("../../utils/ApiError");

const {
  getJobStatus,
} = require("../../queues/job.service");

const assertImportQueueAvailable = async () => {
  if (redisConnection.status !== "ready") {
    throw new ApiError(
      503,
      "Lead import queue is unavailable. Please try again shortly."
    );
  }

  let timeout;

  try {
    await Promise.race([
      redisConnection.ping(),
      new Promise((resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Redis health check timed out")),
          2000
        );
      }),
    ]);
  } catch {
    throw new ApiError(
      503,
      "Lead import queue is unavailable. Please try again shortly."
    );
  } finally {
    clearTimeout(timeout);
  }
};

// ========================================
// IMPORT LEADS
// ========================================

const importLeadsController = async (
  req,
  res,
  next
) => {
  try {
    // ======================================
    // 1. FILE CHECK
    // ======================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a CSV, XLS or XLSX file",
      });
    }

    // ======================================
    // 2. USER CHECK
    // ======================================

    if (
      !req.user ||
      !req.user.userId
    ) {
      // Multer ne file save kar di hai,
      // unauthorized hone par temporary file delete karo.
      await fs.rm(req.file.path, {
        force: true,
      });

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ======================================
    // 3. ADD IMPORT JOB TO BULLMQ
    // ======================================

    await assertImportQueueAvailable();

    const job =
      await leadImportQueue.add(
        "process-leads",
        {
          filePath:
            req.file.path,

          originalName:
            req.file.originalname,

          userId:
            req.user.userId,

          assignedToId:
            req.body.assignedToId || null,
        }
      );

    // ======================================
    // 4. RESPONSE
    // ======================================

    return res.status(202).json({
      success: true,

      message:
        "Lead import queued successfully",

      data: {
        jobId: job.id,

        fileName:
          req.file.originalname,
      },
    });
  } catch (error) {
    // ======================================
    // 5. CLEANUP IF QUEUE FAILS
    // ======================================

    if (req.file?.path) {
      await fs.rm(req.file.path, {
        force: true,
      });
    }

    next(error);
  }
};

// ========================================
// GET IMPORT STATUS
// ========================================

const getImportStatusController =
  async (
    req,
    res,
    next
  ) => {
    try {
      // ====================================
      // 1. GET JOB ID
      // ====================================

      const {
        jobId,
      } = req.params;

      // ====================================
      // 2. JOB ID CHECK
      // ====================================

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message:
            "Job ID is required",
        });
      }

      // ====================================
      // 3. GET JOB STATUS
      // ====================================

      const jobStatus =
        await getJobStatus(leadImportQueue, jobId);

      // ====================================
      // 4. JOB NOT FOUND
      // ====================================

      if (!jobStatus) {
        return res.status(404).json({
          success: false,
          message:
            "Import job not found",
        });
      }

      const job = await leadImportQueue.getJob(jobId);
      if (
        job.data.userId !== req.user.userId &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(404).json({
          success: false,
          message: "Import job not found",
        });
      }

      // ====================================
      // 5. RESPONSE
      // ====================================

      return res.status(200).json({
        success: true,

        data: {
          id:
            jobStatus.id,

          name:
            jobStatus.name,

          state:
            jobStatus.state,

          progress:
            jobStatus.progress,

          result:
            jobStatus.result,

          failedReason:
            jobStatus.failedReason,
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
  importLeadsController,
  getImportStatusController,
};
