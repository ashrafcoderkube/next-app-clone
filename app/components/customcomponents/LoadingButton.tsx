"use client";

import { useTheme } from "@/app/contexts/ThemeContext";

interface LoadingButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  text?: string;
  fullWidth?: boolean;
  BorderRadius?: boolean;
  buttonColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}
const LoadingButton = ({
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  className = "",
  text = "",
  fullWidth = true,
  BorderRadius = false,
  buttonColor = "black",
  backgroundColor,
  textColor: customTextColor,
  borderColor: customBorderColor,
}: LoadingButtonProps) => {
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;

  // Use custom colors if provided, otherwise use theme defaults
  const finalBackgroundColor = backgroundColor || themeContext?.buttonBackgroundColor;
  const finalTextColor = customTextColor || (buttonColor === "white" ? "#000000" : "#ffffff");
  const finalBorderColor = customBorderColor || `${textColor}2A`;

  // Loader color: use currentColor to inherit text color, or fallback to buttonColor prop
  const loaderColor = customTextColor ? "" : (buttonColor === "white" ? "text-black" : "text-white");

  return (
    <button
      name={text?.toString()}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? "w-full" : "max-md:w-auto grow"
        } btn border px-6 py-3.5 font-medium max-md:text-[0.8125rem] text-base hover:bg-opacity-90 transition-all duration-300 flex justify-center items-center cursor-pointer ${BorderRadius ? "rounded-r-sm" : "rounded-[0.625rem]" } disabled:!cursor-not-allowed ${loading || disabled ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      style={{
        backgroundColor: finalBackgroundColor,
        color: finalTextColor,
        borderColor: finalBorderColor,
      }}
    >
      {loading ? (
        <>
          <svg
            className={`animate-spin -ml-1 mr-3 h-5 w-5 ${loaderColor || "text-current"}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {text}...
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default LoadingButton;
