import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { clearCart } from "./cartSlice";
import { loginSuccess, updateCustomer } from "./authSlice";

interface BuyNowProduct {
  quantity: number;
  product_name?: string;
  images?: string[] | string;
  product_stock?: number;
  wishlist_id?: number | null;
  final_price?: string;
  retailer_id?: number;
  wholesaler_id?: number;
  id?: number | string;
  product_slug?: string;
  selected_variant?: {
    id: number | string;
    variation: string;
    final_price: number;
    stock: number;
  } | null;
}

interface CheckoutState {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string;
  discount: any;
  discountLoading: boolean;
  discountError: string | null;
  checkoutLoading: boolean;
  checkoutError: string | null;
  order_id: any[];
  buyNowProduct: BuyNowProduct | null;
  buyNowQuantity: number;
  isBuyNowMode: boolean;
  coupons: any[];
  couponsLoading: boolean;
  couponsError: string | null;
}

const initialState: CheckoutState = {
  loading: false,
  success: false,
  error: null,
  message: "",
  discount: null,
  discountLoading: false,
  discountError: null,
  checkoutLoading: false,
  checkoutError: null,
  order_id: [],
  buyNowProduct: null,
  buyNowQuantity: 1,
  isBuyNowMode: false,
  coupons: [],
  couponsLoading: false,
  couponsError: null,
};

export const performCheckout = createAsyncThunk(
  "checkout/performCheckout",
  async (
    { payload, navigate, isBuyNowMode }: { payload: any; navigate: any; isBuyNowMode: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/customer/checkout", payload);
      if (response?.data?.success || response?.data?.status) {
        dispatch(discountSuccess(null));
        // dispatch(loginSuccess(response?.data?.data));
        dispatch(updateCustomer(response?.data?.data?.customer));
        toast.success(response?.data?.message);
        if (!isBuyNowMode) {
          dispatch(clearCart());
        }
        navigate.push("/order-success", { replace: true });
        return response.data;
      } else {
        if (
          Array.isArray(response?.data?.message) &&
          response?.data?.message?.length
        ) {
          response.data.message.forEach((err: string) => toast.error(err));
        } else {
          toast.error(response?.data?.message || "Checkout failed");
        }
        return rejectWithValue(
          response?.data || { message: "Checkout failed" }
        );
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong during checkout"
      );
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong during checkout",
        }
      );
    }
  }
);

export const performWholesalerCheckout = createAsyncThunk(
  "checkout/performWholesalerCheckout",
  async (
    { payload, navigate, isBuyNowMode }: { payload: any; navigate: any; isBuyNowMode: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/customer/checkout/wholesaler", payload);
      if (response?.data?.success || response?.data?.status) {
        // dispatch(discountSuccess(null));
        // dispatch(loginSuccess(response?.data?.data));
        dispatch(updateCustomer(response?.data?.data?.customer));
        toast.success(response?.data?.message);
        if (!isBuyNowMode) {
          dispatch(clearCart());
        }
        navigate.push("/order-success", { replace: true });
        return response.data;
      } else {
        if (
          Array.isArray(response?.data?.message) &&
          response?.data?.message?.length
        ) {
          response.data.message.forEach((err: string) => toast.error(err));
        } else {
          toast.error(response?.data?.message || "Checkout failed");
        }
        return rejectWithValue(
          response?.data || { message: "Checkout failed" }
        );
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong during checkout"
      );
      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong during checkout",
        }
      );
    }
  }
);

export const getCoupon = createAsyncThunk(
  "checkout/getCoupon",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("customer/coupons", payload);
      if (response?.data?.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch coupons"
        );
      }
    } catch (error: any) {
      console.error("Get coupon error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons"
      );
    }
  }
);

export const applyDiscount = createAsyncThunk(
  "checkout/applyDiscount",
  async (args: { payload: any; setFieldError: (field: string, message: string) => void }, { rejectWithValue }) => {
    const { payload, setFieldError } = args;
    try {
      const response = await axiosInstance.post("customer/coupons/apply", payload);
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        return response?.data?.data;
      } else {
        const errorMessage = response?.data?.message || "Invalid Code";
        setFieldError("coupon_code", errorMessage);
        return rejectWithValue({ message: errorMessage });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
      return rejectWithValue({ message: errorMessage });
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    discountSuccess: (state, action: PayloadAction<any>) => {
      state.discount = action.payload;
      state.discountLoading = false;
      state.discountError = null;
    },
    clearDiscount: (state) => {
      state.discount = null;
      state.discountError = null;
    },
    clearCheckoutState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
      state.checkoutLoading = false;
      state.checkoutError = null;
    },
    setBuyNowProduct: (state, action: PayloadAction<{ product: BuyNowProduct; quantity: number }>) => {
      state.buyNowProduct = action.payload.product;
      state.buyNowQuantity = action.payload.quantity;
      state.isBuyNowMode = true;
    },
    clearBuyNowProduct: (state) => {
      state.buyNowProduct = null;
      state.buyNowQuantity = 1;
      state.isBuyNowMode = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performCheckout.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(performCheckout.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.order_id = action.payload.data.order_id;
        state.success = true;
        state.message = action.payload?.message || "Order placed successfully";
      })
      .addCase(performCheckout.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError =
          (action.payload as any)?.message || "Failed to place order";
      })
      .addCase(performWholesalerCheckout.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(performWholesalerCheckout.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.order_id = action.payload.data.order_id;
        state.success = true;
        state.message = action.payload?.message || "Order placed successfully";
      })
      .addCase(performWholesalerCheckout.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError =
          (action.payload as any)?.message || "Failed to place order";
      })
      .addCase(applyDiscount.pending, (state) => {
        state.discountLoading = true;
        state.discountError = null;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.discountLoading = false;
        state.discount = action.payload;
      })
      .addCase(applyDiscount.rejected, (state, action) => {
        state.discountLoading = false;
        state.discountError =
          (action.payload as any)?.message || "Failed to apply discount";
      })
      // .addCase(applyDiscountwithoutLogin.pending, (state) => {
      //   state.discountLoading = true;
      //   state.discountError = null;
      // })
      // .addCase(applyDiscountwithoutLogin.fulfilled, (state, action) => {
      //   state.discountLoading = false;
      //   state.discount = action.payload;
      // })
      // .addCase(applyDiscountwithoutLogin.rejected, (state, action) => {
      //   state.discountLoading = false;
      //   state.discountError =
      //     (action.payload as any)?.message || "Failed to apply discount";
      // })
      .addCase(getCoupon.pending, (state) => {
        state.couponsLoading = true;
        state.couponsError = null;
      })
      .addCase(getCoupon.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.coupons = action.payload.data;
      })
      .addCase(getCoupon.rejected, (state, action) => {
        state.couponsLoading = false;
        state.couponsError =
          (action.payload as any)?.message || "Failed to fetch coupons";
      });
  },
});

export const {
  discountSuccess,
  clearDiscount,
  clearCheckoutState,
  setBuyNowProduct,
  clearBuyNowProduct,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;

