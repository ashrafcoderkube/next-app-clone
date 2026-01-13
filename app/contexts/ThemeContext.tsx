"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getContrastingColor } from "../utils/colorUtils";
import { setThemeId } from "../redux/slices/storeInfoSlice";
import { RootState } from "../redux/store";
const ThemeContext = createContext(null);

const formatFontNameForGoogle = (fontFamily: string) => {
  if (!fontFamily) return "";
  const fontName = fontFamily.split(",")[0].trim();
  return fontName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// const loadGoogleFont = (fontFamily: string) => {
//   if (!fontFamily) return;
//   const id = "dynamic-google-font";
//   const existing = document.getElementById(id);
//   if (existing) existing.remove();
//   const pc1 = document.createElement("link");
//   pc1.rel = "preconnect";
//   pc1.href = "https://fonts.googleapis.com";
//   pc1.crossOrigin = "anonymous";
//   const pc2 = document.createElement("link");
//   pc2.rel = "preconnect";
//   pc2.href = "https://fonts.gstatic.com";
//   pc2.crossOrigin = "anonymous";
//   document.head.appendChild(pc1);
//   document.head.appendChild(pc2);
//   const formattedFontName = formatFontNameForGoogle(fontFamily);
//   const link = document.createElement("link");
//   link.rel = "stylesheet";
//   link.id = id;
//   link.href = `https://fonts.googleapis.com/css2?family=${formattedFontName.replace(
//     / /g,
//     "+"
//   )}:wght@300;400;500;600;700&display=swap`;
//   link.media = "print";
//   link.onload = () => {
//     link.media = "all";
//   };
//   document.head.appendChild(link);
// };

const loadThemeCSS = (themeName: string) => {
  if (!themeName) themeName = "Theme1";
  const existing = document.getElementById("theme-style");
  if (existing) existing.remove();
  
  // Use proper preload strategy for non-blocking CSS
  const link = document.createElement("link");
  link.id = "theme-style";
  link.rel = "stylesheet";
  link.href = `/css/${themeName}.css`;
  link.media = "print"; // Load as non-blocking
  link.onload = () => {
    link.media = "all"; // Switch to all media once loaded
  };
  document.head.appendChild(link);
};

export function ThemeProvider({ children, theme = {} }) {
  const dispatch = useDispatch();
  const storeInfoState = useSelector((state: RootState) => state.storeInfo);
  const { themeId } = storeInfoState;
  const storeInfo =
    storeInfoState?.storeInfo?.data?.storeinfo ||
    storeInfoState?.storeInfo ||
    null;

  const prevThemeNameRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState({
    fontFamily: "Instrument Sans, sans-serif",
    backgroundColor: "#ffffff",
    buttonBackgroundColor: "#111111",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#111111",
    bannerButtonColor: "#111111",
    bannerButtonTextColor: "#ffffff",
    bannerButtonBorderColor: "#111111",
    collectionButtonColor: "#111111",
    collectionButtonTextColor: "#ffffff",
    collectionButtonBorderColor: "#111111",
    newsletterButtonColor: "#111111",
    newsletterButtonTextColor: "#ffffff",
    newsletterButtonBorderColor: "#111111",
    addToCartButtonBackgroundColor: "#111111",
    addToCartButtonTextColor: "#ffffff",
    addToCartButtonBorderColor: "#111111",
    buyNowButtonBackgroundColor: "#111111",
    buyNowButtonTextColor: "#ffffff",
    buyNowButtonBorderColor: "#111111",
    topHeaderBackgroundColor: "#111111",
    headerBackgroundColor: "#FFFFFF",
    footerBackgroundColor: "#111111",
    bottomFooterBackgroundColor: "#FFF7F2",
    footerLogo: "",
    bodyTextColor: "#000000",
    bannerType: "slider",
    categoryLayout: "swiper",
    ...theme,
  });

  useEffect(() => {
    if ((storeInfo as any)?.theme_id) {
      // dispatch(setThemeId((storeInfo as any).theme_id));
      dispatch(setThemeId(1));
    }
  }, [storeInfo, dispatch]);

  // Optimized: Batch theme updates to prevent multiple re-renders
  useEffect(() => {
    const name = `Theme${themeId || 1}`;
    const prev = prevThemeNameRef.current;
    if (prev !== name) {
      loadThemeCSS(name);
      prevThemeNameRef.current = name;
    }
    
    if (storeInfo) {
      // Batch all theme updates in a single state update
      const themeColors = (storeInfo as any).themeColors || {};
      setCurrentTheme((prev) => {
        const newTheme = {
        backgroundColor:
          (storeInfo as any).backgroundColor ||
          themeColors.backgroundColor ||
          prev.backgroundColor,
        buttonBackgroundColor:
          (storeInfo as any).buttonBackgroundColor ||
          themeColors.buttonBackgroundColor ||
          prev.buttonBackgroundColor,
        buttonTextColor:
          (storeInfo as any).buttonTextColor ||
          themeColors.buttonTextColor ||
          prev.buttonTextColor,
        buttonBorderColor:
          (storeInfo as any).buttonBorderColor ||
          themeColors.buttonBorderColor ||
          prev.buttonBorderColor,
        bannerButtonColor:
          (storeInfo as any).bannerButtonColor ||
          themeColors.bannerButtonColor ||
          prev.bannerButtonColor,
        bannerButtonTextColor:
          (storeInfo as any).bannerButtonTextColor ||
          themeColors.bannerButtonTextColor ||
          prev.bannerButtonTextColor,
        bannerButtonBorderColor:
          (storeInfo as any).bannerButtonBorderColor ||
          themeColors.bannerButtonBorderColor ||
          prev.bannerButtonBorderColor,
        collectionButtonColor:
          (storeInfo as any).collectionButtonColor ||
          themeColors.collectionButtonColor ||
          prev.collectionButtonColor,
        collectionButtonTextColor:
          (storeInfo as any).collectionButtonTextColor ||
          themeColors.collectionButtonTextColor ||
          prev.collectionButtonTextColor,
        collectionButtonBorderColor:
          (storeInfo as any).collectionButtonBorderColor ||
          themeColors.collectionButtonBorderColor ||
          prev.collectionButtonBorderColor,
        newsletterButtonColor:
          (storeInfo as any).newsletterButtonColor ||
          themeColors.newsletterButtonColor ||
          prev.newsletterButtonColor,
        newsletterButtonTextColor:
          (storeInfo as any).newsletterButtonTextColor ||
          themeColors.newsletterButtonTextColor ||
          prev.newsletterButtonTextColor,
        newsletterButtonBorderColor:
          (storeInfo as any).newsletterButtonBorderColor ||
          themeColors.newsletterButtonBorderColor ||
          prev.newsletterButtonBorderColor,
        addToCartButtonBackgroundColor:
          (storeInfo as any).addToCartButtonBackgroundColor ||
          themeColors.addToCartButtonBackgroundColor ||
          prev.addToCartButtonBackgroundColor,
        addToCartButtonTextColor:
          (storeInfo as any).addToCartButtonTextColor ||
          themeColors.addToCartButtonTextColor ||
          prev.addToCartButtonTextColor,
        addToCartButtonBorderColor:
          (storeInfo as any).addToCartButtonBorderColor ||
          themeColors.addToCartButtonBorderColor ||
          prev.addToCartButtonBorderColor,
        buyNowButtonBackgroundColor:
          (storeInfo as any).buyNowButtonBackgroundColor ||
          themeColors.buyNowButtonBackgroundColor ||
          prev.buyNowButtonBackgroundColor,
        buyNowButtonTextColor:
          (storeInfo as any).buyNowButtonTextColor ||
          themeColors.buyNowButtonTextColor ||
          prev.buyNowButtonTextColor,
        buyNowButtonBorderColor:
          (storeInfo as any).buyNowButtonBorderColor ||
          themeColors.buyNowButtonBorderColor ||
          prev.buyNowButtonBorderColor,
        topHeaderBackgroundColor:
          (storeInfo as any).topHeaderBackgroundColor ||
          themeColors.topHeaderBackgroundColor ||
          prev.topHeaderBackgroundColor,
        headerBackgroundColor:
          (storeInfo as any).headerBackgroundColor ||
          themeColors.headerBackgroundColor ||
          prev.headerBackgroundColor,
        footerBackgroundColor:
          (storeInfo as any).footerBackgroundColor ||
          themeColors.footerBackgroundColor ||
          prev.footerBackgroundColor,
        bottomFooterBackgroundColor:
          (storeInfo as any).bottomFooterBackgroundColor ||
          themeColors.bottomFooterBackgroundColor ||
          prev.bottomFooterBackgroundColor,
        footerLogo:
          (storeInfo as any).footerLogo ||
          themeColors.footerLogo ||
          prev.footerLogo,
        bodyTextColor:
          (storeInfo as any).bodyTextColor ||
          themeColors.bodyTextColor ||
          prev.bodyTextColor,
        // fontFamily: (storeInfo as any).fontFamily
        //   ? `var(${getFontVariable((storeInfo as any).fontFamily)})`
        //   : prev.fontFamily,
        bannerType: (storeInfo as any).bannerType || prev.bannerType,
        categoryLayout:
          (storeInfo as any).categoryLayout || prev.categoryLayout,
      };
      
      // Return merged theme (React will handle comparison)
      return { ...prev, ...newTheme };
      });
    }
  }, [storeInfo, themeId]);

  // useEffect(() => {
  //   if (currentTheme.fontFamily) {
  //     loadGoogleFont(currentTheme.fontFamily);
  //   }
  // }, [currentTheme.fontFamily]);

  const textColor = useMemo(
    () => getContrastingColor(currentTheme.backgroundColor),
    [currentTheme.backgroundColor]
  );
  const topHeaderTextColor = useMemo(
    () => getContrastingColor(currentTheme.topHeaderBackgroundColor),
    [currentTheme.topHeaderBackgroundColor]
  );
  const headerTextColor = useMemo(
    () => getContrastingColor(currentTheme.headerBackgroundColor),
    [currentTheme.headerBackgroundColor]
  );
  const footerTextColor = useMemo(
    () => getContrastingColor(currentTheme.footerBackgroundColor),
    [currentTheme.footerBackgroundColor]
  );
  const bottomFooterTextColor = useMemo(
    () => getContrastingColor(currentTheme.bottomFooterBackgroundColor),
    [currentTheme.bottomFooterBackgroundColor]
  );

  // Optimized: Batch CSS variable updates for better performance
  useEffect(() => {
    const root = document.documentElement;
    // Batch all CSS variable updates to minimize reflows
    const cssVars = {
      "--font-family": currentTheme.fontFamily,
      "--bg-color": currentTheme.backgroundColor,
      "--text-color": textColor,
      "--body-text-color": currentTheme.bodyTextColor,
      "--button-bg": currentTheme.buttonBackgroundColor,
      "--button-text-color": currentTheme.buttonTextColor,
      "--button-border-color": currentTheme.buttonBorderColor,
      "--banner-button-bg": currentTheme.bannerButtonColor,
      "--banner-button-text-color": currentTheme.bannerButtonTextColor,
      "--banner-button-border-color": currentTheme.bannerButtonBorderColor,
      "--collection-button-bg": currentTheme.collectionButtonColor,
      "--collection-button-text-color": currentTheme.collectionButtonTextColor,
      "--collection-button-border-color": currentTheme.collectionButtonBorderColor,
      "--newsletter-button-bg": currentTheme.newsletterButtonColor,
      "--newsletter-button-text-color": currentTheme.newsletterButtonTextColor,
      "--newsletter-button-border-color": currentTheme.newsletterButtonBorderColor,
      "--add-to-cart-button-bg": currentTheme.addToCartButtonBackgroundColor,
      "--add-to-cart-button-text-color": currentTheme.addToCartButtonTextColor,
      "--add-to-cart-button-border-color": currentTheme.addToCartButtonBorderColor,
      "--buy-now-button-bg": currentTheme.buyNowButtonBackgroundColor,
      "--buy-now-button-text-color": currentTheme.buyNowButtonTextColor,
      "--buy-now-button-border-color": currentTheme.buyNowButtonBorderColor,
      "--top-header-bg": currentTheme.topHeaderBackgroundColor,
      "--top-header-text-color": topHeaderTextColor,
      "--header-bg": currentTheme.headerBackgroundColor,
      "--header-text-color": headerTextColor,
      "--footer-bg": currentTheme.footerBackgroundColor,
      "--footer-text-color": footerTextColor,
      "--footer-logo": currentTheme.footerLogo,
      "--bottom-footer-bg": currentTheme.bottomFooterBackgroundColor,
      "--bottom-footer-text-color": bottomFooterTextColor,
    };
    
    // Apply all CSS variables at once
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [
    currentTheme,
    textColor,
    topHeaderTextColor,
    headerTextColor,
    footerTextColor,
    bottomFooterTextColor,
  ]);

  const value = useMemo(
    () => ({
      // Spread all currentTheme properties directly
      ...currentTheme,
      // Override with computed color values
      textColor,
      topHeaderTextColor,
      headerTextColor,
      footerTextColor,
      bottomFooterTextColor,
      // Keep the setTheme function
      setTheme: setCurrentTheme,
    }),
    [
      currentTheme,
      textColor,
      topHeaderTextColor,
      headerTextColor,
      footerTextColor,
      bottomFooterTextColor,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
