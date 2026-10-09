import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "../../services/notifications.api";

import NotificationCard from "./NotificationCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const page = pagination.page;
  const limit = pagination.limit;

  // ========================================
  // LOAD NOTIFICATIONS
  // ========================================

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const params = {
        page,
        limit,
      };

      if (filter === "unread") {
        params.isRead = false;
      }

      const response =
        await getNotificationsApi(params);

      const data = response?.data || {};

      setNotifications(data.items || []);

      setPagination((prev) => ({
        ...prev,
        ...(data.pagination || {}),
      }));
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
      setLoadError(
        error?.response?.data?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, limit, page]);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [loadNotifications]);

  // ========================================
  // MARK AS READ
  // ========================================

  const handleRead = async (id) => {
    try {
      await markNotificationAsReadApi(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // ========================================
  // MARK ALL AS READ
  // ========================================

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await markAllNotificationsAsReadApi();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications:",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ========================================
  // ACTION
  // ========================================

  const handleAction = (actionUrl) => {
    if (!actionUrl) return;

    navigate(actionUrl);
  };

  // ========================================
  // UNREAD COUNT
  // ========================================

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  return (
    <div className="space-y-6">
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Follow-ups, EMI alerts, targets and system
            notifications
          </p>
        </div>

        <button
          type="button"
          disabled={markingAll || unreadCount === 0}
          onClick={handleMarkAllAsRead}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll
            ? "Marking..."
            : "Mark all as read"}
        </button>
      </div>

      {/* ================================== */}
      {/* FILTER */}
      {/* ================================== */}

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          type="button"
          onClick={() => {
            setFilter("all");
            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => {
            setFilter("unread");
            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Unread
        </button>
      </div>

      {/* ================================== */}
      {/* CONTENT */}
      {/* ================================== */}

      <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : loadError ? (
          <div className="p-4 sm:p-6">
            <ErrorState
              title="Unable to load notifications"
              message={loadError}
              onRetry={loadNotifications}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              title="No notifications"
              description="You're all caught up."
            />
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={handleRead}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================================== */}
      {/* PAGINATION */}
      {/* ================================== */}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {pagination.page} of{" "}
            {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              pagination.page >= pagination.totalPages
            }
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}