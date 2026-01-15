"use client";

import { useEffect } from "react";

export default function DeferredStyles() {
  useEffect(() => {
    const styles = ["/App.css", "/toastify.css"];

    styles.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
