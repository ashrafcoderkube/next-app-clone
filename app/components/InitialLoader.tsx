"use client";

import { useEffect } from "react";

export default function InitialLoader() {
  useEffect(() => {
    // Hide loader immediately once React has hydrated
    // Don't wait for API calls - they should happen in background
    const hideLoader = () => {
      const loader = document.getElementById("initial-loader");
      if (loader) {
        loader.style.display = "none";
      }
    };

    // Hide immediately on mount (after hydration)
    hideLoader();

    // Fallback: hide after a very short delay if still visible
    // This ensures it hides even if there's a race condition
    const fallbackTimer = setTimeout(hideLoader, 50);
    
    return () => clearTimeout(fallbackTimer);
  }, []);

  return null;
}

