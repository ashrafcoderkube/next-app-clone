"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setStoreInfo } from "../redux/slices/storeInfoSlice";
import { selectStoreInfo } from "../redux/selectors";
import { StoreInfoResponse } from "../types/storeinfo";
import { initGA } from "../utils/analytics";
import axiosInstance from "../utils/axiosInstance";
import { requestIdleCallbackSafe } from "../utils/requestIdleCallback";

export default function StoreInfoInitializer() {
  const dispatch = useAppDispatch();
  const gaInitializedRef = useRef(false);
  const { storeInfo } = useAppSelector(selectStoreInfo);

  // Fetch store info from API on client side
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await axiosInstance.get<StoreInfoResponse>("/home/storeInfo");
        if (response.data && response.data.success) {
          dispatch(setStoreInfo(response.data));
        }
      } catch (error) {
        console.error("Failed to fetch store info:", error);
      }
    };

    // Only fetch if storeInfo is not already loaded
    if (!storeInfo) {
      fetchStoreInfo();
    }
  }, [dispatch, storeInfo]);

  // Defer GA initialization to avoid blocking initial render
  useEffect(() => {
    const GA_ID = storeInfo?.data?.storeinfo?.google_analytics_id;

    if (!GA_ID) return;
    if (gaInitializedRef.current) return;

    gaInitializedRef.current = true;

    requestIdleCallbackSafe(() => {
      initGA(GA_ID);
    }, { timeout: 2000 });
  }, [storeInfo]);

  // This component doesn't render anything
  return null;
}
