import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./authTokenStore";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const normalizeError = (error) => ({
  status: error.response?.status || 500,

  message:
    error.response?.data?.message ||
    error.message ||
    "İstek sırasında bir hata oluştu.",

  details:
    error.response?.data?.details || null,
});

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((response) => {
        const newAccessToken =
          response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error(
            "Yeni access token alınamadı."
          );
        }

        setAccessToken(newAccessToken);

        return newAccessToken;
      })
      .catch((error) => {
        clearAccessToken();

        throw normalizeError(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized =
      error.response?.status === 401;

    const isAuthAction = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
    ].some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthAction
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken =
          await refreshAccessToken();

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;