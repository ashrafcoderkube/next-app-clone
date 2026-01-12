"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import CustomInput from "../components/customcomponents/CustomInput";
import LoadingButton from "../components/customcomponents/LoadingButton";
import { registerUser, verifyRegisterOTP } from "../redux/slices/authSlice";
import { SignupSchema } from "../utils/validation";
import { syncGuestCartItems } from "../redux/slices/cartSlice";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone_number: "",
  terms: false,
};

export default function SignUp() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor } = themeContext;
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);
  const { loading, verificationLoading } = useAppSelector((state: RootState) => state.auth);
  const { cartItems } = useAppSelector((state: RootState) => state.cart);

  const formik = useFormik({
    initialValues,
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      const payload = {
        firstname: values.firstName,
        lastname: values.lastName,
        email: values.email,
        mobile: values.phone_number,
      };
      try {
        const res = await dispatch(registerUser({ data: payload })).unwrap();
        if (res?.success) {
          setPhoneNumber(values.phone_number);
          setIsOtpSent(true);
          setTimer(30);
        }
      } catch (error) {
        console.error("Sign up failed:", error);
      }
    },
  });

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    } else if (value.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 4) {
      setOtp(paste.split(""));
      setTimeout(() => {
        const lastInput = document.getElementById("otp-input-3");
        if (lastInput) lastInput.focus();
      }, 0);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const phone_number = cleanNumber.length === 10 ? cleanNumber : "";
    try {
      // const res = await dispatch(sendLoginOTP(phone_number)).unwrap();
      // if (res?.success) {
      //   setOtp(["", "", "", ""]);
      //   setTimer(30);
      // }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        e.preventDefault();
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const otpValue = otp.join("");
      if (otpValue.length === 4) {
        handleConfirm();
      }
    }
  };

  const handleConfirm = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      try {
        const cleanNumber = phoneNumber.replace(/\D/g, "");
        const phone_number = cleanNumber.length === 10 ? cleanNumber : "";
        const res = await dispatch(
          verifyRegisterOTP({ mobile: phone_number, otp: otpValue })
        ).unwrap();
        if (res?.success) {
          if (res?.data?.is_existing_customer) {
            const token = res?.data?.token;
            if (token && cartItems.length > 0) {
              dispatch(syncGuestCartItems({ token, cartItems }));
            }
          }
          router.push("/");
        }
      } catch (error) {
        console.error("OTP verification failed:", error);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  return (
    <div>

      {isOtpSent ? (
        <div className="px-container py-50-padding">
          <div
            className="max-w-[37.5rem] mx-auto text-left form-box"
            style={{
              backgroundColor:
                themeId === 4 || themeId === 5 || themeId === 6
                  ? themeId === 6
                    ? "#f0fdf4"
                    : themeContext?.bottomFooterBackgroundColor || ""
                  : "",
              color:
                themeId === 4 || themeId === 5 || themeId === 6
                  ? themeId === 6
                    ? "#1e293b"
                    : bottomFooterTextColor || "#111111"
                  : "",
            }}
          >
            <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full">
              <div className="mb-2 xs:mb-3 sm:mb-6">
                <CustomInput
                  label="Phone Number"
                  id="phone-number"
                  type="tel"
                  size="lg"
                  value={phoneNumber}
                  disabled={true}
                  placeholder="Enter your phone number"
                  helperText={
                    phoneNumber && !/^\d{10}$/.test(phoneNumber)
                      ? "Please enter a valid 10-digit phone number"
                      : ""
                  }
                  aria-describedby="phone-error"
                />
              </div>

              {isOtpSent && (
                <div className="flex flex-col justify-between h-full">

                  <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:gap-4 mb-2">
                    {otp.map((digit, index) => (
                      <CustomInput
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={handleOtpPaste}
                        inputClassName="px-1 xs:px-2 sm:px-4 py-2 sm:py-[0.82rem] text-center form-control border-[#AAAAAA]"
                        noDefaultPadding={true}
                        inputMode="numeric"
                        maxLength={1}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-1 sm:gap-0 mb-3">
                    <button
                      onClick={handleResend}
                      className={`w-auto whitespace-nowrap xs:w-auto underline text-xs xs:text-sm sm:text-sm ${timer > 0
                        ? "cursor-not-allowed opacity-50 text-gray-500"
                        : "cursor-pointer hover:opacity-100 text-gray-900"
                        }`}
                      disabled={timer > 0}
                    >
                      <span className="block w-full text-left ">
                        {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                      </span>
                    </button>
                    {/* {timer > 0 && (
                        <span className="block w-full xs:w-auto text-right text-xs xs:text-sm sm:text-sm">
                          ({timer}s)
                        </span>
                      )} */}
                  </div>

                  <div className="flex flex-col gap-2 xs:gap-3 sm:gap-[0.9879rem] mt-2">
                    <LoadingButton
                      onClick={handleConfirm}
                      loading={verificationLoading}
                      disabled={otp.join("").length !== 4}
                      text="Confirm"
                    />
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/signin"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-container py-50-padding">
          <div
            className="max-w-[37.5rem] mx-auto text-left form-box"
            style={{
              backgroundColor:
                themeId === 4 || themeId === 5 || themeId === 6
                  ? themeId === 6
                    ? "#f0fdf4"
                    : themeContext?.bottomFooterBackgroundColor || ""
                  : "",
              color:
                themeId === 4 || themeId === 5 || themeId === 6
                  ? themeId === 6
                    ? "#1e293b"
                    : bottomFooterTextColor || "#111111"
                  : "",
            }}
          >
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CustomInput
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.firstName && formik.errors.firstName
                      ? formik.errors.firstName
                      : ""
                  }
                  required
                />
                <CustomInput
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.lastName && formik.errors.lastName
                      ? formik.errors.lastName
                      : ""
                  }
                  required
                />
              </div>

              <CustomInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : ""
                }
                required
              />

              <CustomInput
                id="phone_number"
                name="phone_number"
                type="tel"
                label="Phone Number"
                placeholder="Enter your 10-digit phone number"
                value={formik.values.phone_number}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, "");
                  formik.setFieldValue("phone_number", numericValue);
                }}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.phone_number && formik.errors.phone_number
                    ? formik.errors.phone_number
                    : ""
                }
                required
              />

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formik.values.terms}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="terms"
                    className="font-medium text-gray-700"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-primary hover:text-primary-dark hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-primary hover:text-primary-dark hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                  {formik.touched.terms && formik.errors.terms && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.terms}
                    </p>
                  )}
                </div>
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!formik.isValid || !formik.dirty}
                className="w-full py-3 text-white bg-primary rounded-md hover:bg-primary-dark"
                text="Create Account"
              />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/signin"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
