import { TIMELINE_EVENT_TITLES } from "./timeline.constants";

export const formatTimelineDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getTimelineTitle = (event) =>
  event.title || TIMELINE_EVENT_TITLES[event.type] || "Activity";

export const getTimelineDescription = (event) =>
  event.description || event.message || "Activity recorded";

export const getTimelineActor = (event) =>
  event.actor?.name ||
  event.user?.name ||
  event.createdBy?.name ||
  "System";

export const formatTimelineMetadataValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(formatTimelineMetadataValue).join(", ");
    }

    return value.name || value.label || JSON.stringify(value);
  }

  return String(value);
};
