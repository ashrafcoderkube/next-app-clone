import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import axiosInstance from "@/app/utils/axiosInstance";

// Define the product state interface
interface ProductState {
  product: any | null;
  featured: any | null;
  newArrivals: any | null;
  productDetails: any | null;
  productVariations: string[];
  productCategories: any | null;
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  similarProducts: any | null;
}

// Initial state
const initialState: ProductState = {
  product: null,
  featured: null,
  newArrivals: null,
  productDetails: null,
  productVariations: [],
  productCategories: null,
  loading: false,
  searchLoading: false,
  error: null,
  similarProducts: null,
};

// Async thunk for fetching product variations
export const fetchProductsVariations = createAsyncThunk(
  "product/fetchProductsVariations",
  async (
    params: { sub_category_id?: number[] },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axiosInstance.post(`home/subcategory-variations`, params);
      const data = response.data;

      if (!data?.success) {
        dispatch(resetProductList());
      }
      const uniqueSizes = [
        ...new Set(
          data?.data
            ?.map((item: any) => item.sub_category_variation)
            ?.filter(Boolean)
            ?.flatMap((str: string) => str.split(","))
            ?.map((s: string) => s.trim())
            ?.filter((s: string) => s.length > 0)
        ),
      ];

      return {
        data: uniqueSizes,
      };
    } catch (error: any) {
      dispatch(resetProductList());
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products information");
    }
  }
);

// Async thunk for fetching featured products
export const fetchFeaturedProducts = createAsyncThunk(
  "product/fetchFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`products/v2/featured`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch featured products");
    }
  }
);

// Async thunk for fetching new arrivals
export const fetchNewArrivals = createAsyncThunk(
  "product/fetchNewArrivals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`products/v2/new-arraivals`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch new arrivals");
    }
  }
);

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (
    params: {
      sub_category?: string | string[];
      min_price?: number;
      max_price?: number;
      size?: string;
      sort_by?: string;
      search?: string;
      page?: number;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.sub_category) {
        const subCategoryValue = Array.isArray(params.sub_category)
          ? params.sub_category.join(",")
          : params.sub_category;
        queryParams.set("subCategoryIds", subCategoryValue);
      }
      if (params.min_price) queryParams.set("minPrice", params.min_price.toString());
      if (params.max_price) queryParams.set("maxPrice", params.max_price.toString());
      if (params.size) queryParams.set("variations", params.size);
      if (params.sort_by) queryParams.set("sortBy", params.sort_by);
      if (params.search) queryParams.set("search", params.search);
      if (params.page) queryParams.set("page", params.page.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `products/v2?${queryString}` : "products/v2";

      const response = await axiosInstance.get(url);

      return response.data;
    } catch (error: any) {
      dispatch(resetProductList());
      let errorMessage = "Failed to fetch products information";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for fetching product details
export const fetchProductsDetails = createAsyncThunk(
  "product/fetchProductsDetails",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`products/details/${slug}`);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch products information");
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products information");
    }
  }
);

export const fetchSimilarProducts = createAsyncThunk(
  "product/fetchSimilarProducts",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`products/similar`, { params: { slug } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch similar products");
    }
  }
);

// Async thunk for fetching product categories
export const fetchProductCategories = createAsyncThunk(
  "product/fetchProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`products/categories`);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch product categories");
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product categories");
    }
  }
);

// Create the slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProductList(state) {
      state.product = null;
      state.featured = null;
      state.newArrivals = null;
    },
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    setProductCategories: (state, action) => {
      state.productCategories = action.payload?.data || [];
      state.loading = false;
      state.error = null;
    },
    setProductDetails: (state, action) => {
      state.productDetails = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload?.data ?? null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.product = null;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featured =
          action.payload.data ?? null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch featured products";
      })
      .addCase(fetchNewArrivals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.loading = false;
        state.newArrivals =
          action.payload.data ?? null;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch new arrivals";
      })
      .addCase(fetchProductsDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload?.data ?? null;
      })
      .addCase(fetchProductsDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch products information";
      })
      .addCase(fetchProductsVariations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsVariations.fulfilled, (state, action) => {
        state.loading = false;
        state.productVariations = (action.payload.data || []) as string[];
      })
      .addCase(fetchProductsVariations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.productVariations = [];
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload.data ?? null;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch similar products";
      })
      .addCase(fetchProductCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.productCategories = action.payload?.data ?? null;
        state.error = null;
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch product categories";
        state.productCategories = null;
      })
  },
});

export const {
  resetProductList,
  clearProductDetails,
  setProductDetails,
  setProductCategories,
} = productSlice.actions;

// Selector to get the product from state
const selectProduct = (state: RootState) => state.products.productDetails;

// Memoized selector to get gallery items (images + video) as array of URLs
export const selectProductGalleryItems = createSelector(
  [selectProduct],
  (product) => {
    if (!product) return [];

    const images = Array.isArray(product?.images)
      ? product.images.map((img: any) => img?.image).filter(Boolean)
      : [];
    const video = product?.video;
    const coverImage = product?.cover_image;

    const galleryItems = [...images];
    if (video) {
      galleryItems.push(video);
    }
    if (galleryItems.length === 0 && coverImage) {
      galleryItems.push(coverImage);
    }
    return galleryItems;
  }
);

export default productSlice.reducer;

