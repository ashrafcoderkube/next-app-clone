"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CategorySlider from "../customcomponents/CategorySlider";
import ButtonLink, { ButtonLink2 } from "../customcomponents/ButtonLink";
import OutlineButton from "../customcomponents/OutlineButton";
import CustomCategoryCard from "../customcomponents/CustomCategoryCard";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectThemeData,
  selectProductCategories,
  selectThemeColors,
} from "../../redux/selectors";
import SafeImage from "../SafeImage";
import { fetchProductCategories } from "@/app/redux/slices/productSlice";

// Extract style objects to prevent recreation
const sharedLayoutStyle = {
  zIndex: 10,
  position: "relative" as const,
  borderRadius: "0 0 1.5rem 1.5rem",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
};

const categoryCardStyle = (themeId: number, bodyTextColor?: string) => ({
  marginBottom: themeId === 4 ? "0" : "1.25rem",
  color: bodyTextColor,
});

const categoryTitleStyle = (bodyTextColor?: string) => ({
  color: bodyTextColor,
});

const categoryImageStyle = {
  objectFit: "cover" as const,
  transform: "rotate(0deg)",
  opacity: 1,
};

const gridCardStyle = {
  height: "100%",
  borderRadius: "1.125rem",
  overflow: "hidden" as const,
};

const gridImageStyle = {
  objectFit: "cover" as const,
  transform: "rotate(0deg)",
  opacity: 1,
};

const overlayStyle = (themeColors?: any) => ({
  backgroundColor: themeColors?.backgroundColor,
  color: themeColors?.textColor,
});

// Shared layout component for themes 1, 3, 4, 5 - extracted outside to prevent recreation
const SharedLayout = React.memo(function SharedLayout({
  themeId,
  themeColors,
  onViewAllCategories,
}: {
  themeId: number;
  themeColors: any;
  onViewAllCategories: () => void;
}) {
  return (
    <div
      className="py-[30px] sm:py-[60px] md:pb-[50px] lg:pb-[50px] z-10 relative rounded-b-none rounded-3xl"
      style={sharedLayoutStyle}
    >
      {themeId !== 4 && themeId !== 6 && (
        <p
          className="uppercase"
          style={categoryTitleStyle(themeColors?.bodyTextColor)}
        >
          The Essentials
        </p>
      )}
      <div className="px-container">
        <h2
          className="text-[2rem] lg:text-[2.625rem] font-bold section-title-margin"
          style={categoryCardStyle(themeId, themeColors?.bodyTextColor)}
        >
          Shop By Categories
        </h2>
        {themeId === 4 && (
          <p className="text-xl sm:mb-6 mb-4">
            Explore our diverse range of premium products
          </p>
        )}
      </div>
      <div>
        <CategorySlider />
      </div>
      <div className="mt-[20px] lg:mt-[3.125rem]">
        {(themeId === 1 || themeId === 3 || themeId === 6) && (
          <ButtonLink to="/categories">View All Categories</ButtonLink>
        )}
        {(themeId === 4 || themeId === 5) && (
          <OutlineButton onClick={onViewAllCategories}>
            View All Categories
          </OutlineButton>
        )}
      </div>
    </div>
  );
});

SharedLayout.displayName = "SharedLayout";

