import api from "./api";

// ========================================
// GET LOANS
// ========================================

export const getLoansApi = async (params = {}) => {
  const response = await api.get("/loans", {
    params,
  });

  return response.data;
};

export const exportLoansApi = async (params = {}) => {
  const response = await api.get("/loans/export", {
    params,
    responseType: "blob",
  });

  return response.data;
};

// ========================================
// GET LOAN BY ID
// ========================================

export const getLoanByIdApi = async (id) => {
  const response = await api.get(`/loans/${id}`);

  return response.data;
};

// ========================================
// UPDATE LOAN STATUS
// ========================================

export const updateLoanStatusApi = async (id, status) => {
  const response = await api.patch(`/loans/${id}/status`, {
    status,
  });

  return response.data;
};

// ========================================
// CONVERT APPLICATION TO LOAN
// ========================================

export const convertApplicationToLoanApi = async (applicationId) => {
  const response = await api.post(
    `/loans/applications/${applicationId}/convert`
  );

  return response.data;
};