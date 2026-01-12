"use client";

import React, { useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { useTheme } from "../../contexts/ThemeContext";

export default function BottomFooter() {
  const themeContext = useTheme() || {};
  const { storeInfo, themeId } = useAppSelector((state: RootState) => state.storeInfo);
  
  // Get store info data
  const storeInfoData = storeInfo?.data?.storeinfo;
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    // Placeholder submit handler
    alert("Thank you for Subscribe");
    setEmail("");
  };

  // Theme 6: Newsletter Section - Full Width Banner
  if (themeId === 6) {
    return (
      <div
        style={{
          backgroundColor: themeContext?.bottomFooterBackgroundColor || "#1f2937",
          color: themeContext?.buttonTextColor || "#ffffff",
        }}
      >
        <div className="px-container mx-auto">
          <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">
                Join the {storeInfoData?.store_name || "Store"} Community
              </h3>
              <p className="text-sm">
                Get exclusive access to new arrivals and special offers
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-colors"
                style={{
                  backgroundColor: `${themeContext?.buttonBackgroundColor || "#10b981"}1A`,
                  color: themeContext?.buttonTextColor || "#ffffff",
                }}
              />
              <button
                name="Subscribe"
                type="submit"
                className="btn px-6 py-3 font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 !bg-white"
                style={{
                  color: themeContext?.buttonBackgroundColor || "#10b981",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Default layout for other themes
  return (
    <section
      className="bottom-footer text-center px-[1rem] bottom-footer-radius -mb-[70px] z-1"
      style={{
        backgroundColor: themeContext?.bottomFooterBackgroundColor || "#1f2937",
        color: themeContext?.buttonTextColor || "#ffffff",
      }}
    >
      <form
        className="mx-auto flex flex-col items-center justify-center gap-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-[2rem] lg:text-[2.625rem] font-bold">
          Join Our Newsletter
        </h2>
        <p className="text-[1.125rem] lg:text-[22px]">
          We love to surprise our subscribers with occasional gifts.
        </p>
        <div className="input-group flex justify-center items-stretch mx-4 border-1 overflow-hidden">
          <input
            type="text"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-lg px-[1.5rem] py-[0.9375rem] sm:w-[18.75rem] w-[11.875rem] rounded-l-[0.625rem] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-0"
          />
          <button
            name="Subscribe"
            className="btn sm:px-[1.5rem] px-[0.9rem] py-[0.9375rem] !rounded-[0] lg:text-lg focus:outline-none transition-all duration-500 ease-in-out hover:brightness-80"
            type="submit"
          >
            Subscribe
          </button>
        </div>
      </form>
    </section>
  );
}

