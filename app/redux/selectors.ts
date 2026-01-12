import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Store Info Selectors
export const selectStoreInfo = (state: RootState) => state.storeInfo;

export const selectThemeData = createSelector(
  [selectStoreInfo],
  (storeInfo) => ({
    themeId: storeInfo.themeId && typeof storeInfo.themeId === 'number' ? storeInfo.themeId : 1,
    isWholesaler: storeInfo.isWholesaler,
    loading: storeInfo.loading,
  })
);

// Product Selectors
export const selectProductsState = (state: RootState) => state.products;

export const selectProductCategories = createSelector(
  [selectProductsState],
  (products) => products.productCategories?.sub_categories || []
);

export const selectFeaturedProducts = createSelector(
  [selectProductsState],
  (products) => products.featured
);

export const selectFeaturedProductsLoading = createSelector(
  [selectProductsState],
  (products) => products.loading
);

// Home Section Selectors
export const selectHomeSectionState = (state: RootState) => state.homeSection;

export const selectHomeSectionData = createSelector(
  [selectHomeSectionState],
  (homeSection) => ({
    homeSection: homeSection.homeSection,
    loading: homeSection.loading,
  })
);

export const selectHeroSection = createSelector(
  [selectHomeSectionData],
  ({ homeSection }) => homeSection?.hero
);

export const selectNewArrivalsData = createSelector(
  [selectProductsState],
  (products) => ({
    newArrivals: products.newArrivals,
    loading: products.loading,
  })
);

// Theme selectors for stable theme values
export const selectThemeValues = createSelector(
  [(state: RootState) => state.storeInfo.themeId],
  (themeId) => ({
    themeId: themeId || 1,
  })
);

export const selectThemeColors = createSelector(
  [(state: RootState) => state.storeInfo.storeInfo?.data?.storeinfo],
  (storeInfo) => {
    if (!storeInfo) return null;
    return {
      backgroundColor: storeInfo.backgroundColor || "#ffffff",
      buttonBackgroundColor: storeInfo.buttonBackgroundColor || "#111111",
      textColor: storeInfo.textColor || "#000000",
      bodyTextColor: storeInfo.bodyTextColor || "#000000",
      buttonTextColor: storeInfo.buttonTextColor || "#ffffff",
      bottomFooterBackgroundColor: storeInfo.bottomFooterBackgroundColor || "#f4f691",
      fontFamily: storeInfo.fontFamily || "Inter",
    };
  }
);


export const selectCart = createSelector(
  [(state: RootState) => state.cart],
  (cart) => ({
    isCartOpen: cart.isCartOpen,
    cartItems: cart.cartItems,
    loading: cart.loading,
  })
);

// Contact Selectors
export const selectContactState = (state: RootState) => state.contact;

export const selectContactData = createSelector(
  [selectContactState],
  (contact) => ({
    loading: contact.loading,
    error: contact.error,
    success: contact.success,
  })
);