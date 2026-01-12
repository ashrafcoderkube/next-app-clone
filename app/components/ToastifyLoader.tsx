"use client";

import { useEffect } from "react";

/**
 * Dynamically loads react-toastify CSS to avoid blocking initial render
 */
export default function ToastifyLoader() {
  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.getElementById("react-toastify-css");
    if (existingLink) return;

    // Dynamically load CSS without blocking render
    const link = document.createElement("link");
    link.id = "react-toastify-css";
    link.rel = "stylesheet";
    link.href = "/_next/static/css/react-toastify.css";
    link.media = "print"; // Load as non-blocking
    link.onload = () => {
      link.media = "all"; // Switch to all media once loaded
    };
    link.onerror = () => {
      // Fallback: try to load from node_modules if static path fails
      // This is a fallback and shouldn't normally be needed
      console.warn("Failed to load react-toastify CSS from static path");
    };
    document.head.appendChild(link);
  }, []);

  return null;
}
