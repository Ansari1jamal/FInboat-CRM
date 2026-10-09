import api from "./api";

export const getLoans = async (params = {}) => (await api.get("/loans", { params })).data;
export const getLoan = async (id) => (await api.get(`/loans/${id}`)).data;
export const convertApplicationToLoan = async (applicationId) => (await api.post(`/loans/applications/${applicationId}/convert`)).data;
export const updateLoanStatus = async (id, data) => (await api.patch(`/loans/${id}/status`, data)).data;
export const generateEmiSchedule = async (loanId, data) => (await api.post(`/loans/${loanId}/emi-schedule`, data)).data;
export const getEmiSchedule = async (loanId) => (await api.get(`/loans/${loanId}/emi-schedule`)).data;
export const createRepayment = async (loanId, data) => (await api.post(`/loans/${loanId}/repayments`, data)).data;
export const getRepaymentSummary = async (loanId) => (await api.get(`/loans/${loanId}/repayment-summary`)).data;
