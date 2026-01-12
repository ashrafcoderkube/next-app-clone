import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { TermsOfUseResponse, TermsOfUseState } from "../../types/termsOfUse";

// Initial state
const initialState: TermsOfUseState = {
    termsOfUse: null,
    loading: false,
    error: null,
};

// Async thunk for fetching terms of use data
export const fetchTermsOfUse = createAsyncThunk<TermsOfUseResponse, void, { rejectValue: string }>(
    "termsOfUse/fetchTermsOfUse",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<TermsOfUseResponse>("home/terms");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch terms of use data"
            );
        }
    }
);

// Create the slice
const termsOfUseSlice = createSlice({
    name: "termsOfUse",
    initialState,
    reducers: {
        clearTermsOfUse: (state) => {
            state.termsOfUse = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTermsOfUse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTermsOfUse.fulfilled, (state, action) => {
                state.loading = false;
                state.termsOfUse = action.payload.data;
            })
            .addCase(fetchTermsOfUse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch terms of use data";
            });
    },
});

export const { clearTermsOfUse } = termsOfUseSlice.actions;
export default termsOfUseSlice.reducer;

