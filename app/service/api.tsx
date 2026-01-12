import axios from "axios";
import { isGAInitialized } from "../utils/analytics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
// const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers["API-KEY"] = API_KEY;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
/**
 * Send conversion event to Facebook Conversion API
 */
export async function sendConversionEvent(eventData: any) {
  if (!isGAInitialized) {
    console.warn(
      "Google Analytics not initialized. Conversion event not sent."
    );
    return;
  }

  try {
    const response = await api.post("home/conversion", eventData);
    return response.data;
  } catch (error) {
    // Handle different error structures properly
    let errorMessage = "Failed to send conversion event";

    if (error.response?.data?.error) {
      // If error.response.data.error is an object, stringify it
      errorMessage =
        typeof error.response.data.error === "object"
          ? JSON.stringify(error.response.data.error)
          : error.response.data.error;
    } else if (error.message) {
      // If error.message is an object, stringify it
      errorMessage =
        typeof error.message === "object"
          ? JSON.stringify(error.message)
          : error.message;
    }
    // console.error("errorMessage", errorMessage);
    // throw new Error(errorMessage);
  }
}

export default api;
