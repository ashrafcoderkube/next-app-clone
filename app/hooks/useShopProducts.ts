import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import {
  fetchProducts,
  fetchProductsVariations,
  fetchProductCategories,
} from "../redux/slices/productSlice";
import { fetchWishList } from "../redux/slices/wishlistSlice";
import {
  getFromSessionStorage,
  setToSessionStorage,
} from "../utils/sessionStorage";

// Simple debounce utility
// function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): T & { cancel: () => void } {
//   let timeout: NodeJS.Timeout | null = null;

//   const debounced = ((...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       func(...args);
//     }, wait);
//   }) as T & { cancel: () => void };

//   debounced.cancel = () => {
//     if (timeout) {
//       clearTimeout(timeout);
//       timeout = null;
//     }
//   };

//   return debounced;
// }

interface Filters {
  categories: string[];
  sizes: string[];
  priceRange: [number, number];
  search: string;
  sort_by: string;
}

interface UseShopProductsReturn {
  // Filter state
  filters: Filters;
  setFilters: (filters: Filters) => void;
  categories: any[];
  searchQuery: string | null;
  hasActiveFilters: boolean;
  activeFilterCount: number;

  // Product state
  products: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isFilterChange: boolean;
  isInitialLoad: boolean;
  hasMore: boolean;

  // Pagination info
  currentPage: number;

  // Handlers
  handleFilterChange: (filterType: string, value: string) => void;
  handlePriceRangeChange: (newRange: [number, number]) => void;
  clearAllFilters: () => void;
  loadMore: () => void;
}

