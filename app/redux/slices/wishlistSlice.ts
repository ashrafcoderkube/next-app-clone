import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

interface WishlistState {
  wishlist: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

export const fetchWishList = createAsyncThunk(
  "wishlist/fetchWishList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/customer/wishlist");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

export const addToWishListData = createAsyncThunk(
  "wishlist/addToWishListData",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/customer/wishlist",
        data
      );
      if (response?.data?.success) {
        dispatch(fetchWishList());
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

export const removeFromWishList = createAsyncThunk(
  "wishlist/removeFromWishList",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/customer/wishlist",
        data
      );
      if (response?.data?.success) {
        dispatch(fetchWishList());
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishList.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch wishlist";
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

