require(
  "./workers/lead-import.worker"
);

require(
  "./workers/export.worker"
);

require(
  "./workers/reminder.worker"
);

require(
  "./workers/notification.worker"
);

console.log(
  "FinBoat background workers started"
);