import api from "./api";

// ========================================
// GET CALLS FOR LEAD
// ========================================

export const getLeadCallsApi = async (
  leadId
) => {
  const response = await api.get(
    `/calls/lead/${leadId}`
  );

  return response.data;
};

// ========================================
// CREATE CALL
// ========================================

export const createCallApi = async (
  leadId,
  payload
) => {
  const response = await api.post(
    `/calls/${leadId}`,
    payload
  );

  return response.data;
};
