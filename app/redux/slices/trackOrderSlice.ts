import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// Define the track order state interface
interface TrackOrderState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: any | null;
  openOrderDetail: boolean;
  order: any | null;
}

// Initial state
const initialState: TrackOrderState = {
  loading: false,
  success: false,
  error: null,
  data: null,
  openOrderDetail: false,
  order: null,
};

// Async thunk for fetching track order
export const fetchTrackOrder = createAsyncThunk(
  "trackOrder/fetchTrackOrder",
  async (track_no: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("trackOrder", {
        track_no,
      });
      if(response?.data?.success) {
        toast.success(response?.data?.message || "Order tracking information retrieved successfully");
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const trackOrderSlice = createSlice({
  name: "trackOrder",
  initialState,
  reducers: {
    resetTrackOrderState: (state) => {
      state.loading = false;
      state.data = null;
      state.success = false;
      state.error = null;
    },
    openOrderPopup: (state, action) => {
      state.openOrderDetail = true;
      state.order = action.payload;
    },
    closeOrderPopup: (state) => {
      state.openOrderDetail = false;
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchTrackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(fetchTrackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTrackOrderState, openOrderPopup, closeOrderPopup } = trackOrderSlice.actions;
export default trackOrderSlice.reducer;

