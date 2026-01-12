import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

interface AddressState {
  loading: boolean;
  success: boolean;
  error: string | null;
  states: any[];
  cities: any;
}

const initialState: AddressState = {
  loading: false,
  success: false,
  error: null,
  states: [],
  cities: {},
};

export const fetchStates = createAsyncThunk(
  "address/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("customer/states");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchCities = createAsyncThunk(
  "address/fetchCities",
  async ({ state_id }: { state_id: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("customer/cities-by-state", {
        state_id: state_id,
      });
      return { data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    resetAddressState: (state) => {
      state.loading = false;
      state.states = [];
      state.cities = {};
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.states = action.payload?.data || [];
      })
      .addCase(fetchStates.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch states";
      })
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Store cities by state name for easy access
        state.cities = action.payload?.data?.data || [];
      })
      .addCase(fetchCities.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch cities";
      });
  },
});

export const { resetAddressState } = addressSlice.actions;
export default addressSlice.reducer;
