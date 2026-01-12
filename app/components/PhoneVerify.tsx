"use client";

import React, { useState, useEffect } from "react";
import { sendOTP, verifyOTP } from "../redux/slices/authSlice";
import LoadingButton from "./customcomponents/LoadingButton";
import { syncGuestCartItems } from "../redux/slices/cartSlice";
import CustomInput from "./customcomponents/CustomInput";
import { useTheme } from "../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";

export const PhoneVerify = () => {
  const dispatch = useAppDispatch();
  const { loading, verificationLoading } = useAppSelector((state: RootState) => state.auth);
  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const themeContext = useTheme() || {};

  const [showForm, setShowForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 3) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    } else if (value.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
    } else if (value.length > 1) {
      return;
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 4) {
      setOtp(paste.split(""));
      setTimeout(() => {
        document.getElementById("otp-input-3")?.focus();
      }, 0);
    }
  };

  const handleContinue = async () => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length === 10) {
      const mobile = cleanNumber;
      const type = "checkout";
      try {
        dispatch(sendOTP({ mobile, type }))
        setShowForm(true);
        setTimer(30);
      } catch (error) {
        console.error("Failed to send OTP:", error);
      }
    }
  };

  const handleConfirm = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      try {
        const cleanNumber = phoneNumber.replace(/\D/g, "");
        const phone_number =
          cleanNumber.length === 10 ? `${cleanNumber}` : cleanNumber;

        const res = await dispatch(
          verifyOTP({ mobile: phone_number, otp: otpValue })
        ).unwrap();

        if (res?.success) {
          setShowForm(false);
          // if (res?.data?.is_existing_customer) {
          const token = res?.data?.token;
          if (token && cartItems.length > 0) {
            dispatch(syncGuestCartItems({ token, cartItems }));
          }
          // }
          modalClose();
        }
      } catch (error) {
        console.error("OTP verification failed:", error);
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const mobile = cleanNumber.length === 10 ? `${cleanNumber}` : cleanNumber;
    try {
      await dispatch(sendOTP({ mobile, type: "checkout" })).unwrap();
      setTimer(30);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
    setOtp(["", "", "", ""]);
    setTimer(30);
  };

  useEffect(() => {
    if (!showForm || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showForm, timer]);

  const modalClose = () => {
    setPhoneNumber("");
    setOtp(["", "", "", ""]);
    setShowForm(false);
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // If current field is empty, move to previous field
        e.preventDefault();
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      } else if (otp[index] !== "") {
        // If current field has value, clear it and stay in the field
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

  return (
    <div className="mb-2 card-border">
      <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full ">
        <div className="mb-4 xs:mb-3 sm:mb-4">
          <CustomInput
            id="phone-number"
            type="tel"
            label="Phone Number"
            value={phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              setPhoneNumber(numericValue.trimStart());
            }}
            disabled={phoneNumber && showForm}
            placeholder={
              phoneNumber && showForm ? phoneNumber : "Enter your phone number"
            }
            error={
              phoneNumber && !/^\d{10}$/.test(phoneNumber)
                ? "Please enter a valid phone number"
                : ""
            }
            inputClassName={`form-control ${
              phoneNumber && showForm ? "bg-gray-100" : ""
            }`}
            aria-describedby="phone-error"
            // size="lg"
          />
          {showForm && (
            <div className="flex justify-end mt-1">
              <button
                name="Change Number"
                onClick={modalClose}
                className="underline text-xs xs:text-sm sm:text-sm cursor-pointer"
              >
                Change Number
              </button>
            </div>
          )}
        </div>
        {!showForm && (
          <LoadingButton
            onClick={handleContinue}
            loading={loading}
            disabled={!phoneNumber || !/^\d{10}$/.test(phoneNumber)}
            text="Continue"
            fullWidth={true}
            backgroundColor={themeContext?.buttonBackgroundColor}
            textColor={themeContext?.buttonTextColor}
            borderColor={themeContext?.buttonBorderColor}
          />
        )}
      </div>
      {showForm && (
        <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:gap-4 mb-2">
                {otp.map((digit, index) => (
                  <CustomInput
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onPaste={handleOtpPaste}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    inputClassName="text-center form-control px-1 xs:px-2 sm:px-4 py-2 sm:py-[0.82rem]"
                    inputMode="numeric"
                    aria-label={`OTP digit ${index + 1}`}
                    noDefaultPadding={true}
                    className="w-full"
                  />
                ))}
              </div>
              <div className="flex justify-between items-center gap-1 sm:gap-0">
                <button
                  onClick={handleResend}
                  disabled={timer > 0}
                  className={`w-auto whitespace-nowrap xs:w-auto underline text-xs xs:text-sm sm:text-sm ${
                    timer > 0
                      ? "cursor-not-allowed opacity-50 text-gray-500"
                      : "cursor-pointer hover:opacity-100 text-gray-900"
                  }`}
                >
                  <span className="block w-full text-left link-class">
                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                  </span>
                </button>

                {timer > 0 && (
                  <span className="block w-full xs:w-auto text-right text-xs xs:text-sm sm:text-sm">
                    ({timer}s)
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 xs:gap-3 sm:gap-[0.9879rem] mt-2">
              <LoadingButton
                onClick={handleConfirm}
                loading={verificationLoading}
                disabled={otp.join("").length !== 4}
                text="Confirm"
                fullWidth={true}
                backgroundColor={themeContext?.buttonBackgroundColor}
                textColor={themeContext?.buttonTextColor}
                borderColor={themeContext?.buttonBorderColor}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
