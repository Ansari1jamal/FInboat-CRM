import api from "./api";

export const getTeamsApi = async () => {
  const response = await api.get("/teams");
  return response.data;
};
