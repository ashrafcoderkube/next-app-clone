import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { HomeSectionResponse, HomeSectionState } from "../../types/homeSection";

// Initial state
const initialState: HomeSectionState = {
  homeSection: null,
  loading: false,
  error: null,
};

// Async thunk for fetching home section data
export const fetchHomeSection = createAsyncThunk<
  HomeSectionResponse,
  void,
  { rejectValue: string }
>("homeSection/fetchHomeSection", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<HomeSectionResponse>(
      "home/homeSection"
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch home section data"
    );
  }
});

// Create the slice
const homeSectionSlice = createSlice({
  name: "homeSection",
  initialState,
  reducers: {
    clearHomeSection: (state) => {
      state.homeSection = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeSection.fulfilled, (state, action) => {
        state.loading = false;
        state.homeSection = action.payload.data;
      })
      .addCase(fetchHomeSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch home section data";
      });
  },
});

export const { clearHomeSection } = homeSectionSlice.actions;
export default homeSectionSlice.reducer;
