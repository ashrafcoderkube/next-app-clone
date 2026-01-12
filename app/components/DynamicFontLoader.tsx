"use client";

import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";

/**
 * Component to dynamically load Google Font from storeInfo API
 * 
 * IMPORTANT: This component is REQUIRED to actually load the font files.
 * ThemeContext only sets the CSS variable with the font name, but doesn't load the font.
 * Without this component, Google Fonts won't be loaded and the font won't display.
 * 
 * System fonts (Arial, Helvetica, system-ui, etc.) don't need to be loaded,
 * so this component only loads Google Fonts.
 */
export default function DynamicFontLoader() {
  const storeInfo = useAppSelector(
    (state: RootState) => state.storeInfo.storeInfo
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fontFamily = storeInfo?.data?.storeinfo?.fontFamily;

    if (!fontFamily) return;

    // Process font name: remove quotes, trim whitespace
    let fontName = fontFamily.trim();
    fontName = fontName.replace(/^["']|["']$/g, ""); // Remove surrounding quotes

    if (!fontName) return;

    // List of common system fonts that don't need to be loaded
    const systemFonts = [
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Courier New",
      "Verdana",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Comic Sans MS",
      "Trebuchet MS",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "sans-serif",
      "serif",
      "monospace",
    ];

    // Check if it's a system font (case-insensitive)
    const isSystemFont = systemFonts.some(
      (sysFont) => fontName.toLowerCase() === sysFont.toLowerCase()
    );

    // If it's a system font, no need to load it
    if (isSystemFont) {
      // Remove any existing Google Font link if switching to system font
      const existingLink = document.getElementById("dynamic-google-font");
      if (existingLink) {
        existingLink.remove();
      }
      return;
    }

    // It's a Google Font - need to load it
    // Format for Google Fonts URL
    const fontNameForUrl = fontName.replace(/\s+/g, "+");
    const newHref = `https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@400;500;600;700&display=swap`;

    // Check if font is already loaded
    const existingLink = document.getElementById("dynamic-google-font");
    if (existingLink) {
      const currentHref = existingLink.getAttribute("href");
      if (currentHref === newHref) {
        return; // Font already loaded and matches
      }
      // Remove old link if font changed
      existingLink.remove();
    }

    // Create link element to load Google Font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = newHref;
    link.id = "dynamic-google-font";
    link.crossOrigin = "anonymous";

    // Append to head
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      const linkToRemove = document.getElementById("dynamic-google-font");
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [storeInfo]);

  return null; // This component doesn't render anything
}

