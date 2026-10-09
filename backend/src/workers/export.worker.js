const fs = require("fs/promises");
const path = require("path");

const {
  Worker,
} = require("bullmq");

const {
  redisConnection,
} = require("../config/redis");

const {
  exportLeads,
  createLeadExcel,
} = require(
  "../modules/leads/lead.export.service"
);

// ========================================
// EXPORT WORKER
// ========================================

const exportWorker =
  new Worker(
    "export",

    async (job) => {
      const {
        user,
        filters = {},
      } = job.data;

      console.log(
        `Processing export job ${job.id}`
      );

      // ======================================
      // PROGRESS 10%
      // ======================================

      await job.updateProgress(10);

      console.log(
        `Fetching leads for export job ${job.id}`
      );

      // ======================================
      // FETCH LEADS
      // ======================================

      const leads =
        await exportLeads({
          user,
          filters,
        });

      await job.updateProgress(40);

      // ======================================
      // CREATE EXCEL
      // ======================================

      console.log(
        `Generating XLSX for export job ${job.id}`
      );

      const buffer =
        await createLeadExcel(
          leads
        );

      await job.updateProgress(70);

      // ======================================
      // EXPORT DIRECTORY
      // ======================================

      const exportDirectory =
        path.join(
          process.cwd(),
          "storage",
          "exports"
        );

      await fs.mkdir(
        exportDirectory,
        {
          recursive: true,
        }
      );

      // ======================================
      // FILE NAME
      // ======================================

      const fileName =
        `leads-export-${job.id}-${Date.now()}.xlsx`;

      const filePath =
        path.join(
          exportDirectory,
          fileName
        );

      // ======================================
      // SAVE FILE
      // ======================================

      await fs.writeFile(
        filePath,
        buffer
      );

      await job.updateProgress(90);

      // ======================================
      // COMPLETE
      // ======================================

      await job.updateProgress(100);

      console.log(
        `Export job ${job.id} completed`
      );

      return {
        success: true,

        jobId:
          job.id,

        fileName,

        filePath,

        totalRows:
          leads.length,
      };
    },

    {
      connection:
        redisConnection,

      concurrency: 2,
    }
  );

// ========================================
// COMPLETED
// ========================================

exportWorker.on(
  "completed",
  (job) => {
    console.log(
      `Export job completed: ${job.id}`
    );
  }
);

// ========================================
// FAILED
// ========================================

exportWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Export job failed: ${job?.id}`,
      error
    );
  }
);

// ========================================
// ERROR
// ========================================

exportWorker.on(
  "error",
  (error) => {
    console.error(
      "Export worker error:",
      error
    );
  }
);

// ========================================
// EXPORT
// ========================================

module.exports = {
  exportWorker,
};