import api from "./api";

export const getUsersApi = async (params = {}) => {
  const response = await api.get("/users", { params });
  return response.data;
};
