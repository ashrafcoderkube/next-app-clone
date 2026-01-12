"use client";

import React from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectThemeData } from "../../redux/selectors";
import ProductSkeleton from "./ProductSkeleton";

const NewArrivalSectionSkeleton = React.memo(function NewArrivalSectionSkeleton() {
  const { themeId } = useAppSelector(selectThemeData);

  return (
    <div className="px-container py-[20px] sm:pb-[50px] md:pb-[50px] lg:pb-[50px] animate-pulse">
      {/* Title skeleton */}
      <div
        className="text-[2rem] lg:text-[2.625rem] font-bold section-title-margin mb-5.5 h-10 bg-gray-200 rounded w-1/3 mx-auto"
        style={{
          textAlign: themeId === 2 ? "left" : "center",
        }}
      />

      {/* Products skeleton */}
      <ProductSkeleton viewMode="grid" count={themeId === 6 ? 8 : 12} />
    </div>
  );
});

NewArrivalSectionSkeleton.displayName = "NewArrivalSectionSkeleton";

export default NewArrivalSectionSkeleton;
