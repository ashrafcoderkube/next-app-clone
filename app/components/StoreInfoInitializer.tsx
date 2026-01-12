"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setStoreInfo } from "../redux/slices/storeInfoSlice";
import { selectStoreInfo } from "../redux/selectors";
import { StoreInfoResponse } from "../types/storeinfo";
import { initGA } from "../utils/analytics";
import axiosInstance from "../utils/axiosInstance";

export default function StoreInfoInitializer() {
  const dispatch = useAppDispatch();
  const { storeInfo } = useAppSelector(selectStoreInfo);
  const gaInitializedRef = useRef(false);

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

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        initGA(GA_ID);
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        initGA(GA_ID);
      }, 100);
    }
  }, [storeInfo]);

  // This component doesn't render anything
  return null;
}
