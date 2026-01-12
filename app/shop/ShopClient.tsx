"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
// Import directly - this component is always needed on shop page
import CardComponent from "../components/customcomponents/CardComponent";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import useShopProducts from "../hooks/useShopProducts";
import Icon from "../components/customcomponents/Icon";
import FilterSection from "../components/FilterSection";
import { useTheme } from "../contexts/ThemeContext";
import ButtonLink from "../components/customcomponents/ButtonLink";
import { useRouter, useSearchParams } from "next/navigation";
import { NoImage } from "../components/SafeImage";
import ProductSkeleton from "../components/customcomponents/ProductSkeleton";
import {
  setToSessionStorage,
  getFromSessionStorage,
} from "../utils/sessionStorage";

const sortByOptions = [
  {
    value: "recently_added",
    label: "Recently Added",
  },
  {
    value: "price_high_to_low",
    label: "Price High To Low",
  },
  {
    value: "price_low_to_high",
    label: "Price Low To High",
  },
];

function ShopClient() {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;

  // Use the combined hook for filters and pagination
  const {
    filters,
    setFilters,
    currentPage,
    categories,
    searchQuery,
    // totalItems,
    // pageFrom: pageForm,
    // pageTo,
    hasActiveFilters,
    activeFilterCount,
    handleFilterChange,
    handlePriceRangeChange,
    clearAllFilters,
    // Product state
    products,
    isLoading,
    isLoadingMore,
    isFilterChange,
    isInitialLoad,
    hasMore,
    // Load more handler
    loadMore,
  } = useShopProducts();
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );
  // Initialize viewMode - for theme 2, check URL, otherwise default to "grid"
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlViewMode = urlParams.get("viewMode");
      return (urlViewMode as "grid" | "list") || "grid";
    }
    return "grid";
  });

  const handlePriceRangeApply = useCallback(
    (newRange: [number, number]) => {
      handlePriceRangeChange(newRange);
    },
    [handlePriceRangeChange]
  );

  const handleCheckboxChange = useCallback(
    (filterType: string, value: string) => {
      handleFilterChange(filterType, value);
    },
    [handleFilterChange]
  );

  // Scroll to top when no products are found with active filters
  useEffect(() => {
    if (products.length === 0 && hasActiveFilters && !isLoading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [products.length, hasActiveFilters, isLoading]);

  // Update URL with viewMode when theme is 2
  useEffect(() => {
    if (typeof window !== "undefined" && themeId === 2) {
      const urlParams = new URLSearchParams(window.location.search);
      if (viewMode === "list") {
        urlParams.set("viewMode", "list");
      } else {
        urlParams.delete("viewMode");
      }
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [viewMode, themeId]);

  // Scroll to product when returning from detail page

  // Add this to your ShopClient component
  const scrollAttempted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || products.length === 0) return;
    if (scrollAttempted.current) return;

    const scrollToProductId = sessionStorage.getItem("scrollToProductId");
    if (!scrollToProductId) return;

    scrollAttempted.current = true;
    sessionStorage.removeItem("scrollToProductId");

    let attempts = 0;
    const maxRetries = 5;

    const attemptScroll = () => {
      const productElement = document.querySelector(
        `[data-product-id="${scrollToProductId}"]`
      );

      if (productElement) {
        setTimeout(() => {
          const elementTop = productElement.getBoundingClientRect().top;
          const offset = window.pageYOffset;
          const headerOffset = 100; // Adjust for your header

          window.scrollTo({
            top: elementTop + offset - headerOffset,
            behavior: "smooth",
          });
        }, 50);
        return true;
      }

      attempts++;
      if (attempts < maxRetries) {
        setTimeout(attemptScroll, 100);
      }
    };

    setTimeout(attemptScroll, 100);
  }, [products]);

  const handleClearSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("search");
    router.replace(`/shop?${newParams.toString()}`);
  }, [searchParams, router]);

  const handleFilterClick = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  useEffect(() => {
    if (themeId === 2) {
      sessionStorage.setItem("productViewMode", viewMode);
    }
    if (themeId !== 2) {
      sessionStorage.removeItem("productViewMode");
      setViewMode("grid");
    }
  }, [viewMode, themeId]);

  const handleClearPriceRange = useCallback(() => {
    handlePriceRangeChange([100, 49999]);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", "1");
    router.replace(`/shop?${newParams.toString()}`);
  }, [handlePriceRangeChange, searchParams, router]);

  const handleClearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", "1");
    router.replace(`/shop?${newParams.toString()}`);
    clearAllFilters();
  }, [searchParams, router, clearAllFilters]);

  const handleSortChange = useCallback(
    (value: string) => {
      handleCheckboxChange("sort_by", value || "recently_added");
    },
    [handleCheckboxChange]
  );

  return (
    <>
      <div>
        {themeId === 2 && (
          <div className="px-container">
            <div className="mb-6 text-start">
              {/* Left */}
              <div className="flex justify-between lg:gap-2 items-end my-6">
                <span
                  onClick={handleFilterClick}
                  className={`flex gap-1 justify-center items-center text-lg font-medium text-[0.875rem] shrink-0 border border-[#E5E5E5] rounded-full px-4 py-2.5 ${
                    typeof window !== "undefined" && window.innerWidth < 1024
                      ? "cursor-pointer"
                      : ""
                  }`}
                  style={{
                    borderColor: `${textColor}2A`,
                  }}
                >
                  <span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.4051 12.1348C10.5612 12.3015 10.6483 12.5216 10.6483 12.75V19.9678L13.3475 18.1689V12.75C13.3475 12.5214 13.4353 12.3016 13.5916 12.1348L19.9012 5.40039H4.09651L10.4051 12.1348ZM15.1483 18.248C15.1483 18.5192 15.081 18.5266 14.953 19.0264V19.0273C14.825 19.2665 14.6397 19.4704 14.4139 19.6211L14.4129 19.6221L11.4129 21.6201L11.4139 21.6211C11.1657 21.7868 10.8764 21.8819 10.578 21.8965C10.2802 21.9109 9.98442 21.8443 9.72151 21.7041C9.45807 21.5636 9.23753 21.3544 9.08382 21.0986C8.9301 20.8429 8.84809 20.5502 8.84749 20.252V13.1055L2.53792 6.37012L2.52815 6.35938L2.52913 6.3584C2.31463 6.12217 2.17211 5.82957 2.12092 5.51465C2.06971 5.19951 2.1113 4.87601 2.24007 4.58398L2.29182 4.47656C2.42206 4.23105 2.6129 4.02197 2.84651 3.86914L2.94905 3.80762C3.19224 3.6726 3.46647 3.60033 3.74592 3.59961H20.2479C20.5275 3.59963 20.8021 3.67109 21.0457 3.80566L21.1483 3.86719L21.2459 3.93652C21.4673 4.10477 21.6435 4.32644 21.7567 4.58203C21.87 4.83802 21.9157 5.1178 21.8914 5.39453L21.8768 5.51367C21.8256 5.82872 21.6836 6.12272 21.4686 6.35938L21.4598 6.37012L15.1483 13.1055V18.248Z"
                        fill={textColor}
                      />
                    </svg>
                  </span>
                  Filter
                  {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
                </span>
                <div className="flex flex-wrap gap-2 justify-end items-center">
                  <div className="flex items-center justify-between gap-2 flex-xl-grow-1">
                    <label
                      htmlFor=""
                      className="font-medium hidden sm:block"
                      style={{ color: themeContext?.bodyTextColor }}
                    >
                      Sort By:
                    </label>
                    <div className="relative">
                      <select
                        className="appearance-none focus:outline-none flex gap-2 items-center font-medium pr-2 !lg:pr-12 !py-2.5 text-base shrink-0 border border-radius-xl px-4 bg-white"
                        value={filters.sort_by || ""}
                        onChange={(e) => handleSortChange(e.target.value)}
                        style={{
                          color: textColor,
                          backgroundColor: themeContext?.backgroundColor,
                          borderColor: `${textColor}2A`,
                          backgroundImage: "none",
                        }}
                      >
                        {sortByOptions.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            style={{
                              color: textColor,
                              backgroundColor: themeContext?.backgroundColor,
                            }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M5.75 8.75L10 13.25L14.25 8.75"
                            stroke={textColor || "#111"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-xl-grow-1">
                    <span
                      className="font-medium hidden sm:block"
                      style={{ color: themeContext?.bodyTextColor }}
                    >
                      View:
                    </span>
                    {/* Grid View Button */}
                    <button
                      onClick={() => handleViewModeChange("grid")}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer`}
                      style={{
                        backgroundColor: themeContext?.backgroundColor,
                        color: textColor,
                        borderColor:
                          viewMode === "grid"
                            ? `${textColor}5A`
                            : themeContext?.backgroundColor,
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
                          d="M18.75 4.5H5.25C4.83578 4.5 4.5 4.83578 4.5 5.25V18.75C4.5 19.1642 4.83578 19.5 5.25 19.5H18.75C19.1642 19.5 19.5 19.1642 19.5 18.75V5.25C19.5 4.83578 19.1642 4.5 18.75 4.5Z"
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
                      onClick={() => handleViewModeChange("list")}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer`}
                      style={{
                        backgroundColor: themeContext?.backgroundColor,
                        color: textColor,
                        borderColor:
                          viewMode === "list"
                            ? `${textColor}5A`
                            : themeContext?.backgroundColor,
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
                </div>
              </div>

              {/* Active Filters Chips */}
              {(hasActiveFilters || searchQuery) && (
                <div className="flex flex-wrap gap-[0.5rem] items-center">
                  {searchQuery && (
                    <span
                      onClick={handleClearSearch}
                      className="bg-[#EDEDED] font-medium text-sm text-[#101010] inline-flex items-center px-[0.9375rem] py-[0.375rem] gap-[0.375rem] rounded-full cursor-pointer"
                    >
                      Search:{" "}
                      <span className="w-20 overflow-hidden line-clamp-1">
                        {searchQuery}
                      </span>
                      <Icon
                        name={"close"}
                        stroke={"#111111"}
                        strokeWidth="1"
                        className="h-6 w-6 cursor-pointer"
                      />
                    </span>
                  )}
                  {filters?.categories?.map((categoryName: string) => {
                    const category = categories.find(
                      (cat) =>
                        cat.sub_category_name.toLowerCase() ===
                        categoryName.toLowerCase()
                    );
                    if (!category) return null;
                    return (
                      <span
                        key={category.sub_category_id}
                        onClick={() =>
                          handleCheckboxChange(
                            "categories",
                            category.sub_category_id.toString()
                          )
                        }
                        className="bg-[#EDEDED] font-medium text-sm text-[#101010] inline-flex items-center px-[0.9375rem] py-[0.375rem] gap-[0.375rem] rounded-full whitespace-nowrap cursor-pointer"
                      >
                        {category?.sub_category_name}
                        <Icon
                          name={"close"}
                          stroke={"#111111"}
                          strokeWidth="1"
                          className="h-6 w-6 cursor-pointer"
                        />
                      </span>
                    );
                  })}
                  {filters?.sizes?.map((size: string) => (
                    <span
                      key={size}
                      onClick={() => handleCheckboxChange("sizes", size)}
                      className="bg-[#EDEDED] font-medium text-sm text-[#101010] inline-flex items-center px-[0.9375rem] py-[0.375rem] gap-[0.375rem] rounded-full cursor-pointer"
                    >
                      {size}
                      <Icon
                        name={"close"}
                        stroke={"#111111"}
                        strokeWidth="1"
                        className="h-6 w-6 cursor-pointer"
                      />
                    </span>
                  ))}
                  {(filters?.priceRange?.[0] > 100 ||
                    filters?.priceRange?.[1] < 49999) && (
                    <span
                      onClick={handleClearPriceRange}
                      className="bg-[#EDEDED] font-medium text-sm text-[#101010] inline-flex items-center px-[0.9375rem] py-[0.375rem] gap-[0.375rem] rounded-full cursor-pointer"
                    >
                      ₹{filters?.priceRange?.[0]} - ₹{filters?.priceRange?.[1]}
                      <Icon
                        name="close"
                        stroke={"#111111"}
                        strokeWidth="1"
                        className="h-6 w-6 cursor-pointer"
                      />
                    </span>
                  )}
                  <span
                    className="whitespace-nowrap underline text-[0.875rem] cursor-pointer font-medium ms-3"
                    style={{
                      color: textColor,
                    }}
                    onClick={handleClearAllFilters}
                  >
                    Clear All
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={`${
            themeId === 2 ? "pb-[3.125rem] lg:pb-[100px]" : "py-padding-100"
          } mx-auto min-h-screen h-full flex flex-col relative`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 px-container">
            {isSidebarOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black/50"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div
                  className="relative w-72 max-w-full h-full p-5 shadow-lg overflow-y-auto"
                  style={{
                    backgroundColor: themeContext?.backgroundColor,
                    color: textColor,
                  }}
                >
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 cursor-pointer"
                  >
                    <Icon
                      name={"close"}
                      stroke={"#111111"}
                      className="w-5 h-5"
                    />
                  </button>

                  <div className="mt-10">
                    <FilterSection
                      filters={filters}
                      setFilters={setFilters}
                      categories={categories}
                      searchQuery={searchQuery || ""}
                      activeFilterCount={activeFilterCount}
                      handleCheckboxChange={handleCheckboxChange}
                      handleFilterChange={(filterType: string, value: any) => {
                        if (filterType === "priceRange") {
                          handlePriceRangeApply(value);
                        } else {
                          handleFilterChange(filterType, String(value));
                        }
                      }}
                      clearAllFilters={() => {
                        const newParams = new URLSearchParams(
                          searchParams.toString()
                        );
                        newParams.set("page", "1");
                        router.replace(`/shop?${newParams.toString()}`);
                        clearAllFilters();
                      }}
                      themeId={themeId}
                    />
                  </div>
                </div>
              </div>
            )}

            <>
              <div className="hidden lg:block lg:col-span-2 lg:sticky lg:self-start lg:top-[100px] text-center">
                <FilterSection
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                  searchQuery={searchQuery || ""}
                  activeFilterCount={activeFilterCount}
                  handleCheckboxChange={handleCheckboxChange}
                  handleFilterChange={(filterType: string, value: any) => {
                    if (filterType === "priceRange") {
                      handlePriceRangeApply(value);
                    } else {
                      handleFilterChange(filterType, String(value));
                    }
                  }}
                  clearAllFilters={clearAllFilters}
                  themeId={themeId}
                />
              </div>

              <div className="lg:col-span-10 lg:pl-[1.875rem] relative">
                {(themeId === 1 ||
                  themeId === 3 ||
                  themeId === 4 ||
                  themeId === 5 ||
                  themeId === 6) && (
                  <div className="flex flex-wrap gap-2 justify-end mb-[1.5rem] items-center">
                    <div className="flex items-center gap-3">
                      {themeId === 1 && (
                        <span
                          className="uppercase text-sm"
                          style={{
                            color: themeContext?.textColor,
                          }}
                        >
                          {/* {pageForm && pageTo && (
                              <>
                                Showing 1-{pageTo} of {totalItems} results.
                              </>
                            )} */}
                        </span>
                      )}
                      {(themeId === 3 ||
                        themeId === 1 ||
                        themeId === 4 ||
                        themeId === 5 ||
                        themeId === 6) && (
                        <>
                          <label
                            htmlFor=""
                            className="font-medium hidden sm:block"
                            style={{ color: themeContext?.bodyTextColor }}
                          >
                            Sort By:
                          </label>
                          <div className="relative">
                            <select
                              className="appearance-none focus:outline-none flex gap-2 items-center font-medium !pr-12 !py-2.5 text-base shrink-0 border border-radius-xl px-4"
                              value={filters.sort_by || ""}
                              onChange={(e) => handleSortChange(e.target.value)}
                              style={{
                                color: themeContext?.textColor,
                                backgroundColor: themeContext?.backgroundColor,
                                borderColor: `${themeContext?.textColor}2A`,
                                backgroundImage: "none",
                              }}
                            >
                              {sortByOptions.map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  style={{
                                    color: themeContext?.textColor,
                                    backgroundColor:
                                      themeContext?.backgroundColor,
                                  }}
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {/* Custom dropdown arrow */}
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="none"
                              >
                                <path
                                  d="M5.75 8.75L10 13.25L14.25 8.75"
                                  stroke={themeContext?.textColor || "#111"}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </>
                      )}
                      <div className="lg:hidden flex justify-end">
                        <button
                          onClick={() => setIsSidebarOpen(true)}
                          className="btn px-4 py-2 bg-transparent rounded-lg inline-flex gap-3 items-center justify-center border border-gray-300 text-sm focus:outline-none hover:bg-gray-100 transition-all duration-300"
                        >
                          <span className=" text-sm font-medium">Filter</span>
                          <Icon
                            name="filter"
                            stroke={textColor}
                            className="max-w-[100%] max-h-[100%]"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Filters Chips for Mobile View (All Themes) */}
                {themeId !== 2 && (hasActiveFilters || searchQuery) && (
                  <div className="lg:hidden mb-6">
                    <div className="flex flex-wrap gap-[0.5rem] items-center">
                      {searchQuery && (
                        <span
                          onClick={handleClearSearch}
                          className="filter-chip-item bg-[#F8F8F8] text-sm text-[#111111] inline-flex items-center px-[0.9375rem] py-[0.375rem] cursor-pointer"
                        >
                          Search:{" "}
                          <span className="line-clamp-1 w-20">
                            {searchQuery}
                          </span>
                          <Icon
                            name={"close"}
                            stroke={"#111111"}
                            strokeWidth="1"
                            className="h-6 w-6 cursor-pointer"
                          />
                        </span>
                      )}
                      {filters?.categories?.map((categoryName: string) => {
                        const category = categories.find(
                          (cat) =>
                            cat.sub_category_name.toLowerCase() ===
                            categoryName.toLowerCase()
                        );
                        if (!category) return null;
                        return (
                          <span
                            key={category.sub_category_id}
                            onClick={() =>
                              handleCheckboxChange(
                                "categories",
                                category.sub_category_id.toString()
                              )
                            }
                            className="filter-chip-item bg-[#F8F8F8] text-sm text-[#111111] inline-flex items-center px-[0.9375rem] py-[0.375rem] cursor-pointer"
                          >
                            {category?.sub_category_name}
                            <Icon
                              name={"close"}
                              stroke={"#111111"}
                              strokeWidth="1"
                              className="h-6 w-6 cursor-pointer"
                            />
                          </span>
                        );
                      })}
                      {filters?.sizes?.map((size: string) => (
                        <span
                          key={size}
                          onClick={() => handleCheckboxChange("sizes", size)}
                          className="filter-chip-item bg-[#F8F8F8] text-sm text-[#111111] inline-flex items-center px-[0.9375rem] py-[0.375rem] cursor-pointer"
                        >
                          {size}
                          <Icon
                            name={"close"}
                            stroke={"#111111"}
                            strokeWidth="1"
                            className="h-6 w-6 cursor-pointer"
                          />
                        </span>
                      ))}
                      {(filters?.priceRange?.[0] > 100 ||
                        filters?.priceRange?.[1] < 49999) && (
                        <span
                          onClick={() => {
                            handlePriceRangeChange([100, 49999]);
                            const newParams = new URLSearchParams(
                              searchParams.toString()
                            );
                            newParams.set("page", "1");
                            router.replace(`/shop?${newParams.toString()}`);
                          }}
                          className="filter-chip-item bg-[#F8F8F8] text-sm text-[#111111] inline-flex items-center px-[0.9375rem] py-[0.375rem] cursor-pointer"
                        >
                          ₹{filters?.priceRange?.[0]} - ₹
                          {filters?.priceRange?.[1]}
                          <Icon
                            name="close"
                            stroke={"#111111"}
                            strokeWidth="1"
                            className="h-6 w-6 cursor-pointer"
                          />
                        </span>
                      )}
                      <span
                        className="whitespace-nowrap underline text-[0.875rem] cursor-pointer font-medium ms-3"
                        onClick={() => {
                          const newParams = new URLSearchParams(
                            searchParams.toString()
                          );
                          newParams.set("page", "1");
                          router.replace(`/shop?${newParams.toString()}`);
                          clearAllFilters();
                        }}
                        style={{
                          color: textColor,
                        }}
                      >
                        Clear All
                      </span>
                    </div>
                  </div>
                )}

                {isLoading || isFilterChange || isInitialLoad ? (
                  // Show skeleton during initial loading or filter changes
                  <ProductSkeleton
                    viewMode={viewMode}
                    count={products.length || 12}
                  />
                ) : products.length > 0 ? (
                  // Show products when loaded
                  <>
                    <div
                      className={
                        viewMode === "list"
                          ? "grid grid-cols-1 gap-4 md:gap-6 hr-line-between"
                          : "shop-p-grid word-break"
                      }
                      key={`products-${currentPage}`}
                    >
                      {products.map((item: any, index) => (
                        <CardComponent
                          key={item.id + index || item.product_id + index}
                          product={item}
                          viewMode={viewMode}
                        />
                      ))}

                      {/* Load More button */}
                      {hasMore && !isLoading && !isLoadingMore && (
                        <div className="col-span-full flex justify-center items-center text-center py-6">
                          <button
                            onClick={loadMore}
                            style={{
                              color: themeContext?.buttonTextColor,
                              backgroundColor:
                                themeContext?.buttonBackgroundColor,
                              borderColor: themeContext?.buttonBorderColor,
                            }}
                            className="btn px-12 py-3 flex items-center gap-2 border"
                          >
                            Load More
                          </button>
                        </div>
                      )}
                    </div>
                    {isLoadingMore && (
                      <ProductSkeleton viewMode={viewMode} count={12} />
                    )}
                  </>
                ) : (
                  // No products found (only show when not loading and no products)
                  <div className="col-span-full text-center py-8 h-screen">
                    <NoImage
                      width={500}
                      height={500}
                      className="mx-auto mb-10"
                    />
                    <ButtonLink
                      onClick={clearAllFilters}
                      to="/shop"
                      showIcon={false}
                      className=""
                    >
                      Clear all filters
                    </ButtonLink>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ShopClient);
