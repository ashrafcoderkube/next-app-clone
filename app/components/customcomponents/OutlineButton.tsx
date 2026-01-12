"use client";

import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface OutlineButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  outline?: boolean;
  paddingX?: string;
  paddingY?: string;
  height?: string;
  fontSize?: string;
}

const OutlineButton = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  outline = true,
  paddingX = "px-[1.5rem]",
  paddingY = "py-[0.9375rem]",
  height,
  fontSize = "text-base lg:text-lg",
  ...props
}: OutlineButtonProps) => {
  // Get theme data from ThemeContext (from storeInfo API)
  const themeContext = useTheme() || {};

  const buttonBgColor = themeContext?.buttonBackgroundColor;
  const buttonTxtColor = themeContext?.buttonTextColor;
  // Border color defaults to button background color, can be overridden
  const defaultBorderColor = buttonTxtColor;

  return (
    <button
      name={children?.toString()}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn border ${paddingX} ${paddingY} ${
        height || ""
      } ${fontSize} font-medium focus:outline-none items-center transition-all duration-500 ease-in-out ${
        outline ? "border" : ""
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      style={{
        color: buttonTxtColor,
        backgroundColor: buttonBgColor,
        borderColor: defaultBorderColor,
      }}
      // onMouseEnter={(e) => {
      //   if (!disabled) {
      //     e.currentTarget.style.backgroundColor = buttonBgColor;
      //     e.currentTarget.style.color = buttonTxtColor;
      //   }
      // }}
      // onMouseLeave={(e) => {
      //   if (!disabled) {
      //     e.currentTarget.style.backgroundColor = "transparent";
      //     e.currentTarget.style.color = buttonBgColor;
      //   }
      // }}
      {...props}
    >
      {children}
    </button>
  );
};

export default OutlineButton;

