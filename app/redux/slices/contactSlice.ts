import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

// Types
interface ContactFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  subscribe: boolean;
}

interface ContactResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
}

interface ContactState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Initial state
const initialState: ContactState = {
  loading: false,
  error: null,
  success: false,
};

// Async thunk for submitting contact form
export const submitContactForm = createAsyncThunk<
  ContactResponse,
  ContactFormData,
  { rejectValue: string }
>("contact/submitContactForm", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<ContactResponse>(
      "home/contactRetailerEnquiry",
      formData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to submit contact form"
    );
  }
});

// Create the slice
const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Show success toast
        toast.success(
          action.payload.message || "Contact form submitted successfully!"
        );
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to submit contact form";
        state.success = false;
        // Show error toast
        toast.error(action.payload || "Failed to submit contact form");
      });
  },
});

export const { clearContactState } = contactSlice.actions;
export default contactSlice.reducer;
