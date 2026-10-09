import api from "./api";

export const getCollectionFollowUps = async (params = {}) => (await api.get("/collection-followups", { params })).data;
export const createCollectionFollowUp = async (loanId, data) => (await api.post(`/loans/${loanId}/followups`, data)).data;
export const updateCollectionFollowUp = async (id, data) => (await api.patch(`/collection-followups/${id}`, data)).data;
export const getCollectionSummary = async (params = {}) => (await api.get("/collection-summary", { params })).data;
