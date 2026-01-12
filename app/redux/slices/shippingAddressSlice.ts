import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { updateCustomer } from "./authSlice";

interface ShippingAddressState {
  shippingAddress: any;
  openAddressForm: boolean;
  selectedAddressForEdit: any;
  loading: boolean;
  error: string | null;
  stateandcity: any;
}

const initialState: ShippingAddressState = {
  shippingAddress: null,
  openAddressForm: false,
  selectedAddressForEdit: null,
  loading: false,
  error: null,
  stateandcity: null,
};

export const postShippingAddress = createAsyncThunk(
  "shippingAddress/postShippingAddress",
  async (data: any, { rejectWithValue, dispatch }: any) => {
    try {
      const response = await axiosInstance.post(
        "/customer/shipping-address",
        data
      );
      if (response?.data?.success) {
        dispatch(updateCustomer(response?.data?.data));
        dispatch(getShippingAddress());
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save shipping address"
      );
    }
  }
);

export const getstateandcity = createAsyncThunk(
  "shippingAddress/getstateandcity",
  async (pincode: string, { rejectWithValue }: any) => {
    try {
      const response = await axiosInstance.post("customer/state-city-by-pincode", { pincode });
      if (response?.data?.success) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.message || "Failed to get state and city");
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to get state and city");
    }
  }
);

export const getShippingAddress = createAsyncThunk(
  "shippingAddress/getShippingAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/customer/shipping-details"
      );
      return response.data.data.shippingDetails;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping address"
      );
    }
  }
);

export const addShippingAddress = createAsyncThunk(
  "shippingAddress/addShippingAddress",
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await axiosInstance.post("/customer/shipping-address", data);
      if (response?.data?.success) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.message || "Failed to add shipping address");
      }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to add shipping address");
    }
  }
);

export const updateShippingAddress = createAsyncThunk(
  "shippingAddress/updateShippingAddress",
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await axiosInstance.post("/customer/shipping-address", data);
      if (response?.data?.success) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.message || "Failed to update shipping address");
      }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update shipping address");
    }
  }
);

export const deleteShippingAddress = createAsyncThunk(
  "shippingAddress/deleteShippingAddress",
  async (address_id: any, { rejectWithValue, dispatch }: any) => {
    try {
      const response = await axiosInstance.delete(`/customer/shipping-address/${address_id}`);
      if (response?.data?.success) {
        dispatch(updateCustomer(response?.data?.data));
        dispatch(getShippingAddress());
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete shipping address"
      );
    }
  }
);

const shippingAddressSlice = createSlice({
  name: "shippingAddress",
  initialState,
  reducers: {
    clearShippingAddress: (state) => {
      state.shippingAddress = null;
      state.loading = false;
      state.error = null;
    },
    setOpenAddressForm: (state, action) => {
      state.openAddressForm = action.payload;
    },
    setSelectedAddressForEdit: (state, action) => {
      state.selectedAddressForEdit = action.payload;
    },
    clearStateAndCity: (state) => {
      state.stateandcity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload;
      })
      .addCase(postShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to save shipping address";
      })
      .addCase(getShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload;
      })
      .addCase(getShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch shipping address";
      })
      .addCase(addShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload?.data;
      })
      .addCase(addShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to add shipping address";
      })
      .addCase(updateShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload?.data;
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update shipping address";
      })
      .addCase(deleteShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload?.data;
      })
      .addCase(deleteShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to delete shipping address";
      })
      .addCase(getstateandcity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getstateandcity.fulfilled, (state, action) => {
        state.loading = false;
        state.stateandcity = action.payload?.data;
      })
      .addCase(getstateandcity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to get state and city";
      });
  },
});

export const { clearShippingAddress, setOpenAddressForm, setSelectedAddressForEdit, clearStateAndCity } = shippingAddressSlice.actions;
export default shippingAddressSlice.reducer;