const ShopCategory = React.memo(function ShopCategory() {
  const router = useRouter();
  const { themeId } = useAppSelector(selectThemeData);
  const themeColors = useAppSelector(selectThemeColors);
  const { categories } = useAppSelector(selectProductCategories);

  // Memoize the view all categories handler
  const handleViewAllCategories = React.useCallback(() => {
    router.push("/categories");
  }, [router]);

  // if (!categories || categories.length === 0) return null;

  // Memoize theme layout to prevent recreation
  const themeLayout = React.useMemo(
    () => ({
      1: (
        <SharedLayout
          themeId={themeId}
          themeColors={themeColors}
          onViewAllCategories={handleViewAllCategories}
        />
      ),
      2: (
        <div className="py-padding-70 px-container">
          <div className="flex flex-wrap gap-2 justify-between items-center mb-5.5">
            <h2
              className="text-[1.5rem] lg:text-[2rem] font-bold"
              style={categoryTitleStyle(themeColors?.bodyTextColor)}
            >
              Shop By Categories
            </h2>

            <ButtonLink2 to="/categories">Shop All Categories</ButtonLink2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
            <div
              className="relative before:content-[''] before:block before:float-left before:pt-[90%] lg:before:pt-[88.2%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] rounded-[1.125rem] flex flex-col align-items-center justify-center"
              style={gridCardStyle}
            >
              {categories.length > 0 && categories[0] && (
                <div className="relative w-full h-full">
                  <SafeImage
                    className="absolute top-0 left-0"
                    src={categories[0]?.sub_category_image}
                    alt={categories[0]?.sub_category_name || "Category"}
                    fill
                    style={categoryImageStyle}
                  />
                  <div
                    className="bg-[#ffffff] rounded-[0.625rem] p-6 z-1 absolute max-w-xs w-full bottom-6 -inset-x-2/4 mx-auto"
                    style={overlayStyle(themeColors)}
                  >
                    <h3
                      className="font-medium text-2xl mb-1"
                      style={categoryTitleStyle(themeColors?.bodyTextColor)}
                    >
                      {categories[0]?.sub_category_name}
                    </h3>
                    <Link
                      href={`/shop?categories=${encodeURIComponent(
                        categories[0]?.sub_category_name || ""
                      ).toLowerCase()}`}
                      className="underline font-semibold cursor-pointer block"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {categories?.length > 0 &&
                categories?.slice(1, 5)?.map((category) => (
                  <div
                    key={category?.sub_category_id}
                    className="w-full relative before:content-[''] before:block before:float-left before:pt-[90%] lg:before:pt-[20%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] rounded-[1.125rem] flex flex-col align-items-center justify-center"
                    style={gridCardStyle}
                  >
                    <div className="absolute top-0 left-0 w-full h-full">
                      <SafeImage
                        src={category?.sub_category_image}
                        alt={category?.sub_category_name || "Category"}
                        fill
                        style={gridImageStyle}
                      />
                    </div>
                    <div
                      className="bg-[#ffffff] rounded-[0.625rem] p-6 z-1 absolute max-w-[18.125rem] w-full bottom-6 -inset-x-2/4 mx-auto"
                      style={overlayStyle(themeColors)}
                    >
                      <h3
                        className="font-medium text-2xl mb-1"
                        style={categoryTitleStyle(themeColors?.bodyTextColor)}
                      >
                        {category?.sub_category_name}
                      </h3>
                      <Link
                        href={`/shop?categories=${encodeURIComponent(
                          category?.sub_category_name || ""
                        ).toLowerCase()}`}
                        className="underline font-semibold cursor-pointer block"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ),
      3: (
        <SharedLayout
          themeId={themeId}
          themeColors={themeColors}
          onViewAllCategories={handleViewAllCategories}
        />
      ),
      4: (
        <SharedLayout
          themeId={themeId}
          themeColors={themeColors}
          onViewAllCategories={handleViewAllCategories}
        />
      ),
      5: (
        <SharedLayout
          themeId={themeId}
          themeColors={themeColors}
          onViewAllCategories={handleViewAllCategories}
        />
      ),
      6: (
        <div
          className="py-20 px-container"
          style={{
            backgroundColor: themeColors?.backgroundColor,
          }}
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 w-fit"
                style={{
                  backgroundColor: `${themeColors?.buttonBackgroundColor}1A`,
                  color: themeColors?.buttonBackgroundColor,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: themeColors?.buttonBackgroundColor,
                  }}
                ></span>{" "}
                Categories
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={categoryTitleStyle(themeColors?.bodyTextColor)}
              >
                Shop By Categories
              </h2>
            </div>
            <div className="hidden md:flex">
              <ButtonLink to="/categories">View All</ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.slice(0, 4)?.map((category, index) => (
              <div key={category?.sub_category_id} className="w-full">
                <CustomCategoryCard item={category} index={index} />
              </div>
            ))}
          </div>
          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <ButtonLink to="/categories">View All Categories</ButtonLink>
          </div>
        </div>
      ),
    }),
    [themeId, themeColors, categories, handleViewAllCategories]
  );

  return <>{themeLayout[themeId] || themeLayout[1]}</>;
});

ShopCategory.displayName = "ShopCategory";

export default ShopCategory;
