import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { StoreInfoResponse } from "../../types/storeinfo";

// Define the initial state interface
interface StoreInfoState {
    storeInfo: StoreInfoResponse | null;
    loading: boolean;
    error: string | null;
    themeId: number;
    isWholesaler: boolean;
    wholesalerId: number | null;
}

// Initial state
const initialState: StoreInfoState = {
    storeInfo: null,
    loading: false,
    error: null,
    themeId: 1,
    isWholesaler: false,
    wholesalerId: null,
};

// Create the slice
const storeInfoSlice = createSlice({
    name: "storeInfo",
    initialState,
    reducers: {
        clearStoreInfo: (state) => {
            state.storeInfo = null;
            state.loading = false;
            state.error = null;
            state.isWholesaler = false;
            state.wholesalerId = null;
        },
        setThemeId: (state, action: PayloadAction<number>) => {
            state.themeId = action.payload;
        },
        setStoreInfo: (state, action: PayloadAction<StoreInfoResponse>) => {
            state.storeInfo = action.payload;
            state.isWholesaler = action.payload.data.storeinfo.retailer_id ? false : true;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { clearStoreInfo, setThemeId, setStoreInfo } = storeInfoSlice.actions;
export default storeInfoSlice.reducer;

