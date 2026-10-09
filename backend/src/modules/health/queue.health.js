const { leadImportQueue } = require("../../queues/lead-import.queue");
const { exportQueue } = require("../../queues/export.queue");
const { reminderQueue } = require("../../queues/reminder.queue");
const { notificationQueue } = require("../../queues/notification.queue");

const queues = {
  leadImport: leadImportQueue,
  export: exportQueue,
  reminder: reminderQueue,
  notification: notificationQueue,
};

const getQueueHealth = async () => {
  const entries = await Promise.all(
    Object.entries(queues).map(async ([name, queue]) => [
      name,
      await queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed"
      ),
    ])
  );

  return Object.fromEntries(entries);
};

module.exports = {
  getQueueHealth,
};
