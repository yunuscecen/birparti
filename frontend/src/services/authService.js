import api, {
  refreshAccessToken,
} from "./api";
import {
  clearAccessToken,
  setAccessToken,
} from "./authTokenStore";

export const registerUser = async (formData) => {
  const response = await api.post(
    "/auth/register",
    formData
  );

  const data = response.data.data;

  setAccessToken(data.accessToken);

  return data;
};

export const loginUser = async (formData) => {
  const response = await api.post(
    "/auth/login",
    formData
  );

  const data = response.data.data;

  setAccessToken(data.accessToken);

  return data;
};

export const refreshUserSession = async () => {
  return refreshAccessToken();
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
};