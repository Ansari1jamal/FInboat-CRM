const fs = require("fs/promises");

const {
  Worker,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

const {
  processLeadImport,
} = require(
  "../modules/leads/lead.import.service"
);

// ========================================
// LEAD IMPORT WORKER
// ========================================

const leadImportWorker =
  new Worker(
    "lead-import",

    async (job) => {
      const {
        filePath,
        originalName,
        userId,
        assignedToId,
      } = job.data;

      console.log(
        `Processing lead import job ${job.id}`
      );

      try {
        // ==================================
        // 1. START
        // ==================================

        await job.updateProgress(10);

        // ==================================
        // 2. READ FILE
        // ==================================

        console.log(
          `Reading import file: ${originalName}`
        );

        const buffer =
          await fs.readFile(
            filePath
          );

        await job.updateProgress(25);

        // ==================================
        // 3. PROCESS IMPORT
        // ==================================

        const result =
          await processLeadImport({
            buffer,
            originalName,
            userId,
            assignedToId,
            onProgress: (progress) =>
              job.updateProgress(progress),
          });

        // ==================================
        // 4. COMPLETE
        // ==================================

        await job.updateProgress(100);

        console.log(
          `Lead import job ${job.id} completed`
        );

        const completedResult = {
          ...result,

          fileName:
            originalName,

          jobId:
            job.id,
        };

        if (filePath) {
          await fs.rm(filePath, { force: true });
          console.log(
            `Temporary import file deleted: ${filePath}`
          );
        }

        return completedResult;
      } catch (error) {
        const maxAttempts = job.opts.attempts || 1;
        const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts;

        if (filePath && isFinalAttempt) {
          try {
            await fs.rm(filePath, { force: true });
            console.log(
              `Temporary import file deleted after final failure: ${filePath}`
            );
          } catch (cleanupError) {
            console.error(
              `Unable to delete failed import file: ${filePath}`,
              cleanupError
            );
          }
        }

        throw error;
      }
    },

    {
      connection:
        redisConnection,

      concurrency: 2,
    }
  );

// ========================================
// EVENTS
// ========================================

leadImportWorker.on(
  "completed",
  (job) => {
    console.log(
      `Lead import completed: ${job.id}`
    );
  }
);

leadImportWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Lead import failed: ${job?.id}`,
      error
    );
  }
);

leadImportWorker.on(
  "error",
  (error) => {
    console.error(
      "Lead import worker error:",
      error
    );
  }
);

// ========================================
// EXPORT
// ========================================

module.exports = {
  leadImportWorker,
};