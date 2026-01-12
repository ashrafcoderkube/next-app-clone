"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "../customcomponents/Icon";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { useTheme } from "@/app/contexts/ThemeContext";

interface TopHeaderProps {
  visible?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function TopHeader({
  visible = true,
  onHeightChange,
}: TopHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const themeContext = useTheme() || {};
  const { topHeaderTextColor } = themeContext;
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { storeInfo, themeId } = useAppSelector((state: RootState) => state.storeInfo);

  const topHeaderBgColor = themeContext?.topHeaderBackgroundColor || "#f8f9fa";

  // Measure height
  useEffect(() => {
    if (!ref.current) return;
    let rafId: number | null = null;
    let lastHeight = 0;

    const measure = () => {
      const h = ref.current?.offsetHeight || 0;
      // Only update if height actually changed to prevent unnecessary updates
      if (h !== lastHeight && onHeightChange) {
        lastHeight = h;
        onHeightChange(h);
      }
    };

    const throttledMeasure = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        measure();
        rafId = null;
      });
    };

    // Add a small delay to ensure layout is settled, especially for theme changes
    const timeoutId = setTimeout(() => {
      measure();
    }, 0);

    const ro = new ResizeObserver(throttledMeasure);
    ro.observe(ref.current);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [onHeightChange, themeId]);

  // Animate visibility (simplified CSS transition instead of GSAP)
  useEffect(() => {
    if (!ref.current) return;
    if (visible) {
      ref.current.style.transform = "translateY(0)";
      ref.current.style.opacity = "1";
    } else {
      ref.current.style.transform = "translateY(-100%)";
      ref.current.style.opacity = "0";
    }
  }, [visible]);

  // Theme 4 & 5 - Simple layout
  if (themeId === 4 || themeId === 5) {
    return (
      <div
        ref={ref}
        className="top-header fixed top-0 left-0 right-0 z-50 text-center py-2 text-md transition-all duration-350 ease-out"
        style={{
          backgroundColor: topHeaderBgColor || "#111111",
          color: topHeaderTextColor || "#333",
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        {storeInfo?.data?.storeinfo?.offer_text ||
          "All over India Delivery Available."}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="top-header fixed top-0 left-0 right-0 z-50 py-2.5 sm:py-[0.75] md:py-3.75 text-xs sm:text-sm border-b border-gray-200 transition-all duration-350 ease-out"
      style={{
        backgroundColor: topHeaderBgColor,
        color: topHeaderTextColor,
        willChange: "transform",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="w-full px-container mx-auto">
        <div className="flex items-center justify-between mx-auto text-center">
          <div className="sm:flex text-base gap-2 sm:gap-4 customer-care hidden top-header-order1">
            {storeInfo?.data?.storeinfo?.email && (
              <Link
                href={`mailto:${storeInfo?.data?.storeinfo?.email}`}
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out items-center"
              >
                <span
                  className="icon"
                  onMouseEnter={() => setIsHovered("email")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon
                    name="mail"
                    stroke={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "email"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                    strokeWidth="2"
                    fill="none"
                    className="w-5 h-5"
                  />
                </span>
                {themeId !== 6 && (
                  <span className="hidden xl:block text-sm">
                    {storeInfo.data.storeinfo.email}
                  </span>
                )}
              </Link>
            )}
            {storeInfo?.data?.storeinfo?.mobile_no && storeInfo?.data?.storeinfo?.mobile_no?.length > 0 && (
              <Link
                href={`tel:${storeInfo?.data?.storeinfo?.mobile_no}`}
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center"
              >
                <span
                  className="icon"
                  onMouseEnter={() => setIsHovered("phone")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon
                    name="call"
                    size={24}
                    className="w-5 h-5"
                    stroke={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "phone"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                    strokeWidth="2"
                  />
                </span>
                {themeId !== 6 && (
                  <span className="hidden xl:block">
                    {storeInfo?.data?.storeinfo?.mobile_no}
                  </span>
                )}
              </Link>
            )}
          </div>
          <span className="font-medium text-[0.875rem] md:text-[1rem] center-nav flex-1 flex items-center justify-center relative sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 top-header-order2">
            {storeInfo?.data?.storeinfo?.offer_text ||
              "All over India Delivery Available."}
          </span>
          <div className="sm:flex hidden text-base gap-2 sm:gap-4 social-login top-header-order3">
            {storeInfo?.data?.storeinfo?.facebook_url && (
              <Link
                href={storeInfo?.data?.storeinfo?.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center"
              >
                <span
                  className="icon"
                  onMouseEnter={() => setIsHovered("facebook")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon
                    name="facebook"
                    strokeWidth="0.2"
                    fill={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "facebook"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                  />
                </span>
                {themeId !== 6 && (
                  <span className="hidden xl:block">Facebook</span>
                )}
              </Link>
            )}
            {storeInfo?.data?.storeinfo?.instagram_url && (
              <Link
                href={storeInfo?.data?.storeinfo?.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center"
              >
                <span
                  className="icon"
                  onMouseEnter={() => setIsHovered("instagram")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon
                    name="instagram"
                    strokeWidth="0.2"
                    fill={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "instagram"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                  />
                </span>
                {themeId !== 6 && (
                  <span className="hidden xl:block">Instagram</span>
                )}
              </Link>
            )}
            {storeInfo?.data?.storeinfo?.twitter_url && (
              <Link
                href={storeInfo?.data?.storeinfo?.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center"
              >
                <span
                  className="icon"
                  onMouseEnter={() => setIsHovered("twitter")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon
                    name="twitter"
                    size={18}
                    fill={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "twitter"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                    stroke={
                      themeId !== 6
                        ? topHeaderTextColor
                        : isHovered === "twitter"
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : topHeaderTextColor
                    }
                    viewBox="0 0 24 24"
                    strokeWidth="0.2"
                    className="w-[18px] h-[18px]"
                  />
                </span>
                {themeId !== 6 && (
                  <span className="hidden xl:block">X Corp.</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

