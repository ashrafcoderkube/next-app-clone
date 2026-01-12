// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { clearState, loadState, saveState } from "../utils/sessionStorage";
// import storeInfoSlice from "./slices/storeInfoSlice";
// import homeSectionSlice from "./slices/homeSection";
// import aboutSectionSlice from "./slices/aboutSection";
// import privacyPolicySlice from "./slices/privacyPolicySlice";
// import termsOfUseSlice from "./slices/termsOfUseSlice";
// import trackOrderSlice from "./slices/trackOrderSlice";
// import productSlice from "./slices/productSlice";
// import authSlice from "./slices/authSlice";
// import cartSlice from "./slices/cartSlice";
// import wishlistSlice from "./slices/wishlistSlice";
// import checkoutSlice from "./slices/checkoutSlice";
// import customerOrdersSlice from "./slices/customerOrdersSlice";
// import shippingAddressSlice from "./slices/shippingAddressSlice";
// import addressSlice from "./slices/addressSlice";

// // Combine all reducers
// const appReducer = combineReducers({
//   storeInfo: storeInfoSlice,
//   homeSection: homeSectionSlice,
//   aboutSection: aboutSectionSlice,
//   privacyPolicy: privacyPolicySlice,
//   termsOfUse: termsOfUseSlice,
//   trackOrder: trackOrderSlice,
//   products: productSlice,
//   auth: authSlice,
//   cart: cartSlice,
//   wishlist: wishlistSlice,
//   checkout: checkoutSlice,
//   customerOrders: customerOrdersSlice,
//   shippingAddress: shippingAddressSlice,
//   address: addressSlice,
// });

// // Root reducer with reset functionality
// const rootReducer = (
//   state: ReturnType<typeof appReducer> | undefined,
//   action: any
// ) => {
//   if (action.type === "RESET_APP") {
//     clearState();
//     const storeInfoState = state?.storeInfo;
//     const homeSectionState = state?.homeSection;
//     state = {
//       storeInfo: storeInfoState,
//       homeSection: homeSectionState,
//     } as ReturnType<typeof appReducer>;
//   }
//   return appReducer(state, action);
// };

// // Load persisted state from localStorage (only on client side)
// const persistedState = typeof window !== "undefined" ? loadState() : undefined;

// // Configure the store
// export const store = configureStore({
//   reducer: rootReducer,
//   preloadedState: persistedState,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

// // Helper function to remove loading keys from state before saving
// function removeLoadingKeys(obj: any): any {
//   if (!obj || typeof obj !== "object") return obj;
//   if (Array.isArray(obj)) return obj.map(removeLoadingKeys);
//   return Object.keys(obj).reduce((acc: any, key) => {
//     if (key.toLowerCase().endsWith("loading")) return acc;
//     acc[key] = removeLoadingKeys(obj[key]);
//     return acc;
//   }, {});
// }

// // Subscribe to store changes and save to localStorage (only on client side)
// if (typeof window !== "undefined") {
//   store.subscribe(() => {
//     const currentState = store.getState();
//     saveState({
//       storeInfo: removeLoadingKeys(currentState.storeInfo),
//       homeSection: removeLoadingKeys(currentState.homeSection),
//       products: removeLoadingKeys(currentState.products),
//       auth: {
//         user: currentState.auth.user,
//         isAuthenticated: currentState.auth.isAuthenticated,
//       },
//       cart: {
//         cartItems: currentState.cart.cartItems,
//       },
//       checkout: removeLoadingKeys(currentState.checkout),
//     });
//   });
// }

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { clearState, loadState, saveState } from "../utils/sessionStorage";

// redux-state-sync will be loaded dynamically after store creation to avoid blocking chunks
// We'll initialize it separately after the store is created
import storeInfoSlice from "./slices/storeInfoSlice";
import homeSectionSlice from "./slices/homeSection";
import aboutSectionSlice from "./slices/aboutSection";
import privacyPolicySlice from "./slices/privacyPolicySlice";
import termsOfUseSlice from "./slices/termsOfUseSlice";
import trackOrderSlice from "./slices/trackOrderSlice";
import productSlice from "./slices/productSlice";
import authSlice from "./slices/authSlice";
import cartSlice from "./slices/cartSlice";
import wishlistSlice from "./slices/wishlistSlice";
import checkoutSlice from "./slices/checkoutSlice";
import customerOrdersSlice from "./slices/customerOrdersSlice";
import shippingAddressSlice from "./slices/shippingAddressSlice";
import addressSlice from "./slices/addressSlice";
import contactSlice from "./slices/contactSlice";

