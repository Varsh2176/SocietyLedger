import axios from 'axios';

const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';

/**
 * In-memory storage for short-lived access token.
 * Sensitive tokens are NEVER written to localStorage.
 */
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

/**
 * Centralized Axios instance with secure cookie handling.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Automatically includes HttpOnly session/refresh cookies
  timeout: 15000,
});

// Listener for session expiration events
let onUnauthorizedCallback = null;

export const registerUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: injects in-memory token if available
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handles 401 Unauthorized and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Avoid infinite loop if the 401 came from refresh or logout
      if (!originalRequest || originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      clearAccessToken();

      if (onUnauthorizedCallback) {
        onUnauthorizedCallback({
          message: error.response?.data?.message || 'Your session has expired. Please sign in again.',
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
