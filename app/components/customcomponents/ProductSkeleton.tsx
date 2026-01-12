"use client";

import { useAppSelector } from "@/app/redux/hooks";
import { selectThemeData } from "@/app/redux/selectors";
import React from "react";

interface ProductSkeletonProps {
  viewMode?: "grid" | "list";
  count?: number;
}

const ProductSkeletonCard = ({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "list";
}) => {
  const { themeId } = useAppSelector(selectThemeData);
  if (viewMode === "list") {
    return (
      <div className="animate-pulse flex flex-col md:flex-row gap-4 p-4 rounded-lg">
        {/* Image skeleton */}
        <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4" />

          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>

          {/* Price and button row */}
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  // Grid view skeleton
  return (
    <div className="product-card animate-pulse overflow-hidden">
      {/* Image skeleton */}
      <div
        className="new_product_card_image w-full bg-gray-200"
        style={{
          aspectRatio: themeId === 1 ? "4/5" : "4/4",
        }}
      />

      {/* Content skeleton */}
      <div className="pt-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2" />

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  viewMode = "grid",
  count = 12,
}) => {
  return (
    <div
      className={
        "mt-9 " +
        (viewMode === "list"
          ? "grid grid-cols-1 gap-4 md:gap-6"
          : "shop-p-grid word-break")
      }
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductSkeletonCard key={`skeleton-${index}`} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default ProductSkeleton;
