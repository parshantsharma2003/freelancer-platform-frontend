import axios from "axios";
import { ENV } from "../config/env";

const API_URL = ENV.API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies automatically
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});


// ================================
// REQUEST INTERCEPTOR
// ================================

api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;

    const token = localStorage.getItem("accessToken");

    // Only attach header if token exists
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// ================================
// RESPONSE INTERCEPTOR (REFRESH)
// ================================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const requestUrl = String(originalRequest.url || "");
    const isRefreshRequest = requestUrl.includes("/auth/refresh");
    const isLoginLikeRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/request-login-otp") ||
      requestUrl.includes("/auth/verify-login-otp") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    const hasStoredAccessToken = !!(
      storedAccessToken &&
      storedAccessToken !== "undefined" &&
      storedAccessToken !== "null"
    );
    const hasStoredUser = !!(
      storedUser &&
      storedUser !== "undefined" &&
      storedUser !== "null"
    );
    const shouldAttemptRefresh = hasStoredAccessToken || hasStoredUser;

    // Retry only once and never recursively retry refresh endpoint.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      shouldAttemptRefresh
    ) {

      originalRequest._retry = true;

      try {

        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            skipAuthRefresh: true,
          }
        );

        const accessToken = refreshResponse?.data?.data?.accessToken;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          localStorage.removeItem("accessToken");
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
        }

        return api(originalRequest);

      } catch (refreshError) {

        // Clear auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Notify auth context
        window.dispatchEvent(new CustomEvent("auth:logout"));

        return Promise.reject(refreshError);
      }

    }

    return Promise.reject(error);
  }
);

export default api;
