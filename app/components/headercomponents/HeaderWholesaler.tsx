"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Search from "./Search";
import Profile from "./Profile";
import MobileDrawer from "./MobileDrawer";
import Icon from "../customcomponents/Icon";
import MiniCart from "./minicart";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import SafeImage from "../SafeImage";
import {
  selectCart,
  selectProductCategories,
  selectStoreInfo,
  selectThemeData,
} from "@/app/redux/selectors";
import { closeCartPopup } from "@/app/redux/slices/cartSlice";
import OrderDetailsPopup from "../model/OrderDetailsPopup";
import SwiperNavButton from "../customcomponents/SwiperNavButton";
import Loader from "../customcomponents/Loader";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface HeaderWholesalerProps {
  offsetY?: number;
  onHeightChange?: (height: number) => void;
  hasShadow?: boolean;
}

export default function HeaderWholesaler({
  offsetY = 0,
  onHeightChange,
  hasShadow = false,
}: HeaderWholesalerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);

  const { storeInfo } = useAppSelector(selectStoreInfo);
  const { themeId, loading } = useAppSelector(selectThemeData);
  const categories = useAppSelector(selectProductCategories);
  const { isCartOpen, cartItems } = useAppSelector(selectCart);
  const { openOrderDetail, order } = useAppSelector(
    (state) => state.trackOrder
  );
  const themeContext = useTheme() || {};
  const { headerTextColor, textColor } = themeContext;

  const storeInfoData = useMemo(
    () => storeInfo?.data?.storeinfo || null,
    [storeInfo]
  );

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 3 },
        "(min-width: 1024px)": { slidesToScroll: 6 },
        "(min-width: 1280px)": { slidesToScroll: 10 },
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Handle body scroll lock when menu is open
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

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 60);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      // setIsCategoryDropdownOpen(false);
      setIsShopMegaMenuOpen(false);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure and report header height
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
  }, [offsetY]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/cart");
  };

  return (
    <div>
      <header
        ref={ref}
        className="fixed left-0 right-0 z-40"
        style={{
          top: 0,
          willChange: "transform, box-shadow",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          boxShadow:
            hasShadow || isSticky
              ? "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px"
              : "none",
          transform: `translateY(${offsetY}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <nav
          className={`flex items-center relative justify-between px-container lg:gap-1 gap-4 transition-[height,background-color] duration-300 ease-out ${
            isSticky ? "sm:h-[5rem] h-[4.5rem]" : "sm:h-[6.25rem] h-[5rem]"
          }`}
          style={{
            backgroundColor: themeContext?.headerBackgroundColor || "#ffffff",
            color: headerTextColor || "#ffffff",
          }}
        >
          <Link className="center-nav flex items-center" href="/">
            {storeInfoData?.logo ? (
              <SafeImage
                src={storeInfoData.logo}
                alt={storeInfoData?.store_name || "Store logo"}
                width={140}
                height={80}
                className={`${
                  isSticky ? "sm:h-[3rem] h-14" : "sm:h-[3.5rem] h-16"
                } transition-all duration-300 ease-out object-contain`}
              />
            ) : (
              <h1
                className="uppercase text-[1.125rem] sm:text-[20px] lg:text-[1.5rem] xl:text-[2rem] font-medium text-center"
                style={{ color: headerTextColor || "#111111" }}
              >
                {storeInfoData?.store_name || ""}
              </h1>
            )}
          </Link>
          <div className="right-nav flex items-center gap-3 sm:gap-4 h-full">
            <div className="hidden lg:flex items-center h-full">
              <Link
                className="relative text-[0.875rem] xl:text-[1rem] pr-8 font-medium uppercase py-3 h-full flex items-center outline-none transition-colors duration-300 lg:after:content-[''] lg:after:absolute lg:after:left-0 lg:after:bottom-[35%] lg:after:w-full lg:after:h-[2px] lg:after:bg-current lg:after:transform lg:after:origin-left lg:after:scale-x-0 lg:after:transition-transform lg:after:duration-300 hover:lg:after:scale-x-65"
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
                        <div className="w-full px-container mx-auto overflow-hidden">
                          <div className="embla" ref={emblaRef}>
                            <div className="embla__container flex">
                              {categories.map((category, idx) => (
                                <div
                                  key={category.sub_category_id || idx}
                                  className="embla__slide flex-[0_0_auto] min-w-0 pl-5 first:pl-0"
                                >
                                  <div className="flex flex-col items-center group">
                                    <Link
                                      href={`/shop?categories=${encodeURIComponent(
                                        category.sub_category_name
                                      ).toLowerCase()}`}
                                      className="hover-image-card flex flex-col items-center w-full"
                                      style={{ textDecoration: "none" }}
                                    >
                                      <div className="w-[6rem] h-[6rem] rounded-2xl flex items-center justify-center mb-2 overflow-hidden border border-[#666666]/15 border-1">
                                        <SafeImage
                                          width={96}
                                          height={96}
                                          src={category.sub_category_image}
                                          alt={category.sub_category_name}
                                          className="object-cover w-full h-full transition-transform duration-200 "
                                        />
                                      </div>
                                      <span
                                        className="text-sm text-center  transition-colors duration-200 block w-full break-words"
                                        style={{
                                          color: headerTextColor || "#111111",
                                        }}
                                      >
                                        {category.sub_category_name}
                                      </span>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            className="header-category-slider-prev swiper-button-prev !left-[20px] xl:!left-[50px] z-11"
                            onClick={scrollPrev}
                            style={{
                              backgroundColor:
                                themeContext?.buttonBackgroundColor ||
                                "#111111",
                              color: themeContext?.buttonTextColor || "#ffffff",
                            }}
                          >
                            ‹
                          </button>

                          <button
                            className="header-category-slider-next swiper-button-next !right-[20px] xl:!right-[50px]"
                            onClick={scrollNext}
                            style={{
                              backgroundColor:
                                themeContext?.buttonBackgroundColor ||
                                "#111111",
                              color: themeContext?.buttonTextColor || "#ffffff",
                            }}
                          >
                            ›
                          </button>
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
              <div
                className="relative h-full"
                // onMouseEnter={() => setIsShopMegaMenuOpen(true)}
                // onMouseLeave={() => setIsShopMegaMenuOpen(false)}
              >
                <Link
                  className="relative text-[0.875rem] xl:text-[1rem] pr-5 font-medium uppercase py-3 h-full flex items-center outline-none transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[35%] after:w-full after:h-[2px] after:bg-[#111111] after:transform after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-60"
                  href="/shop"
                  style={{
                    color: headerTextColor || "#111111",
                  }}
                >
                  Shop
                </Link>
              </div>
            </div>
            <Search />
            <Profile />
            <div className="relative cursor-pointer" onClick={handleCartClick}>
              {cartItems && cartItems.length > 0 && (
                <span className="absolute top-0 right-[-0.5rem] w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
              <Icon
                name="cart"
                stroke={headerTextColor || "#111111"}
                className="w-6 h-6 md:w-[1.625rem] md:h-[1.625rem]"
                viewBox="0 0 26 26"
                strokeWidth="1.625"
              />
            </div>
            <button
              name="Menu"
              type="button"
              className="lg:hidden cursor-pointer"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-drawer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <Icon
                  name="close"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  size={24}
                />
              ) : (
                <Icon
                  name="menu"
                  stroke={headerTextColor || "#111111"}
                  strokeWidth="2"
                  size={24}
                />
              )}
            </button>
          </div>
        </nav>
      </header>

      {isMenuOpen && (
        <button
          name="Close Menu"
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <MobileDrawer
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isMobileCategoryOpen={isMobileCategoryOpen}
        setIsMobileCategoryOpen={setIsMobileCategoryOpen}
        categories={categories}
        loading={loading}
        theme={themeContext}
        headerTextColor={headerTextColor}
      />

      {isCartOpen && (
        <MiniCart
          items={cartItems}
          isOpen={isCartOpen}
          onClose={() => dispatch(closeCartPopup())}
        />
      )}

      {openOrderDetail && <OrderDetailsPopup orderDetail={order} />}
    </div>
  );
}
