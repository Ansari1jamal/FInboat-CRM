import api from "./api";

export const getRepaymentsApi = async (loanAccountId, params = {}) => {
  const response = await api.get(
    `/loans/${loanAccountId}/repayments`,
    { params }
  );

  return response.data;
};

export const getRepaymentByIdApi = async (loanAccountId, repaymentId) => {
  const response = await api.get(
    `/loans/${loanAccountId}/repayments/${repaymentId}`
  );

  return response.data;
};

export const createRepaymentApi = async (loanAccountId, payload) => {
  const response = await api.post(
    `/loans/${loanAccountId}/repayments`,
    payload
  );

  return response.data;
};
