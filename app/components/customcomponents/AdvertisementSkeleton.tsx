import React from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectThemeData } from "../../redux/selectors";

const AdvertisementSkeleton = React.memo(function AdvertisementSkeleton() {
  const { themeId } = useAppSelector(selectThemeData);

  if (themeId === 1) {
    // Theme 1: Marquee style advertisement
    return (
      <div className="animate-pulse py-8">
        <div className="bg-gray-200 h-[500px] rounded-lg flex items-center justify-center">
          <div className="h-4 bg-gray-300 rounded w-3/4 h-[250px]" />
        </div>
      </div>
    );
  }

  if (themeId === 2) {
    // Theme 2: Card style advertisement
    return (
      <div className="animate-pulse px-4 py-8">
        <div className="bg-gray-200 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
          {/* Image skeleton */}
          <div className="w-full md:w-1/3 h-48 bg-gray-300 rounded-lg" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/4" />
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="h-10 bg-gray-300 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 3) {
    // Theme 3: Multiple cards
    return (
      <div className="animate-pulse px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`ad-skeleton-${index}`} className="bg-gray-200 rounded-lg p-4">
              <div className="h-48 bg-gray-300 rounded mb-4" />
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-full mb-1" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default skeleton for other themes
  return (
    <div className="animate-pulse px-4 py-8">
      <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 bg-gray-300 rounded w-32 mx-auto mb-4" />
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
});

AdvertisementSkeleton.displayName = "AdvertisementSkeleton";

export default AdvertisementSkeleton;
