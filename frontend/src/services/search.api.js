import api from "./api";

// ========================================
// GLOBAL SEARCH
// ========================================

export const globalSearchApi = async (params = {}) => {
  const response = await api.get("/search", {
    params,
  });

  return response.data;
};