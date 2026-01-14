/**
 * Polyfill for requestIdleCallback
 * Safari and iOS Safari don't support requestIdleCallback natively
 * This provides a fallback using setTimeout
 */

interface IdleCallbackOptions {
  timeout?: number;
}

interface IdleCallbackHandle {
  timeoutId: number | NodeJS.Timeout;
}

// Polyfill for requestIdleCallback
const requestIdleCallbackPolyfill = (
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: IdleCallbackOptions
): IdleCallbackHandle => {
  const start = Date.now();
  const timeout = options?.timeout || 0;
  const hasTimeout = timeout > 0;

  const executeCallback = (didTimeout: boolean) => {
    callback({
      didTimeout,
      timeRemaining: () => {
        // Simulate remaining time (typically 50ms in native implementation)
        const elapsed = Date.now() - start;
        return Math.max(0, 50 - elapsed);
      },
    });
  };

  // If timeout is specified, use it; otherwise use a minimal delay
  const delay = hasTimeout ? timeout : 1;

  const timeoutId = setTimeout(() => {
    executeCallback(hasTimeout);
  }, delay);
  
  return {
    timeoutId: timeoutId as number | NodeJS.Timeout,
  };
};

// Polyfill for cancelIdleCallback
const cancelIdleCallbackPolyfill = (handle: IdleCallbackHandle): void => {
  clearTimeout(handle.timeoutId);
};

// Export the polyfilled versions
export const requestIdleCallbackSafe = (
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: IdleCallbackOptions
): IdleCallbackHandle => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const nativeHandle = window.requestIdleCallback(callback, options);
    // Wrap native handle (which is a number) in our interface
    return {
      timeoutId: nativeHandle,
    };
  }
  return requestIdleCallbackPolyfill(callback, options);
};

export const cancelIdleCallbackSafe = (handle: IdleCallbackHandle): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    // Native cancelIdleCallback expects a number
    const timeoutId = typeof handle.timeoutId === 'number' 
      ? handle.timeoutId 
      : (handle.timeoutId as unknown as number);
    window.cancelIdleCallback(timeoutId);
  } else {
    cancelIdleCallbackPolyfill(handle);
  }
};

// Also polyfill globally if needed (for third-party libraries)
if (typeof window !== 'undefined') {
  if (!('requestIdleCallback' in window)) {
    // Create wrapper functions that match the native API signature
    // Native API: requestIdleCallback returns number, cancelIdleCallback takes number
    const nativeRequestIdleCallback = (
      callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
      options?: IdleCallbackOptions
    ): number => {
      const handle = requestIdleCallbackPolyfill(callback, options);
      // Return the timeoutId as number (works in browser environment)
      return typeof handle.timeoutId === 'number' 
        ? handle.timeoutId 
        : (handle.timeoutId as unknown as number);
    };

    const nativeCancelIdleCallback = (handle: number): void => {
      cancelIdleCallbackPolyfill({ timeoutId: handle });
    };

    // Polyfill the global window methods for third-party libraries
    interface WindowWithIdleCallback extends Window {
      requestIdleCallback: typeof nativeRequestIdleCallback;
      cancelIdleCallback: typeof nativeCancelIdleCallback;
    }
    const windowWithIdleCallback = window as WindowWithIdleCallback;
    windowWithIdleCallback.requestIdleCallback = nativeRequestIdleCallback;
    windowWithIdleCallback.cancelIdleCallback = nativeCancelIdleCallback;
  }
}

