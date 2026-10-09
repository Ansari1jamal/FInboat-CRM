export const getNotificationIcon = (type) => {
  switch (type) {
    case "FOLLOW_UP_REMINDER":
      return "📞";

    case "LEAD_ASSIGNED":
      return "👤";

    case "TARGET_ALERT":
      return "🎯";

    case "EMI_DUE_SOON":
      return "💰";

    case "EMI_DUE_TODAY":
      return "💳";

    case "EMI_OVERDUE":
      return "⚠️";

    case "SYSTEM":
      return "⚙️";

    default:
      return "🔔";
  }
};

// ========================================
// FORMAT DATE
// ========================================

export const formatNotificationDate = (date) => {
  if (!date) return "";

  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return "";
  }

  return notificationDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ========================================
// RELATIVE TIME
// ========================================

export const getRelativeNotificationTime = (date) => {
  if (!date) return "";

  const now = Date.now();
  const notificationTime = new Date(date).getTime();

  if (Number.isNaN(notificationTime)) {
    return "";
  }

  const diff = Math.floor(
    (now - notificationTime) / 1000
  );

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)} min ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hr ago`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return formatNotificationDate(date);
};