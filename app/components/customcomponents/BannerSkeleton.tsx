import React from "react";

const BannerSkeleton = React.memo(function BannerSkeleton() {
  return (
    <div className="hero-overlay relative animate-pulse">
      {/* Image skeleton */}
      <div className="relative before:content-[''] before:block before:float-left before:pt-[100%] md:before:pt-[45%] after:content-[''] after:table after:clear-both bg-gray-200 h-full w-full rounded-lg" />

      {/* Content skeleton */}
      <div className="content-wrapper absolute inset-0 flex flex-col justify-center items-center text-center">
        {/* Title skeleton */}
        <div className="mb-4">
          <div className="h-8 md:h-12 bg-gray-300 rounded w-3/4 mx-auto mb-2" />
          <div className="h-8 md:h-12 bg-gray-300 rounded w-1/2 mx-auto" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-gray-300 rounded-full w-40 mx-auto" />
      </div>
    </div>
  );
});

BannerSkeleton.displayName = "BannerSkeleton";

export default BannerSkeleton;
