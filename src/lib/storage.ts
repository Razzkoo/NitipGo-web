// ALL HELPER LOCALSTORAGE
export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

export const saveAuth = (data: {
  access_token: string;
  refresh_token: string;
  user: any;
}) => {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));
};