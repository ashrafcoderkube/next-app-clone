"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { sendLoginOTP, sendOTP, verifyOTP } from "../../redux/slices/authSlice";
import { useRouter } from "next/navigation";
import LoadingButton from "../customcomponents/LoadingButton";
import { syncGuestCartItems } from "../../redux/slices/cartSlice";
import CustomInput from "../customcomponents/CustomInput";
import { RootState } from "../../redux/store";

const ModalComponent = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state: RootState) => state.auth);
  const { cartItems } = useAppSelector((state: RootState) => state.cart);

  const [step, setStep] = useState("phone");
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
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

  const handleContinue = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length === 10) {
      dispatch(sendOTP({ mobile: cleanNumber, type: "checkout" }))
        .unwrap()
        .then(() => {
          setStep("otp");
          setTimer(30);
        })
        .catch((err: any) => console.error("Failed to send OTP:", err));
    }
  };

  const handleConfirm = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      try {
        const cleanNumber = phoneNumber.replace(/\D/g, "");
        const res = await dispatch(
          verifyOTP({ mobile: cleanNumber, otp: otpValue })
        ).unwrap();

        if (res?.success) {
          const token = res?.data?.token;
          if (token && cartItems.length > 0) {
            dispatch(syncGuestCartItems({ token, cartItems }));
          }
          setStep("phone");
          setOtp(["", "", "", ""]);
        }
      } catch (error) {
        console.error("OTP verification failed:", error);
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    dispatch(sendLoginOTP({ mobile: cleanNumber, type: "checkout" }))
      .unwrap()
      .then(() => setTimer(30))
      .catch((err: any) => console.error("Failed to resend OTP:", err));
    setOtp(["", "", "", ""]);
  };

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // If current field is empty, move to previous field
        e.preventDefault();
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) prevInput.focus();
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
    <div>
      {step === "phone" ? (
        <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full">
          <div>
            <p className="mb-1 text-base xs:text-lg md:text-xl lg:text-2xl font-bold">
              Sign in or Create account.
            </p>
            <p className="mb-3 xs:mb-4 sm:mb-6 text-xs xs:text-sm sm:text-base lg:text-lg">
              Login or Create account with your phone number.
            </p>
          </div>

          {/* Phone Input */}
          <div className="mb-7 xs:mb-3 sm:mb-7">
            <CustomInput
              id="phone-number"
              type="tel"
              label="PHONE NUMBER"
              value={phoneNumber}
              variant={1}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                setPhoneNumber(numericValue.trimStart());
              }}
              placeholder="Enter your phone number"
              error={phoneNumber && !/^\d{10}$/.test(phoneNumber) && "Please enter a valid phone number"}
            />
          </div>

          <LoadingButton
            onClick={handleContinue}
            loading={loading}
            disabled={!phoneNumber || !/^\d{10}$/.test(phoneNumber)}
            text="Continue"
          />

          <p className="text-xs xs:text-sm sm:text-sm text-left">
            By signing in, you agree to our{" "}
            <button
              onClick={() => router.push("/terms-of-use")}
              className="underline font-medium hover:text-blue-800"
            >
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button
              onClick={() => router.push("/privacy-policy")}
              className="underline font-medium hover:text-blue-800"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-3 xs:space-y-4 sm:space-y-6 w-full">
          <div>
            <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-[2rem] font-bold text-gray-900 mb-2">
              Verify Your Phone Number
            </h2>
            <p className="mb-3 xs:mb-4 sm:mb-6 text-sm xs:text-base sm:text-lg text-left">
              Enter the verification code sent to{" "}
              <span className="font-bold">{phoneNumber}</span>
            </p>
          </div>

          <div className="flex flex-col justify-between h-full">
            {/* OTP Inputs */}
            <div>
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
                    inputClassName="text-center"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`OTP digit ${index + 1}`}
                    variant={1}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center gap-1 sm:gap-0">
                <button
                  onClick={handleResend}
                  disabled={timer > 0}
                  className={`underline text-xs xs:text-sm sm:text-sm ${
                    timer > 0
                      ? "cursor-not-allowed opacity-50 text-gray-500"
                      : "cursor-pointer hover:text-gray-900"
                  }`}
                >
                  {timer > 0 ? `RESEND IN ${timer}s` : "RESEND CODE"}
                </button>

                {timer > 0 && (
                  <span className="text-xs xs:text-sm sm:text-sm">
                    ({timer}s)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 xs:gap-3 sm:gap-[0.9879rem] mt-2">
              <LoadingButton
                onClick={handleConfirm}
                loading={loading}
                disabled={otp.join("").length !== 4}
                text="Confirm"
              />
              <button
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", ""]);
                }}
                className="w-full border border-[#000000] rounded-md sm:rounded-[0.625rem] py-2 xs:py-3 sm:py-4 uppercase font-medium text-sm xs:text-base"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalComponent;
