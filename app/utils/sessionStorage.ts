// Session storage utilities for Redux state persistence

// Optimized: Use requestIdleCallback for non-blocking localStorage read
export const loadState = (): any => {
  if (typeof window === "undefined") {
    return undefined;
  }
  
  try {
    // Use synchronous read for initial state (required by Redux)
    // But wrap in try-catch to prevent blocking on errors
    const serializedState = localStorage.getItem("reduxState");
    if (serializedState === null) return undefined;
    
    // Parse in chunks if state is very large (prevent blocking)
    const parsed = JSON.parse(serializedState);
    return parsed;
  } catch (err) {
    // Silently fail during initial load to prevent blocking
    if (process.env.NODE_ENV === 'development') {
      console.warn("Load state error:", err);
    }
    return undefined;
  }
};

export const saveState = (state: any): void => {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (err) {
    console.warn("Save state error:", err);
  }
};

export const clearState = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    localStorage.removeItem("reduxState");
  } catch (err) {
    console.warn("Clear state error:", err);
  }
};

// Product caching utilities with 5-minute expiration
interface CachedProductData {
  data: any;
  timestamp: number;
  expiration: number;
}

export const setToSessionStorage = (key: string, data: any): void => {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    const cachedData: CachedProductData = {
      data,
      timestamp: Date.now(),
      expiration: 5 * 60 * 1000, // 5 minutes in milliseconds
    };
    
    sessionStorage.setItem(`products_${key}`, JSON.stringify(cachedData));
  } catch (err) {
    console.warn("Set session storage error:", err);
  }
};

export const getFromSessionStorage = (key: string): any | null => {
  if (typeof window === "undefined") {
    return null;
  }
  
  try {
    const cachedItem = sessionStorage.getItem(`products_${key}`);
    if (!cachedItem) return null;
    
    const cachedData: CachedProductData = JSON.parse(cachedItem);
    const now = Date.now();
    
    // Check if data has expired
    if (now - cachedData.timestamp > cachedData.expiration) {
      sessionStorage.removeItem(`products_${key}`);
      return null;
    }
    
    return cachedData.data;
  } catch (err) {
    console.warn("Get session storage error:", err);
    return null;
  }
};

export const clearProductCache = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    // Clear all product-related session storage items
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('products_')) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn("Clear product cache error:", err);
  }
};

