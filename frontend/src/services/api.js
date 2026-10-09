import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const getCsrfToken = async () => {
  const response = await api.get("/auth/csrf-token");
  return response.data?.data?.csrfToken || response.data?.csrfToken;
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "get").toLowerCase();
    const isUnsafeMethod = ["post", "put", "patch", "delete"].includes(method);
    const isCsrfRequest = config.url?.includes("/auth/csrf-token");

    if (isUnsafeMethod && !isCsrfRequest && !config.headers["X-CSRF-Token"]) {
      const csrfToken = await getCsrfToken();
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
