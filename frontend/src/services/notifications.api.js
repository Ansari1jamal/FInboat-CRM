import api from "./api";

// ========================================
// GET NOTIFICATIONS
// ========================================

export const getNotificationsApi = async (params = {}) => {
  const response = await api.get("/notifications", {
    params,
  });

  return response.data;
};

// ========================================
// GET UNREAD COUNT
// ========================================

export const getUnreadNotificationCountApi = async () => {
  const response = await api.get(
    "/notifications/unread-count"
  );

  return response.data;
};

// ========================================
// MARK ONE NOTIFICATION AS READ
// ========================================

export const markNotificationAsReadApi = async (id) => {
  const response = await api.patch(
    `/notifications/${id}/read`
  );

  return response.data;
};

// ========================================
// MARK ALL AS READ
// ========================================

export const markAllNotificationsAsReadApi = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};