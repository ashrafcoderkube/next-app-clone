"use client";
import React, { useEffect, useState } from "react";
import CardComponent from "../customcomponents/CardComponent";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchWishList } from "../../redux/slices/wishlistSlice";
import Icon from "../customcomponents/Icon";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";

const Wishlist = () => {
  const dispatch = useDispatch<any>();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { wishlist } = useSelector((state: any) => state.wishlist);
  const { theme } = useTheme();
  const wishlistData = wishlist?.data?.wishlist;
  const themeId = useSelector((state: any) => state.storeInfo?.themeId);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isClient, setIsClient] = useState(false);

  // Initialize viewMode from localStorage on client side only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("wishlistViewMode");
      if (savedViewMode === "list" || savedViewMode === "grid") {
        setViewMode(savedViewMode);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishList());
    }
  }, [dispatch, isAuthenticated]);

  // Persist viewMode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (themeId === 2) {
      localStorage.setItem("wishlistViewMode", viewMode);
    }
    if (themeId !== 2 && themeId !== 6) {
      localStorage.removeItem("wishlistViewMode");
      setViewMode("grid");
    }
  }, [viewMode, themeId]);

  return (
    <div className="w-full account-box">
      <div className="my-account-container flex justify-between w-full items-center">
        <h3 className="text-2xl font-bold">Wishlist</h3>
        {themeId === 2 && (
          <div className="flex items-center justify-between gap-2 flex-xl-grow-1">
            <span className="font-medium hidden sm:block">View:</span>
            {/* Grid View Button */}
            <button
              onClick={() => setViewMode("grid")}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer `}
              style={{
                backgroundColor: theme?.backgroundColor,
                // color: theme?.textColor,
                borderColor:
                  viewMode === "grid" ? theme?.backgroundColor : "transparent",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18.75 4.5H5.25C4.83578 4.5 4.5 4.83578 4.5 5.25V18.75C4.5 19.1642 4.83578 19.1642 5.25 19.5H18.75C19.1642 19.5 19.5 19.1642 19.5 18.75V5.25C19.5 4.83578 19.1642 4.5 18.75 4.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 4.5V19.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 12H19.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* List View Button */}
            <button
              onClick={() => setViewMode("list")}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer `}
              style={{
                backgroundColor: theme?.backgroundColor,
                // color: theme?.textColor,
                borderColor:
                  viewMode === "list" ? theme?.backgroundColor : "transparent",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6H20.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12H20.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 18H20.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 6H5.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 12H5.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 18H5.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <hr className="my-account-container-hr" />

      {/* Wishlist Grid */}
      <div
        className={
          viewMode === "list"
            ? "grid grid-cols-1 gap-4 md:gap-6 mt-[1.5rem]"
            : "grid-responsive mt-[1.5rem]"
        }
      >
        {wishlistData?.length > 0 ? (
          wishlistData.map((wishlist: any, index: number) => (
            <CardComponent
              key={index}
              product={wishlist}
              isWishlistKey={true}
              viewMode={viewMode}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-[0.9375rem]">
            <Icon
              name="empty"
              className="w-[6.25rem] h-[6.25rem]"
              viewBox="0 0 100 100"
              // stroke={textColor}
            />
            <p className="text-center">Your wishlist is empty.</p>
            <Link
              href="/shop"
              className="inline-flex text-sm sm:text-lg gap-2 btn px-16 py-4 rounded-lg w-max focus:outline-none items-center"
            >
              Add to Wishlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
