import { useEffect, useRef, useState, useMemo } from "react";

export default function LazyOnVisible({ children, className = "", options = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
 
  // Memoize observer options to prevent unnecessary re-initialization
  const observerOptions = useMemo(
    () => ({
      // Default: trigger when 10% of element is visible
      threshold: 0.1,
      // Start loading slightly before element enters viewport
      rootMargin: "50px",
      ...options,
    }),
    // Only recreate if options actually change (convert to string for deep comparison)
    [JSON.stringify(options)]
  );
 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Disconnect after first intersection to avoid re-observing
          observer.disconnect();
        }
      },
      observerOptions
    );
 
    if (ref.current) {
      observer.observe(ref.current);
    }
 
    return () => {
      observer.disconnect();
    };
  }, [observerOptions]);
 
  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}