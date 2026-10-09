// ========================================
// JOB STATUS SERVICE
// ========================================

const getJobStatus = async (
  queue,
  jobId
) => {
  const job =
    await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state =
    await job.getState();

  return {
    id: job.id,

    name: job.name,

    state,

    progress:
      job.progress,

    result:
      job.returnvalue || null,

    failedReason:
      job.failedReason || null,
  };
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  getJobStatus,
};