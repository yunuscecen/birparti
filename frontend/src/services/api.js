import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "İstek sırasında bir hata oluştu.",
      details: error.response?.data?.details || null,
    };

    return Promise.reject(normalizedError);
  }
);

export default api;