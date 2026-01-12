"use client";

import Link from "next/link";
import Icon from "../customcomponents/Icon";
import { ChevronDown } from "lucide-react";
import { useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";

interface MobileDrawerProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isMobileCategoryOpen: boolean;
  setIsMobileCategoryOpen: (open: boolean) => void;
  loading?: boolean;
  categories?: Array<{ sub_category_id: number; sub_category_name: string }>;
  theme?: any;
  headerTextColor?: string;
}

export default function MobileDrawer({
  isMenuOpen,
  setIsMenuOpen,
  isMobileCategoryOpen,
  setIsMobileCategoryOpen,
  loading = false,
  categories = [],
  theme,
  headerTextColor = "#111111",
}: MobileDrawerProps) {
  const { storeInfo, isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );

  if (!isMenuOpen) return null;

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Track Order", to: "/track-order" },
  ].filter((item) => {
    // Hide About, Contact, and Track Order for wholesalers
    if (isWholesaler) {
      return !["About", "Contact", "Track Order"].includes(item.label);
    }
    return true;
  });

  return (
    <aside
      id="mobile-drawer"
      role="dialog"
      aria-modal="true"
      className="fixed top-0 left-0 h-screen w-72 max-w-[80%] z-100 lg:hidden border-r border-black/10 shadow-lg"
      style={{
        backgroundColor: theme?.headerBackgroundColor || "#ffffff",
        color: headerTextColor || "#111111",
        scrollbarWidth: "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
        <span className="uppercase font-semibold">
          {storeInfo?.data?.storeinfo?.store_name || "Store name"}
        </span>
        <button
          type="button"
          className="inline-flex items-center justify-center w-10 h-10 cursor-pointer"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
          autoFocus
        >
          <Icon name="close" stroke={headerTextColor || "#111111"} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col p-4 gap-2 items-start h-dvh overflow-y-auto scroll-bar">
        {/* Home Link */}
        <Link
          href="/"
          className="w-full py-2 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: headerTextColor || "#111111" }}
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>

        {/* Category Dropdown - After Home */}
        <div className="w-full">
          <Link
            href="/categories"
            onClick={() => setIsMenuOpen(false)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: headerTextColor || "#111111" }}
          >
            <span>Categories</span>
            <ChevronDown
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMobileCategoryOpen(!isMobileCategoryOpen);
              }}
              className={`w-4 h-4 transition-transform ${
                isMobileCategoryOpen ? "rotate-180" : ""
              }`}
            />
          </Link>
          {isMobileCategoryOpen && (
            <div className="pl-4 mt-2 space-y-1">
              {loading ? (
                <div className="py-4 text-center">Loading...</div>
              ) : categories.length > 0 ? (
                categories.map((category: any) => (
                  <Link
                    key={category.sub_category_id}
                    href={`/shop?categories=${encodeURIComponent(
                      category.sub_category_name.toLowerCase()
                    )}`}
                    className="block py-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: headerTextColor || "#111111" }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileCategoryOpen(false);
                    }}
                  >
                    {category.sub_category_name}
                  </Link>
                ))
              ) : (
                <div className="py-2 text-sm opacity-50">
                  No categories found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other navigation items (excluding Home) */}
        {navItems
          .filter((item) => item.label !== "Home")
          .map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className="w-full py-2 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: headerTextColor || "#111111" }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
