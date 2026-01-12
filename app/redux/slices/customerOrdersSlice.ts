import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

interface CustomerOrdersState {
  orders: any;
  cancelOrder: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerOrdersState = {
  orders: {},
  cancelOrder: [],
  loading: false,
  error: null,
};

export const fetchCustomerOrders = createAsyncThunk(
  "customerOrders/fetchCustomerOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/customer/orders");
      if (response?.data?.success) {
        return response.data.data || [];
      } else {
        return rejectWithValue(
          response?.data?.message || "Failed to fetch orders"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders";

      return rejectWithValue(errorMessage);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "customerOrders/cancelOrder",
  async (data: any, { rejectWithValue, getState, dispatch }: any) => {
    const { auth } = getState();
    try {
      if (auth?.isAuthenticated) {
        const response = await axiosInstance.post(
          "/customer/orders/cancel",
          data
        );
        if (response?.data?.success) {
          toast.success(response?.data?.message || "Order cancelled successfully");
          dispatch(fetchCustomerOrders());
          return response.data;
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel order";
      return rejectWithValue(message);
    }
  }
);

const customerOrdersSlice = createSlice({
  name: "customerOrders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch orders";
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelOrder = action.payload || [];
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrders } = customerOrdersSlice.actions;
export default customerOrdersSlice.reducer;
