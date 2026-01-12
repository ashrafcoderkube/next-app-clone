// TopHeaderSkeleton.tsx
export const TopHeaderSkeleton = () => {
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          {/* Header content only - no actions or navigation */}
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// HeaderSkeleton.tsx
export const HeaderSkeleton = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {/* Header content only - no actions or navigation */}
          <div className="h-12 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </header>
  );
};

// HeaderWholesalerSkeleton.tsx
export const HeaderWholesalerSkeleton = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          {/* Header content only - no actions or navigation */}
          <div className="h-10 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </header>
  );
};

// FooterSkeleton.tsx
export const FooterSkeleton = () => {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - About/Logo */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Column 2 - Links */}
          <div className="space-y-4">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Column 3 - Links */}
          <div className="space-y-4">
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Column 4 - Contact/Newsletter */}
          <div className="space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Bottom footer */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// WholesalerFooterSkeleton.tsx
export const WholesalerFooterSkeleton = () => {
  return (
    <footer className="w-full bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="h-6 w-28 bg-gray-700 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-20 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-700 rounded animate-pulse mt-4" />
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-3 w-56 bg-gray-700 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-7 w-7 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-7 w-7 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-7 w-7 bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
