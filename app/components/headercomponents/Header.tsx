'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Profile from "./Profile";
import Icon from "../customcomponents/Icon";
import Loader from "../customcomponents/Loader";
import Search from "./Search";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { StoreInfoResponse } from "../../types/storeinfo";
import { useTheme } from "@/app/contexts/ThemeContext";
import { closeCartPopup } from "@/app/redux/slices/cartSlice";
import SafeImage from "../SafeImage";
import { selectCart, selectProductCategories, selectStoreInfo, selectTrackOrder } from "@/app/redux/selectors";
import dynamic from "next/dynamic";

// Lazy load heavy components
const MobileDrawer = dynamic(() => import("./MobileDrawer"), { ssr: false });
const CategoryGrid = dynamic(() => import("../customcomponents/CategoryGrid"), {
  ssr: false,
});
const OrderDetailsPopup = dynamic(() => import("../model/OrderDetailsPopup"), {
  ssr: false,
});
const MiniCart = dynamic(() => import("./minicart"), { ssr: false });

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get data from Redux store
  const themeContext = useTheme() || {};
  const { textColor, headerTextColor } = themeContext;
  const { categories } = useAppSelector(selectProductCategories);
  const { cartItems, isCartOpen } = useAppSelector(selectCart);
  const { openOrderDetail, order } = useAppSelector(selectTrackOrder);
  const { storeInfo, loading, themeId } = useAppSelector(selectStoreInfo);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
      'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
  }, [offsetY]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsShopMegaMenuOpen(false);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navContainerClass = `${themeId !== 3 ? "nav-container" : ""
    } px-container transition-all duration-300 ease-out ${themeId !== 3
      ? isSticky
        ? "sm:h-[6.25rem] h-[5rem]"
        : "sm:h-[6.25rem] h-[5rem]"
      : ""
    }`;

  const navStyle = {
    backgroundColor: themeContext?.headerBackgroundColor || '#ffffff',
    color: headerTextColor || '#ffffff',
  };

  function CommonLogo({
    storeInfo,
    headerTextColor,
  }: {
    storeInfo: StoreInfoResponse | null;
    headerTextColor?: string;
  }) {
    const logo = storeInfo?.data && storeInfo?.data?.storeinfo?.logo;
    const storeName = storeInfo?.data?.storeinfo?.store_name || '';

    return (
      <Link
        className={`${themeId === 1
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
            className='uppercase text-[1.125rem] sm:text-[20px] lg:text-[1.5rem] xl:text-[2rem] 
                       font-medium text-center'
            style={{ color: headerTextColor || '#111111' }}
          >
            {storeInfo?.data?.storeinfo?.store_name || ''}
          </h1>
        )}
      </Link>
    );
  }

  // Define navItems array at the top of your component
  const navItems = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Track Order", to: "/track-order" },
  ];

  // Helper function to get specific styling for each nav item in Theme 1
  const getTheme1NavStyle = (label: string) => {
    const styles: Record<string, string> = {
      "Home": "hover:lg:after:scale-x-55",
      "Categories": "hover:after:scale-x-68",
      "Shop": "hover:after:scale-x-50",
      "Track Order": "hover:lg:after:scale-x-95",
      "About": "hover:lg:after:scale-x-68",
      "Contact": "hover:lg:after:scale-x-72",
    };
    return styles[label] || "hover:after:scale-x-100";
  };

  const themeLayout = {
    1: (
      <>
        <div className="hidden lg:flex items-center gap-3 lg:gap-4 h-full">
          <div className="left-nav hidden lg:flex items-center h-full">
            {navItems.slice(0, 3).map((item) => (
              item.label === "Categories" ? (
                <div
                  key={item.label}
                  className="relative h-full"
                  onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                  onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                >
                  <Link
                    className={`relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
                   transition-colors duration-300
                   after:content-[''] after:absolute after:left-0 after:bottom-[35%] after:w-full after:h-[2px] after:bg-current
                   after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 ${getTheme1NavStyle(item.label)}`}
                    href={item.to}
                    style={{
                      color: headerTextColor || "#101010",
                    } as React.CSSProperties}
                  >
                    Category
                  </Link>
                  {isShopMegaMenuOpen && (
                    <div
                      className="fixed left-0 top-[100%] py-6 bg-white border-b border-gray-200/40 shadow-2xl z-50 w-[100vw]"
                      style={{
                        backgroundColor: themeContext?.headerBackgroundColor || "#fff",
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
              ) : (
                <Link
                  key={item.label}
                  className={`relative text-[0.875rem] xl:text-[1rem] pr-10 font-medium uppercase py-3 h-full flex items-center outline-none
                 transition-colors duration-300
                 lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
                 lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 ${getTheme1NavStyle(item.label)}`}
                  href={item.to}
                  style={{
                    color: headerTextColor || "#111111",
                  }}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>

        <CommonLogo
          storeInfo={storeInfo}
          headerTextColor={headerTextColor}
        />

        <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
          <div className="hidden lg:flex items-center h-full">
            {navItems.slice(3).map((item, index) => (
              <Link
                key={item.label}
                className={`relative text-[0.875rem] xl:text-[1rem] ${index === navItems.slice(3).length - 1 ? 'pr-2' : 'pr-10'} font-medium uppercase py-3 h-full flex items-center outline-none
               transition-colors duration-300
               lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
               lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 ${getTheme1NavStyle(item.label)}`}
                href={item.to}
                style={{
                  color: headerTextColor || "#111111",
                }}
              >
                {item.label === "About" ? "About Us" : item.label === "Contact" ? "Contact Us" : item.label}
              </Link>
            ))}
          </div>
          <Search />
          <Profile />
          <div
            className='relative cursor-pointer mt-[2px]'
            onClick={(e) => {
              e.preventDefault();
              router.push('/cart');
            }}
          >
            {cartItems && cartItems.length > 0 && (
              <span
                className='absolute top-[-0.25rem] right-[-0.5rem] w-5 h-5 bg-black text-white rounded-full flex items-center justify-center'
                style={{
                  backgroundColor: headerTextColor || '#ffffff',
                  color: themeContext?.headerBackgroundColor,
                }}
              >
                {cartItems.length}
              </span>
            )}
            <Icon
              name='cart'
              stroke={headerTextColor || '#111111'}
              strokeWidth='1.625'
              viewBox='0 0 26 26'
              fill='none'
            />
          </div>
          <div className="relative lg:hidden cursor-pointer mt-[5px]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Icon
              name="mobileMenu"
              stroke={headerTextColor || "#111111"}
              strokeWidth="1.625"
              viewBox="0 0 26 26"
              fill="none"
            />
          </div>
        </div>
      </>
    ),
    2: (
      <>
        <div className='flex gap-7.5 items-center'>
          <CommonLogo
            storeInfo={storeInfo}
            headerTextColor={headerTextColor}
          />
          <div className='hidden md:block'>
            <Search />
          </div>
        </div>

        <div className="right-nav flex items-center gap-3 sm:gap-7.5 h-full">
          <div className="hidden lg:flex items-center h-full gap-6">
            {navItems.map((item) => (
              item.label === "Categories" ? (
                <div
                  key={item.label}
                  className="relative h-full"
                  onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                  onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                >
                  <Link
                    className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
                   transition-colors duration-300
                   lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current
                   after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                    href={item.to}
                    style={{
                      color: headerTextColor || "#101010",
                    } as React.CSSProperties}
                  >
                    Category
                  </Link>
                  {isShopMegaMenuOpen && (
                    <div
                      className="fixed left-0 top-[100%] py-6 bg-white border-b border-gray-200/40 shadow-2xl z-50 w-[100vw]"
                      style={{
                        backgroundColor: themeContext?.headerBackgroundColor || "#fff",
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
              ) : (
                <Link
                  key={item.label}
                  className="relative text-[0.875rem] lg:text-[1rem] font-medium py-3 h-full flex items-center outline-none
                 transition-colors duration-300 lg:after:content-['']  lg:after:absolute lg:after:left-0 lg:after:bottom-[30%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-100"
                  href={item.to}
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  {item.label === "About" ? "About Us" : item.label === "Contact" ? "Contact Us" : item.label}
                </Link>
              )
            ))}
          </div>
          <div className='flex gap-[0.973rem] items-center'>
            <div className='md:hidden'>
              <Search />
            </div>
            <Profile />
            <div
              className='relative cursor-pointer mt-[2px]'
              onClick={(e) => {
                e.preventDefault();
                router.push('/cart');
              }}
            >
              {cartItems && cartItems.length > 0 && (
                <span
                  className='absolute -top-1 right-[-0.5rem] w-5 h-5 rounded-full flex items-center justify-center'
                  style={{
                    backgroundColor: headerTextColor || '#ffffff',
                    color: themeContext?.headerBackgroundColor,
                  }}
                >
                  {cartItems.length}
                </span>
              )}
              <Icon
                name='cart'
                className='w-6 h-6 md:w-[1.625rem] md:h-[1.625rem]'
                stroke={headerTextColor || '#101010'}
                strokeWidth='1.625'
                viewBox='0 0 26 26'
                fill='none'
              />
            </div>
            <div className="relative lg:hidden cursor-pointer mt-[5px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Icon
                name="mobileMenu"
                stroke={headerTextColor || "#111111"}
                strokeWidth="1.625"
                viewBox="0 0 26 26"
                fill="none"
              />
            </div>
          </div>
        </div>
      </>
    ),
    3: (
      <>
        <div
          className={`flex justify-between gap-7.5 items-center py-6 border-b border-[#121212]/12 transition-all duration-300 ease-out`}
        >
          <CommonLogo
            storeInfo={storeInfo}
            headerTextColor={headerTextColor}
          />
          <div className='hidden md:block max-w-[37.5rem] w-full'>
            <Search />
          </div>
          <div className='flex gap-[0.973rem] items-center'>
            <div className='md:hidden'>
              <Search />
            </div>
            <Profile />
            <div
              className='relative cursor-pointer mt-[2px]'
              onClick={(e) => {
                e.preventDefault();
                router.push('/cart');
              }}
            >
              {cartItems && cartItems.length > 0 && (
                <span
                  className='absolute -top-1 right-[-0.5rem] w-5 h-5 rounded-full flex items-center justify-center'
                  style={{
                    backgroundColor: headerTextColor || '#ffffff',
                    color: themeContext?.headerBackgroundColor,
                  }}
                >
                  {cartItems.length}
                </span>
              )}
              <Icon
                name='cart'
                stroke={headerTextColor || '#111111'}
                strokeWidth='1.625'
                viewBox='0 0 26 26'
                fill='none'
              />
            </div>
            <div className="relative lg:hidden cursor-pointer mt-[5px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Icon
                name="mobileMenu"
                stroke={headerTextColor || "#111111"}
                strokeWidth="1.625"
                viewBox="0 0 26 26"
                fill="none"
              />
            </div>
          </div>
        </div>

        <div className="right-nav hidden lg:flex items-center gap-3 sm:gap-7.5 justify-between transition-all duration-300 ease-out">
          <div className="hidden lg:flex items-center gap-6 h-full">
            {navItems.map((item) => (
              item.label === "Categories" ? (
                <div
                  key={item.label}
                  className="relative h-full"
                  onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                  onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                >
                  <Link
                    className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300 py-5 h-full`}
                    href={item.to}
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
                        backgroundColor: themeContext?.headerBackgroundColor || "#fff",
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
              ) : (
                <Link
                  key={item.label}
                  className={`relative text-[0.875rem] lg:text-[1rem] font-medium  flex items-center outline-none transition-all duration-300`}
                  href={item.to}
                  style={{
                    color: headerTextColor || "#101010",
                  }}
                >
                  {item.label === "About" ? "About Us" : item.label === "Contact" ? "Contact Us" : item.label}
                </Link>
              )
            ))}
          </div>
          <div className='sm:flex text-base gap-2 sm:gap-4 customer-care hidden'>
            {storeInfo?.data?.storeinfo?.email && (
              <Link
                href={`mailto:${storeInfo?.data?.storeinfo?.email}`}
                className='flex  gap-2 hover:brightness-80 transition-all duration-600 ease-in-out items-center'
              >
                <span className='icon'>
                  <Icon
                    name='mail'
                    stroke={headerTextColor}
                    strokeWidth='2'
                    fill='none'
                  />
                </span>
                <span className='hidden xl:block text-[0.875rem] lg:text-[1rem] font-medium'>
                  {storeInfo?.data?.storeinfo?.email}
                </span>
              </Link>
            )}
            {storeInfo?.data?.storeinfo?.mobile_no?.length > 0 && (
              <Link
                href={`tel:${storeInfo.data?.storeinfo?.mobile_no}`}
                className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out text-sm items-center'
              >
                <span className='icon'>
                  <Icon
                    name='call'
                    size={24}
                    stroke={headerTextColor}
                    strokeWidth='2'
                  />
                </span>
                <span className='hidden xl:block text-[0.875rem] lg:text-[1rem] font-medium'>
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
            <CommonLogo
              storeInfo={storeInfo}
              headerTextColor={headerTextColor}
            />

            <div className="hidden lg:flex items-center h-full gap-6">
              {navItems.map((item) => (
                item.label === "Categories" ? (
                  <div
                    key={item.label}
                    className="relative h-full"
                    onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                    onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                  >
                    <Link
                      className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
                     transition-colors duration-300"
                      href={item.to}
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
                            backgroundColor: themeContext?.headerBackgroundColor || "#fff",
                            "--button-bg": themeContext?.buttonBackgroundColor || "#111111",
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
                ) : (
                  <Link
                    key={item.label}
                    className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
                   transition-colors duration-300 "
                    href={item.to}
                    style={{
                      color: headerTextColor || "#101010",
                    }}
                  >
                    {item.label === "About" ? "About Us" : item.label === "Contact" ? "Contact Us" : item.label}
                  </Link>
                )
              ))}
            </div>

            <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
              <Search />
              <div
                className='cursor-pointer hover:opacity-70 transition-opacity'
                onClick={() => router.push('/my-account/wishlist')}
              >
                <Icon
                  name="heart4"
                  fill="none"
                  size={28}
                />
              </div>
              <Profile />
              <div
                className='relative cursor-pointer hover:opacity-70 transition-opacity'
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/cart');
                }}
              >
                {cartItems && cartItems.length > 0 && (
                  <span
                    className='absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center'
                    style={{
                      backgroundColor: headerTextColor || '#ffffff',
                      color: themeContext?.headerBackgroundColor,
                    }}
                  >
                    {cartItems.length}
                  </span>
                )}
                <Icon
                  name='cart'
                  size={23}
                />
              </div>
              <div className="relative lg:hidden cursor-pointer mt-[5px]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Icon
                  name="mobileMenu"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="1.625"
                  viewBox="0 0 26 26"
                  fill="none"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    5: (
      <>
        <div className="mx-auto w-full">
          <div className="flex items-center justify-between">
            <CommonLogo
              storeInfo={storeInfo}
              headerTextColor={headerTextColor}
            />

            <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
              <div className="hidden lg:flex items-center h-full gap-6 pe-5">
                {navItems.map((item) => (
                  item.label === "Categories" ? (
                    <div
                      key={item.label}
                      className="relative h-full"
                      onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                      onMouseLeave={() => setIsShopMegaMenuOpen(false)}
                    >
                      <Link
                        className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
                       transition-colors duration-300"
                        href={item.to}
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
                              backgroundColor: themeContext?.headerBackgroundColor || "#fff",
                              "--button-bg": themeContext?.buttonBackgroundColor || "#111111",
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
                  ) : (
                    <Link
                      key={item.label}
                      className="relative text-[0.875rem] lg:text-[1rem] font-medium py-10 h-full flex items-center outline-none
                     transition-colors duration-300 "
                      href={item.to}
                      style={{
                        color: headerTextColor || "#101010",
                      }}
                    >
                      {item.label === "About" ? "About Us" : item.label === "Contact" ? "Contact Us" : item.label}
                    </Link>
                  )
                ))}
              </div>
              <Search />
              <div
                className='cursor-pointer hover:opacity-70 transition-opacity'
                onClick={() => router.push('/my-account/wishlist')}
              >
                <Icon
                  name="heart4"
                  fill="none"
                  size={28}
                />
              </div>
              <Profile />
              <div
                className='relative cursor-pointer hover:opacity-70 transition-opacity'
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/cart');
                }}
              >
                {cartItems && cartItems.length > 0 && (
                  <span
                    style={{
                      backgroundColor: headerTextColor || '#ffffff',
                      color: themeContext?.headerBackgroundColor,
                    }}
                    className='absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center'
                  >
                    {cartItems.length}
                  </span>
                )}
                <Icon
                  name='cart'
                  size={23}
                />
              </div>
              <div className="relative lg:hidden cursor-pointer mt-[5px]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Icon
                  name="mobileMenu"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="1.625"
                  viewBox="0 0 26 26"
                  fill="none"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  };

  return (
    <div>
      {themeId !== 6 ? (
        <header
          ref={ref}
          className='fixed left-0 right-0 z-40'
          style={{
            top: 0,
            willChange: 'transform, box-shadow',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          <nav
            className={navContainerClass}
            style={navStyle}
          >
            {themeLayout[themeId as keyof typeof themeLayout] || themeLayout[1]}
          </nav>
        </header>
      ) : (
        themeLayout[themeId] || themeLayout[1]
      )}
      {isMenuOpen && (
        <>
          <button
            name='Close Menu'
            type='button'
            className='fixed inset-0 bg-black/40 z-40 lg:hidden'
            aria-label='Close menu'
            onClick={() => setIsMenuOpen(false)}
          />
          <label
            htmlFor='close-menu'
            className='sr-only'
          >
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