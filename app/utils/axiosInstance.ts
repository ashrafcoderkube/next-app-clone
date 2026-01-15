import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://nodeapi.jdwebnship.com/api/",
  headers: {
    "Content-Type": "application/json"
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add API key if available
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      config.headers["API-KEY"] = apiKey;
    }

    // Add authentication token - first check Redux state, then localStorage
    if (typeof window !== "undefined") {
      let token = null;

      // First, try to get token from Redux state (immediate access)
      try {
        // Dynamic import to avoid circular dependency
        const { store } = require("../redux/store");
        const state = store.getState();
        token = state?.auth?.user?.token;
      } catch (reduxError) {
        console.warn("Failed to access Redux state:", reduxError);
      }

      // If no token from Redux, try localStorage
      if (!token) {
        try {
          const persistedState = localStorage.getItem("reduxState");
          if (persistedState) {
            const parsedState = JSON.parse(persistedState);
            token = parsedState?.auth?.user?.token;
          }
        } catch (storageError) {
          console.warn("Failed to parse reduxState from localStorage:", storageError);
        }
      }

      // Set authorization header if token is available
      if (token && typeof token === 'string') {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors by logging out the user
    if (error.response?.status === 401) {
      try {
        // Lazy import to avoid circular dependency
        const { store } = await import("../redux/store");
        const { logout } = await import("../redux/slices/authSlice");

        // Clear user authentication state
        store.dispatch(logout());
        // Clear persisted state from localStorage since token is invalid
        if (typeof window !== "undefined") {
          localStorage.removeItem("reduxState");
        }
      } catch (importError) {
        console.error("Failed to import store/auth modules for logout:", importError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

