"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { MyOrderIcon } from "../customcomponents/Icon";
import { useTheme } from "@/app/contexts/ThemeContext";
import Link from "next/link";
import { RootState } from "@/app/redux/store";
import { useAppSelector } from "@/app/redux/hooks";
import { useRouter } from "next/navigation";
import ConfirmLogoutModal from "../model/ConfirmLogoutModal";

function Profile() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const themeContext = useTheme() || {};
  const { headerTextColor } = themeContext;
  const navigate = useRouter();

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className="relative h-full" ref={dropdownRef}>
      <button
        onClick={() => {
          if (!isAuthenticated) {
            navigate.push("/signin");
          } else {
            setIsProfileDropdownOpen((prev) => !prev);
          }
        }}
        className="h-full flex items-center cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Profile"
        type="button"
      >
        <Icon
          name="myProfile"
          size={20}
          stroke={headerTextColor || "#111111"}
          strokeWidth="1.625"
          className="w-6 h-6 md:w-[1.625rem] md:h-[1.625rem]"
        />
      </button>

      {isProfileDropdownOpen && isAuthenticated && (
        <div
          className="absolute top-full w-80 z-50 profile-dropdown
            left-1/2 sm:left-auto sm:right-0
             sm:translate-x-0"
        >
          <div
            className="bg-white border !border-gray-200/40 rounded-lg shadow-xl p-6"
            style={{
              backgroundColor: themeContext?.headerBackgroundColor || "#ffffff",
              // borderColor: theme?.headerBackgroundColor || "#e5e7eb",
            }}
          >
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-200/40">
                <Link
                  href="/my-account"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon
                      name="myAccount"
                      className="w-5 h-5 text-blue-600"
                      strokeWidth="2"
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: headerTextColor || "#111111" }}
                    >
                      My Account
                    </p>
                    <p className="text-sm text-gray-500">Manage your profile</p>
                  </div>
                </Link>
              </div>

              <div className="space-y-2">
                <Link
                  href="/my-account/orders"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="profile-menu-item flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 
                  transition-all duration-200 group hover:text-blue-600"
                >
                  <MyOrderIcon />
                  <span className="font-medium">My Orders</span>
                </Link>

                <div className="pt-2 border-t border-gray-200/40">
                  <button
                    onClick={() => {
                      setOpen(true);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="profile-menu-item w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 group text-left cursor-pointer"
                  >
                    <Icon
                      name="logout2"
                      size={24}
                      className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors duration-200"
                      strokeWidth="0.2"
                    />
                    <span className="font-medium text-red-600 group-hover:text-red-700">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmLogoutModal open={open} setOpen={setOpen} />
    </div>
  );
}

export default Profile;
