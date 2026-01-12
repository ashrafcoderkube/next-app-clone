import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import {
  AboutSectionResponse,
  AboutSectionState,
} from "../../types/aboutSection";

// Initial state
const initialState: AboutSectionState = {
  aboutSection: null,
  loading: false,
  error: null,
};

// Async thunk for fetching about section data
export const fetchAboutSection = createAsyncThunk<
  AboutSectionResponse,
  void,
  { rejectValue: string }
>("aboutSection/fetchAboutSection", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<AboutSectionResponse>(
      "home/aboutUs"
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch about section data"
    );
  }
});

// Create the slice
const aboutSectionSlice = createSlice({
  name: "aboutSection",
  initialState,
  reducers: {
    clearAboutSection: (state) => {
      state.aboutSection = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutSection.fulfilled, (state, action) => {
        state.loading = false;
        state.aboutSection = action.payload.data;
      })
      .addCase(fetchAboutSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch about section data";
      });
  },
});

export const { clearAboutSection } = aboutSectionSlice.actions;
export default aboutSectionSlice.reducer;
