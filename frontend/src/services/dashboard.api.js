import api from "./api";

export const getDashboardApi = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getDashboardSummaryApi = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getTelecallerPerformanceApi = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getTlPerformanceApi = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getTeamPerformanceApi = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};
