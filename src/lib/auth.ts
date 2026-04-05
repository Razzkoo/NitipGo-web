import api from "./api";
import { clearAuth, saveAuth, getStoredUser, isAuthenticated } from "./storage";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer" | "traveler";
  status: string;
  profile_photo?: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  role: string;
};

// AUTH

// Unified Login (customer, admin, traveler)
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// Handle Register customer
export const registerCustomer = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}) => {
  const res = await api.post("/auth/register-customer", payload);
  return res.data;
};

// Handle Register traveler
export const registerTraveler = async (payload: FormData) => {
  const res = await api.post("/auth/register-traveler", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Show
export const getMe = async (): Promise<AuthUser> => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

// Handle Logout
export const logout = async () => {
  await api.post("/auth/logout");
  clearAuth();
};

export const logoutAll = async () => {
  await api.post("/auth/logout-all");
  clearAuth();
};

// Forgot Password
export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

// Reset Password
export const resetPassword = async (payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
};

// HELPERS TOKEN
export { clearAuth, saveAuth, getStoredUser, isAuthenticated };