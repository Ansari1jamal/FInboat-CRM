import api from "./api";

// ========================================
// GET APPLICATIONS
// ========================================

export const getApplicationsApi = async (params = {}) => {
  const response = await api.get("/applications", { params });

  const payload = response?.data?.data || response?.data || {};

  return {
    data: payload,
  };
};

export const exportApplicationsApi = async (params = {}) => {
  const response = await api.get("/applications/export", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const exportApplicationsCsvApi = async (params = {}) => {
  const response = await api.get("/applications/export/csv", {
    params,
    responseType: "blob",
  });

  return response.data;
};

// ========================================
// GET APPLICATION BY ID
// ========================================

export const getApplicationByIdApi = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);

  return {
    data: response?.data?.data || response?.data || null,
  };
};

// ========================================
// CREATE APPLICATION
// ========================================

export const createApplicationApi = async (leadId, payload) => {
  const response = await api.post(`/applications/leads/${leadId}`, payload);

  return {
    data: response?.data?.data || response?.data || null,
  };
};

// ========================================
// UPDATE APPLICATION
// ========================================

export const updateApplicationApi = async (applicationId, payload) => {
  const response = await api.patch(`/applications/${applicationId}`, payload);

  return {
    data: response?.data?.data || response?.data || null,
  };
};

// ========================================
// UPDATE STATUS
// ========================================

export const updateApplicationStatusApi = async (applicationId, payload) => {
  const response = await api.patch(`/applications/${applicationId}/status`, payload);

  return {
    data: response?.data?.data || response?.data || null,
  };
};

// ========================================
// STATUS HISTORY
// ========================================

export const getApplicationStatusHistoryApi = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/status-history`);

  return {
    data: response?.data?.data || response?.data || [],
  };
};

// ========================================
// APPLICATION TIMELINE
// ========================================

export const getApplicationTimelineApi = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/timeline`);

  return {
    data: response?.data?.data || response?.data || [],
  };
};

// ========================================
// GET LENDERS
// ========================================

export const getLendersApi = async () => {
  const response = await api.get("/lenders");

  return {
    data: response?.data?.data || response?.data || [],
  };
};
