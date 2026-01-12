"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// Swiper CSS imported globally in layout.tsx - no need to import here
import {
  Search as SearchIcon,
  X,
  Menu,
  ChevronDown,
  UserCircle,
  ClipboardList,
  LogIn,
} from "lucide-react";
import Profile from "./Profile";
import MobileDrawer from "./MobileDrawer";
import Icon from "../customcomponents/Icon";
import Loader from "../customcomponents/Loader";
import CategoryGrid from "../customcomponents/CategoryGrid";
import OrderDetailsPopup from "../model/OrderDetailsPopup";
import ConfirmLogoutModal from "../model/ConfirmLogoutModal";
import MiniCart from "./minicart";
import Search from "./Search";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { StoreInfoResponse } from "../../types/storeinfo";
import { useTheme } from "@/app/contexts/ThemeContext";
import { closeCartPopup } from "@/app/redux/slices/cartSlice";
import SafeImage from "../SafeImage";

// Container Component
const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`px-container ${className}`}>{children}</div>;
};

interface HeaderProps {
  offsetY?: number;
  onHeightChange?: (height: number) => void;
  hasShadow?: boolean;
}

export default function Header({
  offsetY = 0,
  onHeightChange,
  hasShadow = false,
}: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get data from Redux store
  const { isCartOpen, cartItems } = useAppSelector(
    (state: RootState) => state.cart
  );
  const { productCategories } = useAppSelector(
    (state: RootState) => state.products
  );
  const { storeInfo, loading, themeId } = useAppSelector(
    (state: RootState) => state.storeInfo
  );
  const themeContext = useTheme() || {};
  const { textColor, headerTextColor } = themeContext;

  // Map categories to include name and image properties for compatibility
  const categories = useMemo(
    () => productCategories?.sub_categories || [],
    [productCategories?.sub_categories]
  );

  const { openOrderDetail, order } = useAppSelector(
    (state: RootState) => state.trackOrder
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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

  // Set position based on offsetY (replaced GSAP with CSS transform)
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.transform = `translateY(${offsetY}px)`;
    ref.current.style.transition =
      "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)";
  }, [offsetY]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsCategoryDropdownOpen(false);
      setIsShopMegaMenuOpen(false);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsCategoryDropdownOpen(true);
    // setShowAllCategories(false);
  };

  const handleCategoryMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
      setShowAllCategories(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
      setShowAllCategories(false);
    }, 300);
  };

  const handleShowMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowAllCategories(true);
  };

  const handleShowLessClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowAllCategories(false);
  };

  const CategoryDropdown = ({
    themeId,
    isHovered,
    setIsHovered,
  }: {
    themeId?: number;
    isHovered?: string | null;
    setIsHovered?: (value: string | null) => void;
  } = {}) => {
    // Check if category is active based on pathname or search params
    const isOnCategoryPage = pathname === "/categories";
    const hasCategoryParam = searchParams?.toString().includes("categories=");
    const isCategoryActive =
      isOnCategoryPage || hasCategoryParam || isCategoryDropdownOpen;
    const isHoveredCategory = isHovered === "category";

    // For theme 6, apply active/hover styling similar to other nav items
    const isTheme6 = themeId === 6;
    const categoryLinkStyle = isTheme6
      ? {
          color:
            isCategoryActive || isHoveredCategory
              ? themeContext?.buttonBackgroundColor
              : headerTextColor,
          backgroundColor:
            isCategoryActive || isHoveredCategory
              ? `${themeContext?.buttonBackgroundColor}1A`
              : "transparent",
        }
      : {
          color: headerTextColor || "#111111",
        };

    const categoryLinkClassName = isTheme6
      ? "px-4 py-2 rounded-xl text-sm font-medium h-full flex items-center rounded-xl transition-colors duration-300"
      : "category_item relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none transition-colors duration-300 lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-75";

    return (
      <div
        className="relative h-full"
        onMouseEnter={() => {
          handleCategoryMouseEnter();
          if (isTheme6 && setIsHovered) {
            setIsHovered("category");
          }
        }}
        onMouseLeave={() => {
          handleCategoryMouseLeave();
          if (isTheme6 && setIsHovered) {
            setIsHovered(null);
          }
        }}
      >
        <Link
          className={categoryLinkClassName}
          href="/categories"
          prefetch={false}
          style={categoryLinkStyle}
        >
          Category
          <Icon
            name="chevronDown"
            strokeWidth={2}
            className={`ml-1 w-4 h-4 transition-transform duration-200 ${
              isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Link>

        {isCategoryDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-0 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 flex flex-col"
            style={{
              backgroundColor: themeContext?.headerBackgroundColor,
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            {loading ? (
              <Loader />
            ) : categories.length > 0 ? (
              <>
                <div className="max-h-[370px] overflow-y-auto scroll-bar">
                  {categories
                    .slice(0, showAllCategories ? undefined : 10)
                    .map((category: any) => {
                      return (
                        <Link
                          key={category.sub_category_id}
                          href={`/shop?categories=${encodeURIComponent(
                            category.sub_category_name.toLowerCase()
                          )}`}
                          prefetch={false}
                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                          style={{
                            color: headerTextColor || "#111111",
                            backgroundColor:
                              themeContext?.headerBackgroundColor || "#ffffff",
                          }}
                          onMouseEnter={(e) =>
                            ((e.target as HTMLElement).style.backgroundColor =
                              "rgba(0,0,0,0.05)")
                          }
                          onMouseLeave={(e) =>
                            ((e.target as HTMLElement).style.backgroundColor =
                              themeContext?.headerBackgroundColor || "#ffffff")
                          }
                        >
                          {category.sub_category_name}
                        </Link>
                      );
                    })}
                </div>
                {categories.length > 10 && (
                  <button
                    name="Show more"
                    className="font-bold cursor-pointer block w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 transition-colors duration-200 border-t border-gray-200 sticky bottom-0"
                    style={{
                      color: headerTextColor || "#111111",
                      backgroundColor:
                        themeContext?.headerBackgroundColor || "#ffffff",
                    }}
                    onClick={
                      showAllCategories
                        ? handleShowLessClick
                        : handleShowMoreClick
                    }
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        "rgba(0,0,0,0.05)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        themeContext?.headerBackgroundColor || "#ffffff")
                    }
                  >
                    {showAllCategories ? "Show less" : "Show more"}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center p-4">
                <p
                  className="text-sm "
                  style={{
                    color: textColor || "#1e293b",
                  }}
                >
                  No categories found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Track Order", to: "/track-order" },
  ];

  const Theme6 = ({
    offsetY = 0,
    onHeightChange,
    hasShadow,
  }: {
    offsetY?: number;
    onHeightChange?: (height: number) => void;
    hasShadow?: boolean;
  }) => {
    // Get theme data from context
    const themeContext = useTheme() || {};
    const { textColor, topHeaderTextColor } = themeContext;

    // Map categories - use storeInfo and loading from outer scope
    const innerCategories = productCategories?.sub_categories || [];
    const cartItems = useAppSelector(
      (state: RootState) => state.cart.cartItems
    );
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const theme6HeaderRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);

    // Reuse variables from Header scope
    const categories = innerCategories;
    const storeName = storeInfo?.data?.storeinfo?.store_name || "Store";
    const accentColor = themeContext?.buttonBackgroundColor || "#10b981";
    const hoverBg = `${accentColor}1A`;

    // Theme6 hover functions
    const applyTheme6Hover = (
      e: React.MouseEvent<HTMLElement>,
      isActive = false
    ) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = `${accentColor}1A`;
        e.currentTarget.style.color = accentColor;
      }
    };

    const removeTheme6Hover = (
      e: React.MouseEvent<HTMLElement>,
      isActive = false
    ) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = "";
        e.currentTarget.style.color = headerTextColor || "#111111";
      }
    };
    const defaultText = headerTextColor || "#111111";
    const cartCount = cartItems?.length || 0;
    const isActive = (path: string) => pathname === path;
    const accent = themeContext?.buttonBackgroundColor || "#10b981";

    const applyHover = (
      e: React.MouseEvent<HTMLAnchorElement>,
      active: boolean
    ) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = hoverBg;
        e.currentTarget.style.color = accentColor;
      }
    };

    const removeHover = (
      e: React.MouseEvent<HTMLAnchorElement>,
      active: boolean
    ) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = defaultText;
      }
    };

    const NavLink = ({
      to,
      children,
      hoverKey = to.slice(1) || "home",
    }: {
      to: string;
      children: React.ReactNode;
      hoverKey?: string;
    }) => {
      const activeOrHover = isActive(to) || isHovered === hoverKey;

      return (
        <Link
          href={to}
          prefetch={false}
          onMouseEnter={() => setIsHovered?.(hoverKey)}
          onMouseLeave={() => setIsHovered?.(null)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center h-full"
          style={{
            color: activeOrHover ? accent : textColor,
            backgroundColor: activeOrHover ? hoverBg : "transparent",
          }}
        >
          {children}
        </Link>
      );
    };

    const NavItem = ({ to, label }: { to: string; label: string }) => {
      const active = isActive(to);
      return (
        <Link
          href={to}
          prefetch={false}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: active ? accentColor : "transparent",
            color: active ? themeContext?.buttonTextColor : defaultText,
          }}
          onMouseEnter={(e) => applyHover(e, active)}
          onMouseLeave={(e) => removeHover(e, active)}
        >
          {label}
        </Link>
      );
    };

    useEffect(() => {
      const handleScroll = () => {
        // Don't hide top bar if category dropdown is open and scroll is at 0
        // This prevents the top bar from hiding when user opens category menu at top of page
        const shouldHideTopBar = window.scrollY > 20 && !isCategoryDropdownOpen;
        setIsScrolled(shouldHideTopBar);
      };
      // Initial check
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [isCategoryDropdownOpen]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          profileRef.current &&
          event.target &&
          !profileRef.current.contains(event.target as Node)
        ) {
          setIsProfileOpen(false);
        }
      };
      if (isProfileOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileOpen]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Preserve existing query parameters and add search
        const params = new URLSearchParams(window.location.search);
        params.set("search", searchQuery.trim());
        params.set("page", "1"); // Reset to page 1 for new search
        // Keep sort_by if it exists, otherwise set default
        if (!params.get("sort_by")) {
          params.set("sort_by", "recently_added");
        }
        router.push(`/shop?${params.toString()}`);
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    // Measure header height (only main header, not including top header)
    // Exclude isSearchOpen from dependencies to prevent header jumping
    useEffect(() => {
      if (!theme6HeaderRef.current || !onHeightChange) return;

      let rafId: number | null = null;
      let lastHeight = 0;

      const measure = () => {
        const h = theme6HeaderRef.current?.offsetHeight || 0;
        // Only update if height actually changed to prevent unnecessary updates
        if (h !== lastHeight) {
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

      // Add a small delay to ensure layout is settled
      const timeoutId = setTimeout(() => {
        measure();
      }, 0);
      const ro = new ResizeObserver(throttledMeasure);
      ro.observe(theme6HeaderRef.current);

      return () => {
        clearTimeout(timeoutId);
        if (rafId) cancelAnimationFrame(rafId);
        ro.disconnect();
      };
    }, [onHeightChange, isScrolled]);

    // Set position based on offsetY (replaced GSAP with CSS transform)
    useEffect(() => {
      if (!theme6HeaderRef.current) return;
      if (theme6HeaderRef.current) {
        theme6HeaderRef.current.style.transform = `translateY(${offsetY}px)`;
        theme6HeaderRef.current.style.transition =
          "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)";
      }
    }, [offsetY]);

    // Disable body scroll when mobile menu is open
    useEffect(() => {
      if (isMobileMenuOpen) {
        // Save current scroll position
        scrollPositionRef.current = window.scrollY;
        // Disable scroll
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      } else {
        // Re-enable scroll
        const savedScrollPosition = scrollPositionRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        // Restore scroll position after styles are reset
        if (savedScrollPosition > 0) {
          requestAnimationFrame(() => {
            window.scrollTo(0, savedScrollPosition);
          });
        }
      }

      return () => {
        // Cleanup on unmount - ensure scroll is always restored
        const savedScroll = scrollPositionRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        if (savedScroll > 0) {
          window.scrollTo(0, savedScroll);
        }
      };
    }, [isMobileMenuOpen]);

    // Disable body scroll when search is open
    useEffect(() => {
      if (isSearchOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [isSearchOpen]);

    return (
      <>
        {/* Overlay - Shows when search is open */}
        {isSearchOpen && (
          <div
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/40 z-[9999]"
            style={{
              backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* Search Bar - Fixed at top with smooth transform - Always in DOM */}
        <div
          ref={searchBarRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            backgroundColor:
              themeContext?.bottomFooterBackgroundColor || accentColor,
            paddingTop: "1rem",
            paddingBottom: "1rem",
            boxShadow: isSearchOpen ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
            transform: isSearchOpen ? "translateY(0)" : "translateY(-100%)",
            opacity: isSearchOpen ? 1 : 0,
            transition:
              "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
            willChange: "transform, opacity",
            pointerEvents: isSearchOpen ? "auto" : "none",
          }}
        >
          {/* Top Bar - Hidden on mobile and when scrolled */}
          <div
            className={`hidden md:block border-b border-gray-100 transition-all duration-500 ease-in-out ${
              isScrolled
                ? "max-h-0 opacity-0 pointer-events-none"
                : "max-h-20 opacity-100"
            }`}
          >
            <div className="w-full px-container mx-auto">
              <div className="flex py-2.5 items-center justify-between mx-auto text-center">
                {/* Social Icons - using existing Icon component */}
                <div className="sm:flex text-base gap-2 sm:gap-4 customer-care hidden top-header-order1 ">
                  {storeInfo?.data?.storeinfo?.email && (
                    <Link
                    prefetch={false}
                      href={`mailto:${storeInfo?.data?.storeinfo?.email}`}
                      className="flex  gap-2 hover:brightness-80 transition-all duration-600 ease-in-out items-center"
                    >
                      <span
                        className="icon"
                        onMouseEnter={() => setIsHovered("email")}
                        onMouseLeave={() => setIsHovered(null)}
                      >
                        <Icon
                          name="mail"
                          stroke={
                            themeId != 6
                              ? topHeaderTextColor
                              : isHovered === "email"
                              ? themeContext?.buttonBackgroundColor
                              : topHeaderTextColor
                          }
                          strokeWidth="2"
                          fill="none"
                        />
                      </span>
                      {themeId !== 6 && (
                        <span className="hidden xl:block text-sm">
                          {storeInfo?.data?.storeinfo?.email}
                        </span>
                      )}
                    </Link>
                  )}
                  {/* <Settings /> */}
                  {storeInfo?.data?.storeinfo?.mobile_no &&
                    storeInfo?.data?.storeinfo?.mobile_no?.length > 0 && (
                      <Link
                        href={`tel:${storeInfo.data.storeinfo.mobile_no}`}
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
                            stroke={
                              themeId != 6
                                ? topHeaderTextColor
                                : isHovered === "phone"
                                ? themeContext?.buttonBackgroundColor
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

                <div className="font-medium text-[0.875rem] md:text-[1rem] center-nav flex-1 flex items-center justify-center top-header-order2">
                  {storeInfo?.data?.storeinfo?.offer_text ||
                    "All over India Delivery Available."}
                </div>
                <div className="sm:flex hidden text-base gap-2 sm:gap-4 social-login top-header-order3">
                  {storeInfo?.data?.storeinfo?.facebook_url && (
                    <Link
                      href={storeInfo?.data?.storeinfo?.facebook_url}
                      target="_blank"
                      prefetch={false}
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
                            themeId != 6
                              ? topHeaderTextColor
                              : isHovered === "facebook"
                              ? themeContext?.buttonBackgroundColor
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
                    prefetch={false}
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
                            themeId != 6
                              ? topHeaderTextColor
                              : isHovered === "instagram"
                              ? themeContext?.buttonBackgroundColor
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
                            themeId != 6
                              ? topHeaderTextColor
                              : isHovered === "twitter"
                              ? themeContext?.buttonBackgroundColor
                              : topHeaderTextColor
                          }
                          stroke={
                            themeId != 6
                              ? topHeaderTextColor
                              : isHovered === "twitter"
                              ? themeContext?.buttonBackgroundColor
                              : topHeaderTextColor
                          }
                          viewBox="0 0 24 24"
                          strokeWidth="0.2"
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

          {/* Main Header */}
          <div className="border-b border-gray-200 transition-all duration-500 ease-in-out">
            {/* Search Bar - Slides down */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                backgroundColor:
                  themeContext?.bottomFooterBackgroundColor || accentColor,
                maxHeight: isSearchOpen ? "5rem" : "0",
                padding: isSearchOpen ? "1rem 0" : "0",
              }}
            >
              <X className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Header - Fixed separately like themes 1-5 */}
        <header
          ref={theme6HeaderRef}
          className="fixed left-0 right-0 z-40  transition-shadow duration-300"
          style={{
            top: 0,
            willChange: "transform, box-shadow",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            boxShadow:
              hasShadow || isScrolled
                ? "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px"
                : "none",
            backgroundColor: themeContext?.headerBackgroundColor || "#ffffff",
          }}
        >
          <div>
            <Container>
              <div className="py-4 flex items-center justify-between">
                {/* Logo */}
                <CommonLogo
                  storeInfo={storeInfo}
                  headerTextColor={headerTextColor}
                />

                {/* Desktop Navigation */}
                <div className="right-nav hidden lg:flex items-center gap-3 sm:gap-7.5 justify-between transition-all duration-300 ease-out">
                  <div className="hidden lg:flex items-center gap-1">
                    <NavLink to="/">Home</NavLink>
                    <CategoryDropdown
                      themeId={themeId}
                      isHovered={isHovered}
                      setIsHovered={setIsHovered}
                    />
                    <NavLink to="/shop">Shop</NavLink>
                    <NavLink to="/track-order">Track Order</NavLink>
                    <NavLink to="/about">About Us</NavLink>
                    <NavLink to="/contact">Contact</NavLink>
                  </div>
                </div>

                {/* Actions */}
                <CommonActions
                  theme={themeContext}
                  // storeInfo={storeInfo}
                  cartItems={cartItems}
                  headerTextColor={headerTextColor}
                  themeId={6}
                  isProfileOpen={isProfileOpen}
                  setIsProfileOpen={setIsProfileOpen}
                  profileRef={profileRef}
                  setIsSearchOpen={setIsSearchOpen}
                  isSearchOpen={isSearchOpen}
                  isMenuOpen={isMobileMenuOpen}
                  setIsMenuOpen={setIsMobileMenuOpen}
                />

                {/* Mobile Icons */}
                <div className="flex items-center lg:hidden">
                  <div ref={profileRef} className="relative">
                    <button
                      name="Show more"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="p-2.5 rounded-lg transition-colors cursor-pointer gr"
                      style={{
                        backgroundColor: isProfileOpen
                          ? `${accentColor}1A`
                          : "transparent",
                        color: isProfileOpen
                          ? accentColor
                          : headerTextColor || "#111111",
                      }}
                      onMouseEnter={(e) => {
                        if (!isProfileOpen) applyTheme6Hover(e);
                      }}
                      onMouseLeave={(e) => {
                        if (!isProfileOpen) removeTheme6Hover(e);
                      }}
                    >
                      <Icon
                        name="myProfile"
                        size={20}
                        stroke={headerTextColor || "#111111"}
                        strokeWidth="1.625"
                        className="w-5 h-5"
                      />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                        <Link
                          href="/my-account"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-600 transition-colors cursor-pointer"
                          style={{ color: headerTextColor || "#111111" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                            e.currentTarget.style.color = accentColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.color =
                              headerTextColor || "#111111";
                          }}
                        >
                          <UserCircle size={18} />
                          My Account
                        </Link>
                        <Link
                          href="/my-account/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-600 transition-colors cursor-pointer"
                          style={{ color: headerTextColor || "#111111" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                            e.currentTarget.style.color = accentColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.color =
                              headerTextColor || "#111111";
                          }}
                        >
                          <ClipboardList size={18} />
                          My Orders
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          name="Logout"
                          onClick={() => {
                            setOpen(true);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer w-full"
                          style={{ color: accentColor }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                            e.currentTarget.style.color = accentColor;
                          }}
                        >
                          <LogIn size={18} />
                          Logout
                        </button>
                      </div>
                    )}
                    <ConfirmLogoutModal open={open} setOpen={setOpen} />
                  </div>
                  <button
                    name="Search"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsSearchOpen((prev) => !prev);
                    }}
                    className="p-2 text-gray-700"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </button>
                  <Link href="/cart" className="p-2 text-gray-700 relative">
                    <Icon
                      name="cart"
                      stroke={headerTextColor || "#111111"}
                      strokeWidth="1.625"
                      viewBox="0 0 26 26"
                      fill="none"
                      className="w-5 h-5"
                    />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: accentColor }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    name="Menu"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-700"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Container>
          </div>
        </header>

        {/* Mobile Full Screen Menu - Opens from top */}
        <div
          className={`fixed inset-0 bg-white z-50 lg:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              {storeInfo?.data?.storeinfo?.logo ? (
                <SafeImage
                  src={storeInfo?.data?.storeinfo?.logo}
                  alt={storeInfo?.data?.storeinfo?.store_name || "Store"}
                  width={160}
                  height={64}
                  className={`sm:h-[4rem] h-16 transition-all duration-300 ease-out object-contain`}
                />
              ) : (
                <h1
                  className="uppercase text-[1.125rem] sm:text-[20px] lg:text-[1.5rem] xl:text-[2rem] 
                       font-medium text-center"
                  style={{ color: headerTextColor || "#111111" }}
                >
                  {storeInfo?.data?.storeinfo?.store_name || "Store"}
                </h1>
              )}
              <button
                name="Close Menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 py-8">
              <ul className="space-y-2">
                {/* Home - First */}
                <li
                  className={`transform transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                >
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-4 text-sm font-medium border-b border-gray-100 transition-colors"
                    style={{
                      color: isActive("/") ? accentColor : "#1f2937",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive("/")) {
                        e.currentTarget.style.color = accentColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive("/")) {
                        e.currentTarget.style.color = "#1f2937";
                      }
                    }}
                  >
                    Home
                  </Link>
                </li>

                {/* Category Dropdown - Second */}
                <li
                  className={`transform transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                >
                  <button
                    name="Category"
                    onClick={() =>
                      setIsMobileCategoryOpen(!isMobileCategoryOpen)
                    }
                    className="w-full flex items-center justify-between py-4 text-sm font-medium border-b border-gray-100 transition-colors"
                    style={{
                      color:
                        isActive("/categories") || isMobileCategoryOpen
                          ? accentColor
                          : "#1f2937",
                    }}
                  >
                    <span>Category</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMobileCategoryOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  {/* Category Dropdown Items */}
                  {isMobileCategoryOpen && (
                    <ul className="pl-4 mt-2 space-y-1">
                      {categories.map((category: any) => (
                        <li key={category.sub_category_id}>
                          <Link
                            href={`/shop?categories=${encodeURIComponent(
                              category.sub_category_name.toLowerCase()
                            )}`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileCategoryOpen(false);
                            }}
                            className="block py-3 text-sm border-b border-gray-100 transition-colors"
                            style={{ color: "#1f2937" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = accentColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#1f2937";
                            }}
                          >
                            {category.sub_category_name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Other Menu Items - Filter out Home and Categories */}
                {navItems
                  .filter(
                    (item) => item.to !== "/" && item.to !== "/categories"
                  )
                  .map((item, index) => (
                    <li
                      key={item.label}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className={`transform transition-all duration-300 ${
                        isMobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-4 opacity-0"
                      }`}
                    >
                      <Link
                        href={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-4 text-sm font-medium border-b border-gray-100 transition-colors"
                        style={{
                          color: isActive(item.to) ? accentColor : "#1f2937",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive(item.to)) {
                            e.currentTarget.style.color = accentColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(item.to)) {
                            e.currentTarget.style.color = "#1f2937";
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>

            {/* Menu Footer */}
          </div>
        </div>
      </>
    );
  };

  const navContainerClass = `${
    themeId !== 3 ? "nav-container" : ""
  } px-container transition-all duration-300 ease-out ${
    themeId !== 3
      ? isSticky
        ? "sm:h-[6.25rem] h-[5rem]"
        : "sm:h-[6.25rem] h-[5rem]"
      : ""
  }`;

  const navStyle = {
    backgroundColor: themeContext?.headerBackgroundColor || "#ffffff",
    color: headerTextColor || "#ffffff",
  };

  function MobileMenuButton({
    isOpen,
    onClick,
  }: {
    isOpen: boolean;
    onClick: () => void;
    strokeColor?: string;
  }) {
    return (
      <button
        name="Menu"
        type="button"
        className="lg:hidden cursor-pointer"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
        onClick={onClick}
      >
        {/* Hamburger Icon */}

        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6H21"
              stroke={headerTextColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 12H21"
              stroke={headerTextColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 18H21"
              stroke={headerTextColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18"
              stroke={headerTextColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 6L18 18"
              stroke={headerTextColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </>
      </button>
    );
  }

  // Reusable Actions Component - used across all themes
  function CommonActions({
    theme,
    cartItems,
    headerTextColor,
    themeId,
    isProfileOpen,
    setIsProfileOpen,
    profileRef,
    setIsSearchOpen,
    isSearchOpen,
    isMenuOpen,
    setIsMenuOpen,
  }: {
    theme: any;
    // storeInfo: typeof storeInfo;
    cartItems: any;
    headerTextColor?: string;
    themeId: number;
    isProfileOpen: boolean;
    setIsProfileOpen: (open: boolean) => void;
    profileRef: React.RefObject<HTMLDivElement | null>;
    setIsSearchOpen: (open: boolean) => void;
    isSearchOpen: boolean;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
  }) {
    const accentColor = theme?.buttonBackgroundColor || "#10b981";
    const cartCount = cartItems?.length || 0;
    const [open, setOpen] = useState(false);

    const applyTheme6Hover = (
      e: React.MouseEvent<HTMLElement>,
      isActive = false
    ) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = `${accentColor}1A`;
        e.currentTarget.style.color = accentColor;
      }
    };

    const removeTheme6Hover = (
      e: React.MouseEvent<HTMLElement>,
      isActive = false
    ) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = "";
        e.currentTarget.style.color = headerTextColor || "#111111";
      }
    };

    return (
      <div className="right-nav flex items-center h-full hidden lg:flex">
        {themeId === 6 ? (
          <>
            <div ref={profileRef} className="relative">
              <button
                name="Show more"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: isProfileOpen
                    ? `${accentColor}1A`
                    : "transparent",
                  color: isProfileOpen
                    ? accentColor
                    : headerTextColor || "#111111",
                }}
                onMouseEnter={(e) => {
                  if (!isProfileOpen) applyTheme6Hover(e);
                }}
                onMouseLeave={(e) => {
                  if (!isProfileOpen) removeTheme6Hover(e);
                }}
              >
                <Icon
                  name="myProfile"
                  size={20}
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="1.625"
                  className="w-5 h-5"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href="/my-account"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 transition-colors cursor-pointer"
                    style={{ color: headerTextColor || "#111111" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                      e.currentTarget.style.color = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color =
                        headerTextColor || "#111111";
                    }}
                  >
                    <UserCircle size={18} />
                    My Account
                  </Link>
                  <Link
                    href="/my-account/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 transition-colors cursor-pointer"
                    style={{ color: headerTextColor || "#111111" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                      e.currentTarget.style.color = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color =
                        headerTextColor || "#111111";
                    }}
                  >
                    <ClipboardList size={18} />
                    My Orders
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    name="Logout"
                    onClick={() => {
                      setOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer w-full"
                    style={{ color: accentColor }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${accentColor}1A`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = accentColor;
                    }}
                  >
                    <LogIn size={18} />
                    Logout
                  </button>
                </div>
              )}
              <ConfirmLogoutModal open={open} setOpen={setOpen} />
            </div>

            <button
              name="Cart"
              onClick={() => router.push("/cart")}
              className="p-2.5 rounded-lg text-gray-700 transition-colors relative cursor-pointer"
              style={{ color: headerTextColor || "#111111" }}
              onMouseEnter={(e) => {
                if (!isSearchOpen) applyTheme6Hover(e);
              }}
              onMouseLeave={(e) => {
                if (!isSearchOpen) removeTheme6Hover(e);
              }}
            >
              <Icon
                name="cart"
                stroke="currentColor"
                strokeWidth="1.625"
                viewBox="0 0 26 26"
                fill="none"
                className="w-5 h-5 group-hover:stroke-[#10b981]"
              />

              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full text-white flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              name="Search"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSearchOpen(!isSearchOpen);
              }}
              className="p-2.5 rounded-lg text-gray-700 transition-colors cursor-pointer"
              style={{
                backgroundColor: isSearchOpen
                  ? `${accentColor}1A`
                  : "transparent",
                color: isSearchOpen
                  ? accentColor
                  : headerTextColor || "#111111",
              }}
              onMouseEnter={(e) => {
                if (!isSearchOpen) applyTheme6Hover(e);
              }}
              onMouseLeave={(e) => {
                if (!isSearchOpen) removeTheme6Hover(e);
              }}
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Search />
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => router.push("/my-account/wishlist")}
            >
              <Icon name="heart4" fill="none" size={28} />
            </div>
            <Profile />
            <div
              className="relative cursor-pointer hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                router.push("/cart");
              }}
            >
              {cartItems && cartItems.length > 0 && (
                <span
                  style={{
                    backgroundColor: headerTextColor || "#ffffff",
                    color: theme?.headerBackgroundColor,
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                >
                  {cartItems.length}
                </span>
              )}
              <Icon name="cart" size={23} />
            </div>
            <button
              className="lg:hiFdden hover:opacity-70 transition-opacity cursor-pointer"
              name="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <Icon
                  name="close"
                  size={23}
                  stroke={theme?.buttonBackgroundColor}
                />
              ) : (
                <Icon
                  name="menu"
                  size={23}
                  stroke={theme?.buttonBackgroundColor}
                />
              )}
            </button>
          </>
        )}
      </div>
    );
  }

  function CommonLogo({
    storeInfo,
    headerTextColor,
  }: {
    storeInfo: StoreInfoResponse | null;
    headerTextColor?: string;
  }) {
    const logo = storeInfo?.data && storeInfo?.data?.storeinfo?.logo;
    const storeName = storeInfo?.data?.storeinfo?.store_name || "";

    return (
      <Link
        className={`${
          themeId === 1
            ? "center-nav flex items-center lg:justify-center relative lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
            : "center-nav flex items-center shrink-0"
        } `}
        href="/"
      >
        {logo ? (
          <SafeImage
            src={logo}
            alt={storeName}
            width={160}
            height={64}
            className={`sm:h-[4rem] h-16 transition-all duration-300 ease-out object-contain !w-auto`}
          />
        ) : (
          <h1
            className="uppercase text-[1.125rem] sm:text-[20px] lg:text-[1.5rem] xl:text-[2rem] 
                       font-medium text-center"
            style={{ color: headerTextColor || "#111111" }}
          >
            {storeInfo?.data?.storeinfo?.store_name || ""}
          </h1>
        )}
      </Link>
    );
  }

  const themeLayout = {
    1: (
      <>
        <div className="hidden lg:flex items-center gap-3 lg:gap-4 h-full">
          <div className="left-nav hidden lg:flex items-center h-full">
            <Link
              className="relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
         transition-colors duration-300
         lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
         lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-55"
              href="/"
              style={{
                color: headerTextColor || "#111111",
              }}
            >
              Home
            </Link>

            <div
              className="relative h-full"
              onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link
                className="relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
               transition-colors duration-300
               after:content-[''] after:absolute after:left-0 after:bottom-[35%] after:w-full after:h-[2px] after:bg-current
               after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-65"
                href="/categories"
                style={
                  {
                    color: headerTextColor || "#101010",
                  } as React.CSSProperties
                }
              >
                Category
              </Link>
              {isShopMegaMenuOpen && (
                <div
                  className="fixed left-0 top-[100%] py-6 bg-white border-b border-gray-200/40 shadow-2xl z-50 w-[100vw]"
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || "#fff",
                  }}
                >
                  <div className="flex items-center w-full">
                    {loading ? (
                      <Loader />
                    ) : categories.length > 0 ? (
                      <div className="w-full px-container mx-auto">
                        <CategoryGrid
                          categories={categories}
                          headerTextColor={headerTextColor}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 w-full">
                        <p
                          className="text-sm "
                          style={{
                            color: textColor || "#1e293b",
                          }}
                        >
                          No categories found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* <CategoryDropdown /> */}

            <div
              className="relative h-full"
              // onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              // onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link
                className="relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
         transition-colors duration-300
         after:content-[''] after:absolute after:left-0 after:bottom-[35%] after:w-full after:h-[2px] after:bg-current
         after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-50"
                href="/shop"
                style={{
                  color: headerTextColor || "#111111",
                }}
              >
                Shop
              </Link>
            </div>
          </div>
        </div>

        <CommonLogo storeInfo={storeInfo} headerTextColor={headerTextColor} />

        <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
          <div className="hidden lg:flex items-center h-full">
            <Link
              className="relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
         transition-colors duration-300
         lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
         lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-75"
              href="/track-order"
              style={{
                color: headerTextColor || "#111111",
              }}
            >
              Track Order
            </Link>
            <Link
              className="relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
         transition-colors duration-300
         lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
         lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-70"
              href="/about"
              style={{
                color: headerTextColor || "#111111",
              }}
            >
              About Us
            </Link>
            <Link
              className="relative text-[0.875rem] xl:text-[1rem] pr-2 font-medium uppercase py-3 h-full flex items-center outline-none
         transition-colors duration-300
         lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
         lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-95"
              href="/contact"
              style={{
                color: headerTextColor || "#111111",
              }}
            >
              Contact Us
            </Link>
          </div>
          <Search />
          <Profile />
          <div
            className="relative cursor-pointer mt-[2px]"
            onClick={(e) => {
              e.preventDefault();
              router.push("/cart");
            }}
          >
            {cartItems && cartItems.length > 0 && (
              <span
                className="absolute top-[-0.25rem] right-[-0.5rem] w-5 h-5 bg-black text-white rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: headerTextColor || "#ffffff",
                  color: themeContext?.headerBackgroundColor,
                }}
              >
                {cartItems.length}
              </span>
            )}
            <Icon
              name="cart"
              stroke={headerTextColor || "#111111"}
              strokeWidth="1.625"
              viewBox="0 0 26 26"
              fill="none"
            />
          </div>
          <MobileMenuButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
      </>
    ),
    2: (
      <>
        <div className="flex gap-7.5 items-center">
          <CommonLogo storeInfo={storeInfo} headerTextColor={headerTextColor} />
          <div className="hidden md:block">
            <Search />
          </div>
        </div>

        <div className="right-nav flex items-center gap-3 sm:gap-7.5 h-full">
          <div className="hidden lg:flex items-center h-full gap-6">
            <Link
              className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
           transition-colors duration-300 lg:after:content-['']  lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-100"
              href="/"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Home
            </Link>

            <div
              className="relative h-full"
              onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300
           lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
           after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                href="/categories"
                style={
                  {
                    color: headerTextColor || "#101010",
                  } as React.CSSProperties
                }
              >
                Category
              </Link>
              {isShopMegaMenuOpen && (
                <div
                  className="fixed left-0 top-[100%] py-6 bg-white border-b border-gray-200/40 shadow-2xl z-50 w-[100vw]"
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || "#fff",
                  }}
                >
                  <div className="flex items-center w-full">
                    {loading ? (
                      <Loader />
                    ) : categories.length > 0 ? (
                      <div className="w-full px-container mx-auto">
                        <CategoryGrid
                          categories={categories}
                          headerTextColor={headerTextColor}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 w-full">
                        <p
                          className="text-sm "
                          style={{
                            color: textColor || "#1e293b",
                          }}
                        >
                          No categories found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* <CategoryDropdown /> */}

            <div
              className="relative h-full"
              // onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              // onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
           transition-colors duration-300
           after:content-[''] after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
           after:transform lg:after:origin-left lg:after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                href="/shop"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Shop
              </Link>
            </div>
            <Link
              className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
           transition-colors duration-300
           lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
           lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-100"
              href="/about"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              About Us
            </Link>
            <Link
              className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
           transition-colors duration-300
           lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
           lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-100"
              href="/contact"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Contact Us
            </Link>
            <Link
              className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
           transition-colors duration-300
           lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
           lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-100"
              href="/track-order"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Track Order
            </Link>
          </div>
          <div className="flex gap-[0.973rem] items-center">
            <div className="md:hidden">
              <Search />
            </div>
            <Profile />
            <div
              className="relative cursor-pointer mt-[2px]"
              onClick={(e) => {
                e.preventDefault();
                router.push("/cart");
              }}
            >
              {cartItems && cartItems.length > 0 && (
                <span
                  className="absolute -top-1 right-[-0.5rem] w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: headerTextColor || "#ffffff",
                    color: themeContext?.headerBackgroundColor,
                  }}
                >
                  {cartItems.length}
                </span>
              )}
              <Icon
                name="cart"
                className="w-6 h-6 md:w-[1.625rem] md:h-[1.625rem]"
                stroke={headerTextColor || "#101010"}
                strokeWidth="1.625"
                viewBox="0 0 26 26"
                fill="none"
              />
            </div>
            <button
              name="Menu"
              type="button"
              className="lg:hidden cursor-pointer"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setIsMenuOpen(true)}
            >
              {/* <Icon
              name="menu"
              stroke={headerTextColor || "#111111"}
              strokeWidth="2"
            /> */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 12H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 18H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </>
    ),
    3: (
      <>
        <div
          className={`flex justify-between gap-7.5 items-center py-6 border-b border-[#121212]/12 transition-all duration-300 ease-out`}
        >
          <CommonLogo storeInfo={storeInfo} headerTextColor={headerTextColor} />
          <div className="hidden md:block max-w-[37.5rem] w-full">
            <Search />
          </div>
          <div className="flex gap-[0.973rem] items-center">
            <div className="md:hidden">
              <Search />
            </div>
            <Profile />
            <div
              className="relative cursor-pointer mt-[2px]"
              onClick={(e) => {
                e.preventDefault();
                router.push("/cart");
              }}
            >
              {cartItems && cartItems.length > 0 && (
                <span
                  className="absolute -top-1 right-[-0.5rem] w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: headerTextColor || "#ffffff",
                    color: themeContext?.headerBackgroundColor,
                  }}
                >
                  {cartItems.length}
                </span>
              )}
              <Icon
                name="cart"
                stroke={headerTextColor || "#111111"}
                strokeWidth="1.625"
                viewBox="0 0 26 26"
                fill="none"
              />
            </div>

            <button
              name="Menu"
              type="button"
              className="lg:hidden cursor-pointer mt-[8px]"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setIsMenuOpen(true)}
            >
              {/* <Icon
              name="menu"
              stroke={headerTextColor || "#111111"}
              strokeWidth="2"
            /> */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 12H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 18H21"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="right-nav hidden lg:flex items-center gap-3 sm:gap-7.5 justify-between transition-all duration-300 ease-out">
          <div className="hidden lg:flex items-center gap-6 h-full">
            <Link
              className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
              href="/"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Home
            </Link>

            {/* <CategoryDropdown /> */}

            <div
              className="relative h-full"
              onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link
                className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300 py-5 h-full`}
                href="/categories"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Category
              </Link>
              {isShopMegaMenuOpen && (
                <div
                  className="fixed left-0 top-[100%] px-container py-6 bg-white border-b  border-gray-200/40 shadow-2xl z-50 w-[100vw]"
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || "#fff",
                  }}
                >
                  <div className="flex items-center w-full">
                    {loading ? (
                      <Loader />
                    ) : categories.length > 0 ? (
                      <div className="w-full mx-auto">
                        <CategoryGrid
                          categories={categories}
                          headerTextColor={headerTextColor}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 w-full">
                        <p
                          className="text-sm "
                          style={{
                            color: textColor || "#1e293b",
                          }}
                        >
                          No categories found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
              href="/shop"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Shop
            </Link>

            <Link
              className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
              href="/about"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              About Us
            </Link>
            <Link
              className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
              href="/contact"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Contact Us
            </Link>
            <Link
              className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
              href="/track-order"
              style={{
                color: headerTextColor || "#101010",
              }}
            >
              Track Order
            </Link>
          </div>
          <div className="sm:flex text-base gap-2 sm:gap-4 customer-care hidden">
            {storeInfo?.data?.storeinfo?.email && (
              <Link
                href={`mailto:${storeInfo?.data?.storeinfo?.email}`}
                className="flex  gap-2 hover:brightness-80 transition-all duration-600 ease-in-out items-center"
              >
                <span className="icon">
                  <Icon
                    name="mail"
                    stroke={headerTextColor}
                    strokeWidth="2"
                    fill="none"
                  />
                </span>
                <span className="hidden xl:block text-[0.875rem] lg:text-[1rem] font-medium">
                  {storeInfo?.data?.storeinfo?.email}
                </span>
              </Link>
            )}
            {storeInfo?.data?.storeinfo?.mobile_no?.length > 0 && (
              <Link
                href={`tel:${storeInfo.data?.storeinfo?.mobile_no}`}
                className="flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center"
              >
                <span className="icon">
                  <Icon
                    name="call"
                    size={24}
                    stroke={headerTextColor}
                    strokeWidth="2"
                  />
                </span>
                <span className="hidden xl:block text-[0.875rem] lg:text-[1rem] font-medium">
                  {storeInfo.data?.storeinfo?.mobile_no}
                </span>
              </Link>
            )}
          </div>
        </div>
      </>
    ),
    4: (
      <>
        <div className="mx-auto w-full">
          <div className="flex items-center justify-between ">
            {/* Logo */}
            <CommonLogo
              storeInfo={storeInfo}
              headerTextColor={headerTextColor}
            />

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
            </nav> */}
            <div className="hidden lg:flex items-center h-full gap-6">
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300 "
                href="/"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Home
              </Link>

              {/* <CategoryDropdown /> */}

              <div
                className="relative h-full"
                onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                onMouseLeave={() => setIsShopMegaMenuOpen(false)}
              >
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                  href="/categories"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  Category
                </Link>
                {isShopMegaMenuOpen && (
                  <div
                    className="fixed left-0 top-[100%] px-container py-6 bg-white  shadow-2xl z-50 w-[100vw]"
                    style={
                      {
                        backgroundColor:
                          themeContext?.headerBackgroundColor || "#fff",
                        "--button-bg":
                          themeContext?.buttonBackgroundColor || "#111111",
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center w-full">
                      {loading ? (
                        <Loader />
                      ) : categories.length > 0 ? (
                        <div className="w-full mx-auto">
                          <CategoryGrid
                            categories={categories}
                            headerTextColor={headerTextColor}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4 w-full">
                          <p
                            className="text-sm "
                            style={{
                              color: textColor || "#1e293b",
                            }}
                          >
                            No categories found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300 "
                href="/shop"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Shop
              </Link>
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                href="/about"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                About Us
              </Link>
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                href="/contact"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Contact Us
              </Link>
              <Link
                className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                href="/track-order"
                style={{
                  color: headerTextColor || "#101010",
                }}
              >
                Track Order
              </Link>
            </div>

            {/* Actions */}
            <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
              <Search />
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => router.push("/my-account/wishlist")}
              >
                <Icon
                  name="heart4"
                  // stroke={theme?.buttonBackgroundColor}
                  fill="none"
                  size={28}
                />
              </div>
              <Profile />
              <div
                className="relative cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cart");
                }}
              >
                {cartItems && cartItems.length > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: headerTextColor || "#ffffff",
                      color: themeContext?.headerBackgroundColor,
                    }}
                  >
                    {cartItems.length}
                  </span>
                )}
                <Icon
                  name="cart"
                  size={23}
                  // stroke={theme?.buttonBackgroundColor}
                />
              </div>
              <button
                name="Menu"
                className="lg:hidden hover:opacity-70 transition-opacity"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <Icon name="close" size={23} stroke={headerTextColor} />
                ) : (
                  <Icon name="menu" size={23} stroke={headerTextColor} />
                )}
              </button>
            </div>
          </div>

          {/* {searchOpen && (
      <div className="pb-4">
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: currentTheme === 'luxury' ? '0' : currentTheme === 'bold' ? '2rem' : '0.5rem',
          }}
        >
          <Search className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: theme.colors.text }}
          />
        </div>
      </div>
    )} */}
        </div>
      </>
    ),
    5: (
      <>
        <div className="mx-auto w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <CommonLogo
              storeInfo={storeInfo}
              headerTextColor={headerTextColor}
            />

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              ))}
            </nav> */}

            {/* Actions */}
            <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
              <div className="hidden lg:flex items-center h-full gap-6 pe-5">
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300 "
                  href="/"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  Home
                </Link>

                {/* <CategoryDropdown /> */}

                <div
                  className="relative h-full"
                  onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                  onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                >
                  <Link
                    className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                    href="/categories"
                    style={{
                      color: headerTextColor || "#101010",
                    }}
                  >
                    Category
                    <span style={{ marginLeft: 4, display: "inline-flex" }}>
                      <Icon
                        name="arrow-down"
                        size={16}
                        stroke={headerTextColor || "#101010"}
                      />
                    </span>
                  </Link>

                  {isShopMegaMenuOpen && (
                    <div
                      className="fixed left-0 top-[100%] px-container py-6 bg-white  shadow-2xl z-50 w-[100vw]"
                      style={
                        {
                          backgroundColor:
                            themeContext?.headerBackgroundColor || "#fff",
                          "--button-bg":
                            themeContext?.buttonBackgroundColor || "#111111",
                        } as React.CSSProperties
                      }
                    >
                      <div className="flex items-center w-full">
                        {loading ? (
                          <Loader />
                        ) : categories.length > 0 ? (
                          <div className="w-full mx-auto">
                            <CategoryGrid
                              categories={categories}
                              headerTextColor={headerTextColor}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-4 w-full">
                            <p
                              className="text-sm "
                              style={{
                                color: textColor || "#1e293b",
                              }}
                            >
                              No categories found
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300 "
                  href="/shop"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  Shop
                </Link>
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                  href="/about"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  About Us
                </Link>
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                  href="/contact"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
           transition-colors duration-300"
                  href="/track-order"
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  Track Order
                </Link>
              </div>
              <Search />
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => router.push("/my-account/wishlist")}
              >
                <Icon
                  name="heart4"
                  // stroke={theme?.buttonBackgroundColor}
                  fill="none"
                  size={28}
                />
              </div>
              <Profile />
              <div
                className="relative cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cart");
                }}
              >
                {cartItems && cartItems.length > 0 && (
                  <span
                    style={{
                      backgroundColor: headerTextColor || "#ffffff",
                      color: themeContext?.headerBackgroundColor,
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                  >
                    {cartItems.length}
                  </span>
                )}
                <Icon
                  name="cart"
                  size={23}
                  // stroke={theme?.buttonBackgroundColor}
                />
              </div>
              <button
                name="Menu"
                className="lg:hidden hover:opacity-70 transition-opacity"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <Icon name="close" size={23} stroke={headerTextColor} />
                ) : (
                  <Icon name="menu" size={23} stroke={headerTextColor} />
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    ),
    6: (
      <Theme6
        offsetY={offsetY}
        onHeightChange={onHeightChange}
        hasShadow={hasShadow}
      />
    ),
  };

  return (
    <div>
      {themeId !== 6 ? (
        <header
          ref={ref}
          className="fixed left-0 right-0 z-40"
          style={{
            top: 0,
            willChange: "transform, box-shadow",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <nav className={navContainerClass} style={navStyle}>
            {themeLayout[themeId as keyof typeof themeLayout] || themeLayout[1]}
          </nav>
        </header>
      ) : (
        themeLayout[themeId] || themeLayout[1]
      )}
      {isMenuOpen && (
        <>
          <button
            name="Close Menu"
            type="button"
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <label htmlFor="close-menu" className="sr-only">
            Close menu
          </label>
        </>
      )}

      <MobileDrawer
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isMobileCategoryOpen={isMobileCategoryOpen}
        setIsMobileCategoryOpen={setIsMobileCategoryOpen}
        categories={categories}
        // loading={homeSectionLoading}
        theme={themeContext}
        headerTextColor={headerTextColor}
      />

      {isCartOpen && (
        <MiniCart
          items={cartItems}
          onClose={() => dispatch(closeCartPopup())}
        />
      )}
      {openOrderDetail && <OrderDetailsPopup orderDetail={order} />}
    </div>
  );
}
