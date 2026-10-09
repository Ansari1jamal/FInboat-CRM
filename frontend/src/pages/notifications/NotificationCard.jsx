import {
  getNotificationIcon,
  getRelativeNotificationTime,
} from "./notification.utils";

export default function NotificationCard({
  notification,
  onRead,
  onAction,
}) {
  const {
    id,
    type,
    title,
    message,
    isRead,
    readAt,
    createdAt,
    actionUrl,
  } = notification;

  const handleClick = async () => {
    if (!isRead) {
      await onRead(id);
    }

    if (actionUrl) {
      onAction(actionUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${isRead ? "Open" : "Mark as read and open"} notification: ${title || "Notification"}`}
      className={`block w-full border-b p-4 text-left transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
        !isRead ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="flex gap-3">
        {/* ICON */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
          {getNotificationIcon(type)}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-sm ${
                !isRead
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {title || "Notification"}
            </h3>

            {!isRead && (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
            )}
          </div>

          <p className="mt-1 text-sm text-gray-600">
            {message}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            {getRelativeNotificationTime(createdAt || readAt)}
          </p>
        </div>
      </div>
    </button>
  );
}