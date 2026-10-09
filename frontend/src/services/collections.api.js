import api from "./api";

export const getCollectionsApi = async (params = {}) => {
  const response = await api.get("/collection-followups", { params });
  return response.data;
};

export const getCollectionByIdApi = async (id) => {
  const response = await api.get(`/collection-followups/${id}`);
  return response.data;
};

export const getDueEmisApi = async (params = {}) => {
  const response = await api.get("/collection-due-emis", { params });
  return response.data;
};

export const getCollectionSummaryApi = async () => {
  const response = await api.get("/collection-summary");
  return response.data;
};

export const createCollectionApi = async (loanAccountId, payload) => {
  const response = await api.post(
    `/loans/${loanAccountId}/followups`,
    payload
  );

  return response.data;
};

export const updateCollectionApi = async (id, payload) => {
  const response = await api.patch(`/collection-followups/${id}`, payload);
  return response.data;
};
