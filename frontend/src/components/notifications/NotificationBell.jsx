import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

import {
  getUnreadNotificationCountApi,
} from "../../services/notifications.api";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [countAvailable, setCountAvailable] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCountApi();
      const count = Number(
        response?.data?.unreadCount ??
          response?.data?.count ??
          response?.unreadCount ??
          response?.count
      );

      if (!Number.isFinite(count) || count < 0) {
        throw new Error("Unread notification count response is invalid");
      }

      setUnreadCount(count);
      setCountAvailable(true);
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
      setCountAvailable(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      loadUnreadCount();
    }, 0);

    const interval = setInterval(
      loadUnreadCount,
      60000
    );

    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadUnreadCount]);

  return (
    <button
      type="button"
      onClick={() => navigate("/notifications")}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={
        countAvailable && unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      title="Notifications"
    >
      <FaBell size={18} aria-hidden="true" />

      {countAvailable && unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}