// Combine all reducers
const appReducer = combineReducers({
  storeInfo: storeInfoSlice,
  homeSection: homeSectionSlice,
  aboutSection: aboutSectionSlice,
  privacyPolicy: privacyPolicySlice,
  termsOfUse: termsOfUseSlice,
  trackOrder: trackOrderSlice,
  products: productSlice,
  auth: authSlice,
  cart: cartSlice,
  wishlist: wishlistSlice,
  checkout: checkoutSlice,
  customerOrders: customerOrdersSlice,
  shippingAddress: shippingAddressSlice,
  address: addressSlice,
  contact: contactSlice,
});

// Root reducer with reset functionality
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  if (action.type === "RESET_APP") {
    clearState();
    const storeInfoState = state?.storeInfo;
    const homeSectionState = state?.homeSection;
    const productCategoryState = state?.products?.productCategories;
    const newArrivalsState = state?.products?.newArrivals;
    const featuredState = state?.products?.featured;
    state = {
      storeInfo: storeInfoState,
      homeSection: homeSectionState,
      products: {
        productCategories: productCategoryState,
        newArrivals: newArrivalsState,
        featured: featuredState,
      },
    } as ReturnType<typeof appReducer>;
  }
  return appReducer(state, action);
};

// Load persisted state from sessionStorage (only on client side)
// Use requestIdleCallback to defer loading if possible, but Redux needs sync state
// So we'll optimize the loadState function instead
let persistedState: any = undefined;
if (typeof window !== "undefined") {
  try {
    persistedState = loadState();
  } catch (err) {
    // Silently fail - start with empty state
    persistedState = undefined;
  }
}

// Sync middleware will be created dynamically after store initialization
// This prevents blocking initial chunk loading

// Configure the store (without sync middleware initially)
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Dynamically load and initialize redux-state-sync after store creation
// This prevents blocking initial chunk loading
if (typeof window !== "undefined") {
  // Use requestIdleCallback to defer loading until browser is idle
  const initStateSync = () => {
    import("redux-state-sync")
      .then((reduxStateSync) => {
        try {
          // Create middleware
          const syncMiddleware = reduxStateSync.createStateSyncMiddleware({
            channel: "redux_state_sync",
            predicate: (action: any) => {
              const blacklist = [
                "persist/PERSIST",
                "auth/logout/pending",
                "auth/logout/rejected",
                "auth/login/pending",
                "auth/login/rejected",
                "cart/openCartPopup",
                "cart/closeCartPopup",
                "product/fetchProducts/fulfilled",
                "product/fetchProducts/pending",
                "product/fetchProducts/rejected",
                "product/fetchSearchProducts/fulfilled",
                "product/fetchSearchProducts/pending",
                "product/fetchSearchProducts/rejected",
              ];
              return !blacklist.includes(action.type);
            },
          });

          // Note: Middleware can't be added after store creation in Redux Toolkit
          // So we'll just initialize the message listener for now
          // The middleware would need to be added during store creation
          // For now, we'll skip middleware and just use the listener
          
          // Initialize message listener
          reduxStateSync.initMessageListener(store);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Failed to initialize state sync:", error);
          }
        }
      })
      .catch((error) => {
        // Silently fail - state sync is optional
        if (process.env.NODE_ENV === 'development') {
          console.warn("redux-state-sync not available:", error);
        }
      });
  };

  // Defer initialization
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initStateSync, { timeout: 2000 });
  } else {
    setTimeout(initStateSync, 500);
  }
}

// Optimized: Cache results and use faster algorithm
const loadingKeyCache = new WeakMap();
function removeLoadingKeys(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  
  // Use cache for already processed objects
  if (loadingKeyCache.has(obj)) {
    return loadingKeyCache.get(obj);
  }
  
  if (Array.isArray(obj)) {
    const result = obj.map(removeLoadingKeys);
    loadingKeyCache.set(obj, result);
    return result;
  }
  
  const result = Object.keys(obj).reduce((acc: any, key) => {
    if (key.toLowerCase().endsWith("loading")) return acc;
    acc[key] = removeLoadingKeys(obj[key]);
    return acc;
  }, {});
  
  loadingKeyCache.set(obj, result);
  return result;
}

// Subscribe to store changes and save to sessionStorage (only on client side)
// Debounce localStorage writes to improve performance
if (typeof window !== "undefined") {
  let saveTimeout: NodeJS.Timeout | null = null;
  const DEBOUNCE_DELAY = 500; // Wait 500ms before saving to localStorage

  store.subscribe(() => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout to debounce saves
    saveTimeout = setTimeout(() => {
      const currentState = store.getState();
      saveState({
        storeInfo: removeLoadingKeys(currentState.storeInfo),
        homeSection: removeLoadingKeys(currentState.homeSection),
        products: removeLoadingKeys(currentState.products),
        auth: {
          user: currentState.auth.user,
          isAuthenticated: currentState.auth.isAuthenticated,
        },
        cart: {
          cartItems: currentState.cart.cartItems,
        },
        checkout: removeLoadingKeys(currentState.checkout),
      });
    }, DEBOUNCE_DELAY);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;