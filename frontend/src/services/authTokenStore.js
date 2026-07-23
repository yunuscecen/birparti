let accessToken = null;

export const getAccessToken = () => {
  return accessToken;
};

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const clearAccessToken = () => {
  accessToken = null;
};