const useShopProducts = (): UseShopProductsReturn => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  // Redux state
  const { productCategories } = useAppSelector(
    (state: RootState) => state.products
  );
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  // Local state
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFilterChange, setIsFilterChange] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastLoadedFilterRef = useRef<string | null>(null);
  const resetPageOnClearRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Categories
  const categories = useMemo(
    () => productCategories?.sub_categories || [],
    [productCategories]
  );

  useEffect(() => {
    if(!productCategories) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch]);
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    categories: searchParams.get("categories")
      ? searchParams.get("categories")!.split(",")
      : [],
    sizes: searchParams.get("sizes")
      ? searchParams.get("sizes")!.split(",")
      : [],
    priceRange: [
      searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : 100,
      searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : 49999,
    ],
    search: searchQuery || "",
    sort_by: searchParams.get("sort_by") || "recently_added",
  });

  // Sync filters with URL params
  useEffect(() => {
    setFilters({
      categories: searchParams.get("categories")
        ? searchParams.get("categories")!.split(",")
        : [],
      sizes: searchParams.get("sizes")
        ? searchParams.get("sizes")!.split(",")
        : [],
      priceRange: [
        searchParams.get("min_price")
          ? Number(searchParams.get("min_price"))
          : 100,
        searchParams.get("max_price")
          ? Number(searchParams.get("max_price"))
          : 49999,
      ],
      search: searchQuery || "",
      sort_by: searchParams.get("sort_by") || "recently_added",
    });
  }, [searchParams, searchQuery]);

  // Filter params string for cache key (excluding page)
  const filterParamsString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    return params.toString();
  }, [searchParams]);

  // Build request params from URL
  const buildRequestParams = useCallback(
    (pageToLoad: number) => {
      const urlParams = Object.fromEntries([...searchParams.entries()]);
      const requestParams: any = { page: pageToLoad };

      // Convert category names to IDs
      if (urlParams.categories) {
        const categoryNames = urlParams.categories.split(",");
        const subcategoryIds = categoryNames
          .map((catName: string) => {
            const category = categories.find(
              (cat: any) =>
                (cat.sub_category_name || cat.name)?.toLowerCase() ===
                catName.toLowerCase()
            );
            return category ? category.sub_category_id : null;
          })
          .filter(Boolean);

        if (subcategoryIds.length > 0) {
          requestParams.sub_category = subcategoryIds.join(",");
        }
      }

      // Add other filters
      if (urlParams.min_price)
        requestParams.min_price = Number(urlParams.min_price);
      if (urlParams.max_price)
        requestParams.max_price = Number(urlParams.max_price);
      if (urlParams.sizes) requestParams.size = urlParams.sizes;
      if (urlParams.search) requestParams.search = urlParams.search;
      // Always include sort_by with default value
      requestParams.sort_by = urlParams.sort_by || "recently_added";

      return requestParams;
    },
    [searchParams, categories]
  );

  const PAGE_SIZE = 12;
  // Load products for a specific page
  const loadProductsForPage = useCallback(
    async (pageToLoad: number, append = false) => {
      let productsResponse: any;

      try {
        const requestParams = buildRequestParams(pageToLoad);
        const cacheKey = filterParamsString + `_all_products`;

        // Check session storage first for non-append operations (only for products/v2)
        if (!append) {
          const cachedProducts = getFromSessionStorage(cacheKey);
          if (cachedProducts) {
            setProducts(cachedProducts);
            setIsInitialLoad(false);
            setIsLoading(false);
            setIsFilterChange(false);
            
            // Calculate hasMore based on cached products length
            const hasMoreProducts = cachedProducts.length % PAGE_SIZE === 0;
            setHasMore(hasMoreProducts);
            
            // Set current page based on cached products
            const calculatedPage = Math.ceil(cachedProducts.length / PAGE_SIZE);
            setCurrentPage(calculatedPage + 1);
            
            // ALWAYS call these APIs even when products are cached
            // Fetch product variations for filters (sizes, etc.) - NO CACHE
            const variationParams: any = {};
            if (requestParams.sub_category) {
              variationParams.sub_category_id = requestParams.sub_category
                .toString()
                .split(",")
                .map((id: string) => Number(id.trim()));
            }
            dispatch(fetchProductsVariations(variationParams));

            // Fetch wishlist - NO CACHE
            if (isAuthenticated) {
              dispatch(fetchWishList());
            }

            return;
          }
        }

        // Fetch product variations for filters (sizes, etc.) - ALWAYS CALL
        const variationParams: any = {};
        if (requestParams.sub_category) {
          variationParams.sub_category_id = requestParams.sub_category
            .toString()
            .split(",")
            .map((id: string) => Number(id.trim()));
        }
        dispatch(fetchProductsVariations(variationParams));

        // Fetch wishlist - ALWAYS CALL
        if (isAuthenticated) {
          dispatch(fetchWishList());
        }

        // Fetch products - CACHE THIS CALL ONLY
        const res = await dispatch(fetchProducts(requestParams)).unwrap();

        const products = res.data || [];

        let updatedProducts: any[];
        if (!append) {
          updatedProducts = products;
          setProducts(products);
          setIsInitialLoad(false);
        } else {
          // Load more - append to existing products
          setProducts(prev => {
            updatedProducts = [...prev, ...products];
            setToSessionStorage(cacheKey, updatedProducts);
            return updatedProducts;
          });
        }

        // Only update session storage for non-append operations (append already handles it above)
        if (!append) {
          setToSessionStorage(cacheKey, updatedProducts);
        }

        setHasMore(products.length === PAGE_SIZE);

        if (products.length === PAGE_SIZE) {
          setCurrentPage((prev) => prev + 1);
        }
      } catch (err) {
        console.error(err);
        setHasMore(false);
        setProducts([]);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsFilterChange(false);
      }
    },
    [dispatch, buildRequestParams, filterParamsString]
  );

  // Initial load and filter change handler
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Skip if already loading to prevent duplicate API calls
      if (isLoading) return;

      // Skip if we've already loaded this exact filter configuration
      if (lastLoadedFilterRef.current === filterParamsString) {
        return;
      }

      // On page refresh (initial mount), ensure sort_by is in URL first
      if (isInitialMountRef.current && !searchParams.get("sort_by")) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("sort_by", "recently_added");
        router.replace(`/shop?${newParams.toString()}`);
        // Return early - the URL change will trigger this effect again
        return;
      }

      // On page refresh (initial mount)
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;

        // Clear navigation flag if present
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("navigatingFromShop");
        }
      }

      // Don't clear products immediately to avoid flash
      setIsFilterChange(true);
      setIsLoading(true);
      setHasMore(true);
      setCurrentPage(1);

      // Mark that we've loaded this filter configuration
      lastLoadedFilterRef.current = filterParamsString;

      // Always load from page 1
      await loadProductsForPage(1, false);
    }, 50); // Small delay to batch URL updates

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParamsString]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterType: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        if (filterType === "categories") {
          const category = categories.find(
            (cat: any) => (cat.sub_category_id || cat.id)?.toString() === value
          ) || { sub_category_name: value, name: value };
          const categoryName = category.sub_category_name?.toLowerCase();

          if (prevFilters.categories.includes(categoryName)) {
            newFilters.categories = prevFilters.categories.filter(
              (cat) => cat.toLowerCase() !== categoryName
            );
          } else {
            newFilters.categories = [...prevFilters.categories, categoryName];
          }

          if (newFilters.categories.length > 0) {
            params.set("categories", newFilters.categories.join(","));
          } else {
            params.delete("categories");
          }
        } else if (filterType === "priceRange") {
          newFilters.priceRange = value as any;
          if ((value as any)[0] > 100) {
            params.set("min_price", (value as any)[0].toString());
          } else {
            params.delete("min_price");
          }
          if ((value as any)[1] < 49999) {
            params.set("max_price", (value as any)[1].toString());
          } else {
            params.delete("max_price");
          }
        } else if (filterType === "sizes") {
          newFilters.sizes = prevFilters.sizes.includes(value)
            ? prevFilters.sizes.filter((s) => s !== value)
            : [...prevFilters.sizes, value];

          if (newFilters.sizes.length > 0) {
            params.set("sizes", newFilters.sizes.join(","));
          } else {
            params.delete("sizes");
          }
        } else if (filterType === "sort_by") {
          newFilters.sort_by = value;
          params.set("sort_by", value);
        }

        // Defer router update to avoid setState during render
        setTimeout(() => {
          router.replace(`/shop?${params.toString()}`);
        }, 0);

        return newFilters;
      });
    },
    [categories, searchParams, router]
  );

  // Handle price range change
  const handlePriceRangeChange = useCallback(
    (newRange: [number, number]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newRange[0] > 100) {
        params.set("min_price", newRange[0].toString());
      } else {
        params.delete("min_price");
      }
      if (newRange[1] < 49999) {
        params.set("max_price", newRange[1].toString());
      } else {
        params.delete("max_price");
      }

      // Defer router update to avoid setState during render
      setTimeout(() => {
        router.replace(`/shop?${params.toString()}`);
      }, 0);

      setFilters((prev) => ({
        ...prev,
        priceRange: newRange,
      }));
    },
    [searchParams, router]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    newParams.set("sort_by", "recently_added");

    // Defer router update to avoid setState during render
    setTimeout(() => {
      router.replace(`/shop?${newParams.toString()}`);
    }, 0);

    setFilters({
      categories: [],
      sizes: [],
      sort_by: "recently_added",
      priceRange: [100, 49999],
      search: "",
    });
  }, [router]);

  // Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    loadProductsForPage(currentPage, true);
  }, [hasMore, isLoadingMore, loadProductsForPage, currentPage]);

  const hasActiveFilters = useMemo(
    () =>
      filters.categories.length > 0 ||
      filters.sizes.length > 0 ||
      filters.priceRange[0] > 100 ||
      filters.priceRange[1] < 49999 ||
      filters.search.length > 0,
    [filters]
  );

  const activeFilterCount = useMemo(
    () =>
      filters.categories.length +
      filters.sizes.length +
      (filters.priceRange[0] > 100 || filters.priceRange[1] < 49999 ? 1 : 0) +
      (filters.search ? 1 : 0),
    [filters]
  );

  // Memoize primitive and stable values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Filter state
      filters,
      setFilters,
      categories,
      searchQuery,
      hasActiveFilters,
      activeFilterCount,

      // Product state
      products,
      isLoading,
      isLoadingMore,
      isFilterChange,
      isInitialLoad,
      hasMore,

      // Pagination info
      currentPage: currentPage - 1, // Return 0-based page for compatibility
      // ...paginationInfo,

      // Handlers - these are useCallback so should be stable
      handleFilterChange,
      handlePriceRangeChange,
      clearAllFilters,
      loadMore,
    }),
    [
      // Only include values that actually change the return value
      filters,
      categories,
      searchQuery,
      hasActiveFilters,
      activeFilterCount,
      products,
      isLoading,
      isLoadingMore,
      isFilterChange,
      isInitialLoad,
      hasMore,
      currentPage,
      // paginationInfo.totalPages,
      // paginationInfo.totalItems,
      // paginationInfo.pageFrom,
      // paginationInfo.pageTo,
      // Note: Not including functions in deps since they should be stable useCallback refs
    ]
  );
};

export default useShopProducts;
