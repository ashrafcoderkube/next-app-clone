import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { PrivacyPolicyResponse, PrivacyPolicyState } from "../../types/privacyPolicy";

// Initial state
const initialState: PrivacyPolicyState = {
    privacyPolicy: null,
    loading: false,
    error: null,
};

// Async thunk for fetching privacy policy data
export const fetchPrivacyPolicy = createAsyncThunk<PrivacyPolicyResponse, void, { rejectValue: string }>(
    "privacyPolicy/fetchPrivacyPolicy",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<PrivacyPolicyResponse>("home/privacy");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch privacy policy data"
            );
        }
    }
);

// Create the slice
const privacyPolicySlice = createSlice({
    name: "privacyPolicy",
    initialState,
    reducers: {
        clearPrivacyPolicy: (state) => {
            state.privacyPolicy = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrivacyPolicy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrivacyPolicy.fulfilled, (state, action) => {
                state.loading = false;
                state.privacyPolicy = action.payload.data;
            })
            .addCase(fetchPrivacyPolicy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch privacy policy data";
            });
    },
});

export const { clearPrivacyPolicy } = privacyPolicySlice.actions;
export default privacyPolicySlice.reducer;

