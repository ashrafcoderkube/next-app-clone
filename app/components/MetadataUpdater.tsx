"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectStoreInfo } from "../redux/selectors";
import { usePathname } from "next/navigation";

// Cache for DOM queries and computed values
const domCache = new Map<string, HTMLLinkElement>();
const pathnameCache = new Map<string, string>();

const MetadataUpdater = React.memo(function MetadataUpdater() {
  const { storeInfo } = useAppSelector(selectStoreInfo);
  const pathname = usePathname();
  const createdLinksRef = useRef<HTMLLinkElement[]>([]);

  // Memoize page name computation
  const pageName = useMemo(() => {
    if (pathnameCache.has(pathname)) {
      return pathnameCache.get(pathname)!;
    }

    const computed = pathname === "/"
      ? "Home"
      : pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "";

    pathnameCache.set(pathname, computed);
    return computed;
  }, [pathname]);

  // Memoize store data
  const storeData = useMemo(() => {
    if (!storeInfo?.data?.storeinfo) return null;

    const storeInfoData = storeInfo.data.storeinfo;
    return {
      storeName: storeInfoData.store_name || "JDWebnship",
      baseTitle: storeInfoData.meta_title || storeInfoData.store_name || "JDWebnship",
      favicon: storeInfoData.favicon || storeInfoData.logo,
    };
  }, [storeInfo]);

  // Optimize DOM queries with caching
  const getOrCreateLink = useCallback((rel: string, href: string) => {
    const cacheKey = `link-${rel}`;
    let link = domCache.get(cacheKey);

    if (!link) {
      link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
        createdLinksRef.current.push(link);
      }
      domCache.set(cacheKey, link);
    }

    link.href = href;
    return link;
  }, []);

  useEffect(() => {
    if (!storeData) return;

    // Update document title immediately
    const title = pathname === "/"
      ? `${storeData.baseTitle} | Home`
      : `${storeData.baseTitle} | ${pageName}`;

    document.title = title;

    // Update favicon with optimized DOM queries
    if (storeData.favicon) {
      const faviconRels = ['icon', 'shortcut icon', 'apple-touch-icon'];
      faviconRels.forEach((rel) => getOrCreateLink(rel, storeData.favicon!));
    }

    // Cleanup function
    return () => {
      createdLinksRef.current.forEach((link) => {
        try {
          if (link && link.parentNode) {
            link.parentNode.removeChild(link);
          }
        } catch (e) {
          // Silently ignore errors
        }
      });
      createdLinksRef.current = [];
    };
  }, [storeData, pathname, pageName, getOrCreateLink]);

  return null;
});

MetadataUpdater.displayName = "MetadataUpdater";

export default MetadataUpdater;