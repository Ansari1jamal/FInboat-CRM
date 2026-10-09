import api from "./api";

// ========================================
// GET LEADS
// ========================================

export const getLeadsApi = async ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  loanType = "",
  fromDate = "",
  toDate = "",
} = {}) => {
  const response = await api.get("/leads", {
    params: {
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(loanType && { loanType }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    },
  });

  return response.data;
};

export const exportLeadsExcelApi = async (params = {}) => {
  const response = await api.get("/leads/export", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const exportLeadsCsvApi = async (params = {}) => {
  const response = await api.get("/leads/export/csv", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const importLeadsApi = async (file, assignedToId) => {
  const formData = new FormData();
  formData.append("file", file);

  if (assignedToId) {
    formData.append("assignedToId", assignedToId);
  }

  const response = await api.post("/leads/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });

  return response.data;
};

export const getLeadImportStatusApi = async (jobId) => {
  const response = await api.get(`/leads/import/${jobId}`);
  return response.data;
};

// ========================================
// GET SINGLE LEAD
// ========================================

export const getLeadApi = async (
  leadId
) => {
  const response = await api.get(
    `/leads/${leadId}`
  );

  return response.data;
};

// ========================================
// GET LEAD TIMELINE
// ========================================

export const getLeadTimelineApi = async (
  leadId
) => {
  const response = await api.get(
    `/leads/${leadId}/timeline`
  );

  return response.data;
};

// ========================================
// CREATE LEAD
// ========================================

export const createLeadApi = async (
  payload
) => {
  const response = await api.post(
    "/leads",
    payload
  );

  return response.data;
};

// ========================================
// UPDATE LEAD
// ========================================

export const updateLeadApi = async (
  leadId,
  payload
) => {
  const response = await api.patch(
    `/leads/${leadId}`,
    payload
  );

  return response.data;
};

// ========================================
// UPDATE LEAD STATUS
// ========================================

export const updateLeadStatusApi =
  async (leadId, status) => {
    const response =
      await api.patch(
        `/leads/${leadId}/status`,
        { status }
      );

    return response.data;
  };

// ========================================
// ASSIGN LEAD
// ========================================

export const assignLeadApi = async (
  leadId,
  payload
) => {
  const response = await api.patch(
    `/leads/${leadId}/assign`,
    payload
  );

  return response.data;
};

// ========================================
// GET LEAD TRANSFER HISTORY
// ========================================

export const getLeadTransfersApi = async (
  leadId
) => {
  const response = await api.get(
    `/leads/${leadId}/transfers`
  );

  return response.data;
};

// ========================================
// DELETE LEAD
// ========================================

export const deleteLeadApi = async (
  leadId
) => {
  const response = await api.delete(
    `/leads/${leadId}`
  );

  return response.data;
};