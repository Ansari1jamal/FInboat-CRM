import api from "./api";

export const getEmiScheduleApi = async (loanAccountId, params = {}) => {
  const response = await api.get(
    `/loans/${loanAccountId}/emi-schedule`,
    { params }
  );

  return response.data;
};

export const generateEmiScheduleApi = async (loanAccountId, payload) => {
  const response = await api.post(
    `/loans/${loanAccountId}/emi-schedule`,
    payload
  );

  return response.data;
};
