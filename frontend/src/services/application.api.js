import api from "./api";

export const getApplications = async (params = {}) => (await api.get("/applications", { params })).data;
export const getApplication = async (id) => (await api.get(`/applications/${id}`)).data;
export const createApplication = async (leadId, data = {}) => (await api.post(`/applications/leads/${leadId}`, data)).data;
export const updateApplicationStatus = async (id, data) => (await api.patch(`/applications/${id}/status`, data)).data;
