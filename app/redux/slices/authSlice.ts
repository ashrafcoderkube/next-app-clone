import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { clearCart } from "./cartSlice";

// Types
interface User {
  customer?: {
    firstname?: string;
    lastname?: string;
    phone_number?: string;
    alt_phone_number?: string;
    email?: string;
    [key: string]: any;
  };
  email_verification_token?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sent: boolean;
  loginSent: boolean;
}

interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
}

interface LoginCredentials {
  // Define the structure based on your API requirements
  [key: string]: any;
}

interface OTPData {
  mobile: string;
  type: string;
}

interface VerifyOTPData {
  mobile: string;
  otp: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  sent: false,
  loginSent: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ data }: { data: RegisterData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/customer/register",
        data
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
      } else {
        const errorMessage =
          response?.data?.errors ||
          response?.data?.message ||
          "Something went wrong";

        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(errorMessage);

      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyRegisterOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (
    { otp, mobile }: { otp: string; mobile: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        "/auth/customer/register/verify",
        { otp, mobile }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const registerGuestUser = createAsyncThunk(
  "auth/register-guest",
  async ({ data }: { data: RegisterData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/customer/update-user-details",
        data
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    { credentials }: { credentials: LoginCredentials },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/customer/login", credentials);
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Login successful.");
      } else {
        toast.error(
          response?.data?.message ||
            "Please verify your email before logging in."
        );
      }
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        error.message ||
        "Login failed";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/auth/logout"
      );
      dispatch(logout());
      dispatch(clearCart());
      dispatch({ type: "RESET_APP" });
      if (response?.data?.success) {
        toast.success(response?.data?.message || "Logout successful");
      }
      return response.data;
    } catch (error: any) {
      dispatch(logout());
      dispatch(clearCart());
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const sendOTP = createAsyncThunk(
  "otp/send",
  async ({ mobile, type }: OTPData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/otp/send", {
        mobile,
        type,
      });

      if (response?.data?.success) {
        toast.success(`${response?.data?.data?.message}`, { autoClose: 4000 });
        return response.data;
      } else {
        toast.error(response?.data?.data?.message);
      }

      if (response?.data?.message?.includes("not registered")) {
        return rejectWithValue({
          userNotRegistered: true,
          message: response.data.message,
          mobile,
        });
      }

      return rejectWithValue({
        userNotRegistered: false,
        message: response?.data?.message || "Failed to send OTP",
        mobile,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue({
        userNotRegistered: false,
        message: error.response?.data?.message || error.message,
        mobile,
      });
    }
  }
);

export const sendLoginOTP = createAsyncThunk(
  "auth/sendLoginOTP",
  async (
    phone_number: { mobile: string; type: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        "/customer/resend-otp-register",
        {
          phone_number: phone_number.mobile,
          mobile: phone_number.mobile,
          type: phone_number.type,
        }
      );
      if (response?.data?.success) {
        toast.success(`${response?.data?.message}`, { autoClose: 4000 });
        return response.data;
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return rejectWithValue(error.response?.data || "Failed to send OTP");
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "otp/verify",
  async ({ mobile, otp }: VerifyOTPData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/otp/verify/checkout", {
        mobile,
        otp,
      });
      if (response?.data?.success) {
        toast.success(response?.data?.message || "OTP verified successfully");
      } else {
        toast.error(response?.data?.message || "Invalid OTP");
      }
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  }
);

export const verifyLoginOTP = createAsyncThunk(
  "otp/verifyLogin",
  async ({ mobile, otp }: VerifyOTPData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/otp/verify/login", {
        mobile,
        otp,
      });
      if (response?.data?.success) {
        toast.success(response?.data?.message || "OTP verified successfully");
      } else {
        toast.error(response?.data?.message || "Invalid OTP");
      }
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  }
);

export const updateCustomerDetails = createAsyncThunk(
  "auth/updateCustomerDetails",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/customer/user-details", data);
      if (response?.data?.success) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.message || "Failed to fetch customer details");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customer details");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      state.sent = false;
      state.loginSent = false;
    },
    updateCustomer: (state, action) => {
      const payload = action.payload;
      const customerData = payload.customer ? payload.customer : payload;
      state.user = {
        ...(state.user || {}),
        customer: {
          ...(state.user?.customer || {}),
          ...action.payload,
          ...customerData,
        },
      };
    },
    updateAccountDetailsSuccess: (state, action) => {
      if (state.user && state.user.customer) {
        state.user.customer.firstname = action.payload.firstname;
        state.user.customer.lastname = action.payload.lastname;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        // state.isAuthenticated = action.payload.data.email_verification_token
        //   ? false
        //   : true;
        if (state.user?.customer && !state.user.customer.alt_phone_number) {
          state.user.customer.alt_phone_number =
            state.user.customer.phone_number;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Register failed";
        state.isAuthenticated = false;
      })

      .addCase(verifyRegisterOTP.pending, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(verifyRegisterOTP.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.data;
      })
      .addCase(verifyRegisterOTP.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(registerGuestUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerGuestUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = action.payload.data.email_verification_token
          ? false
          : true;
        if (state.user?.customer && !state.user.customer.alt_phone_number) {
          state.user.customer.alt_phone_number =
            state.user.customer.phone_number;
        }
      })
      .addCase(registerGuestUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Register failed";
        state.isAuthenticated = false;
      })

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = action.payload.success ? true : false;
        if (state.user?.customer && !state.user.customer.alt_phone_number) {
          state.user.customer.alt_phone_number =
            state.user.customer.phone_number;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
        state.isAuthenticated = false;
      })

      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.sent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send OTP";
        state.sent = false;
      })
      .addCase(sendLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.loading = false;
        state.loginSent = true;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send OTP";
        state.loginSent = false;
      })

      .addCase(verifyOTP.pending, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.data;
        if (state.user?.customer && !state.user.customer.alt_phone_number) {
          state.user.customer.alt_phone_number =
            state.user.customer.phone_number;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(verifyLoginOTP.pending, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        if (state.user?.customer && !state.user.customer.alt_phone_number) {
          state.user.customer.alt_phone_number =
            state.user.customer.phone_number;
        }
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Logout failed";
      })
      .addCase(updateCustomerDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.user = {
            ...state.user,
            customer: {
              ...state.user?.customer,
              ...action.payload.data,
            },
          };
        }
      })
      .addCase(updateCustomerDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update customer details";
      })
  },
});

export const {
  logout,
  loginSuccess,
  updateCustomer,
  updateAccountDetailsSuccess,
} = authSlice.actions;
export default authSlice.reducer;
