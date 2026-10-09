import api from "./api";

export const registerApi = async (userData) => {
  const csrfToken = await api.get("/auth/csrf-token");
  const token = csrfToken.data?.data?.csrfToken || csrfToken.data?.csrfToken;

  const response = await api.post("/auth/register", userData, {
    headers: {
      "X-CSRF-Token": token,
    },
  });

  return response.data;
};

export const loginApi = async (credentials) => {
  const csrfToken = await api.get("/auth/csrf-token");
  const token = csrfToken.data?.data?.csrfToken || csrfToken.data?.csrfToken;

  const response = await api.post("/auth/login", credentials, {
    headers: {
      "X-CSRF-Token": token,
    },
  });

  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const login = async (credentials) => {
  const result = await loginApi(credentials);
  return result.data ?? result;
};

export const getCurrentUser = async () => {
  const result = await getCurrentUserApi();
  return result.data ?? result;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
  }
};
