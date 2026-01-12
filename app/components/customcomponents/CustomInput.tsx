"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import React, { forwardRef } from "react";

interface CustomInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label?: string;
  type?: string;
  id?: string;
  placeholder?: string;
  iconName?: string;
  iconPosition?: "left" | "right";
  leftIcon?: React.ComponentType;
  rightIcon?: React.ComponentType;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: 1 | 2 | 3 | 4 | 5; // Design variant: 1, 2, 3, 4, 5 (if not provided, defaults to 1)
  className?: string;
  inputClassName?: string; // Additional classes for the input element
  noDefaultPadding?: boolean; // Skip default padding (useful for OTP inputs)
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Map themeId to input variant
const getVariantFromTheme = (themeId: number): number => {
  const themeVariantMap: Record<number, number> = {
    1: 1, // Theme1 → Variant 1: Rounded + Bordered + No Background
    2: 2, // Theme2 → Variant 2: Rounded + Background (no border)
    3: 3, // Theme3 → Variant 3: Rounded + Background (no border)
    4: 4, // Theme4 → Variant 4: Rounded + Bordered + No Background
    5: 5, // Theme5 → Variant 5: Bordered (no background, no border)
  };
  return themeVariantMap[themeId] || 1; // Default to variant 1
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      type = "text",
      id,
      placeholder = "",
      iconName,
      iconPosition = "left",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      helperText,
      error,
      disabled,
      size = "lg",
      variant, // Design variant: 1, 2, 3, 4, 5 (if not provided, uses theme-based variant)
      className = "",
      inputClassName = "", // Additional classes for the input element
      noDefaultPadding = false, // Skip default padding (useful for OTP inputs)
      onChange,
      ...props
    },
    ref
  ) => {
    const { themeId } = useAppSelector((state: RootState) => state.storeInfo);
    const themeContext = useTheme() || {};
    const { textColor } = themeContext;
    // Use provided variant or get variant from theme
    const inputVariant = variant !== undefined ? variant : getVariantFromTheme(themeId);
    const hasIcon = !!iconName;
    const hasLeftIcon = !!LeftIcon;
    const hasRightIcon = !!RightIcon;

    // Size configurations
    const sizeConfig = {
      sm: {
        padding: "px-3 py-1.5",
        paddingIcon: "pl-9",
        paddingIconRight: "pr-9",
        text: "text-sm",
        icon: "w-4 h-4",
        iconPadding: "pl-3",
        iconPaddingRight: "pr-3",
      },
      md: {
        padding: "px-4 py-2.5",
        paddingIcon: "pl-10",
        paddingIconRight: "pr-10",
        text: "text-sm",
        icon: "w-5 h-5",
        iconPadding: "pl-3.5",
        iconPaddingRight: "pr-3.5",
      },
      lg: {
        padding: "px-5 py-3",
        paddingIcon: "pl-12",
        paddingIconRight: "pr-12",
        text: "text-base",
        icon: "w-5 h-5",
        iconPadding: "pl-4",
        iconPaddingRight: "pr-4",
      },
      xl: {
        padding: "px-6 py-4",
        paddingIcon: "pl-14",
        paddingIconRight: "pr-14",
        text: "text-lg",
        icon: "w-6 h-6",
        iconPadding: "pl-5",
        iconPaddingRight: "pr-5",
      },
    };

    const sizeStyle = sizeConfig[size] || sizeConfig.md;

    // Get padding based on icon position
    const getPadding = () => {
      let paddingClass = sizeStyle.padding;
      if ((hasIcon && iconPosition === "left") || hasLeftIcon) {
        paddingClass = `${sizeStyle.paddingIcon} py-${
          size === "sm"
            ? "1.5"
            : size === "lg"
            ? "3"
            : size === "xl"
            ? "4"
            : "2.5"
        }`;
      }
      if ((hasIcon && iconPosition === "right") || hasRightIcon) {
        paddingClass = `${
          sizeStyle.padding.split(" ")[0]
        } ${sizeStyle.paddingIconRight.replace("pr", "pe")} py-${
          size === "sm"
            ? "1.5"
            : size === "lg"
            ? "3"
            : size === "xl"
            ? "4"
            : "2.5"
        }`;
      }
      if (
        ((hasIcon && iconPosition === "left") || hasLeftIcon) &&
        ((hasIcon && iconPosition === "right") || hasRightIcon)
      ) {
        paddingClass = `${
          sizeStyle.paddingIcon
        } ${sizeStyle.paddingIconRight.replace("pr", "pe")} py-${
          size === "sm"
            ? "1.5"
            : size === "lg"
            ? "3"
            : size === "xl"
            ? "4"
            : "2.5"
        }`;
      }
      return paddingClass;
    };

    // Get variant-specific className
    const getVariantClassName = () => {
      const paddingClass = noDefaultPadding ? "" : getPadding();
      const baseClasses = `w-full transition-all duration-200 ${paddingClass} ${sizeStyle.text}`;

      // Variants 1-3: Bordered styles
      if (inputVariant === 1) {
        return `
        ${baseClasses}
        border rounded-lg
        ${error ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
        focus:outline-none
      `;
      }

      if (inputVariant === 2) {
        return `
          ${baseClasses}
          border rounded-full
          ${error ? "border-red-500" : "border-gray-300"}
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-60"
              : "bg-gray-100"
          }
          focus:outline-none
        `;
      }

      if (inputVariant === 3) {
        return `
        ${baseClasses}
        border rounded-full
        ${error ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
        focus:outline-none
      `;
      }

      // Variants 4-5: Background styles (no border)
      if (inputVariant === 4) {
        return `
        ${baseClasses}
        border rounded-lg
        ${error ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
        focus:outline-none
      `;
      }

      if (inputVariant === 5) {
        return `
          ${baseClasses}
          border rounded-none
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
          focus:outline-none
        `;
      }

      // Default to variant 1
      return `
        ${baseClasses}
        border rounded-lg
        ${error ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"}
        focus:outline-none
      `;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id} className={`block mb-2 form-lable`}>
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <span
              className={`absolute inset-y-0 left-0 flex items-center ${sizeStyle.iconPadding} pointer-events-none text-gray-500`}
            >
              <LeftIcon />
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`${getVariantClassName()} ${inputClassName}`.trim()}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
            style={{
              color: textColor,
              backgroundColor: themeContext?.backgroundColor,
              borderColor: `${textColor}1A`,
            }}
          />

          {/* Right Icon */}
          {RightIcon && (
            <span
              className={`absolute inset-y-0 right-0 flex items-center ${sizeStyle.iconPaddingRight} pointer-events-none text-gray-500 cursor-pointer`}
            >
              <RightIcon />
            </span>
          )}

          {(helperText || error) && (
            <p className={`text-sm text-red-500 -bottom-5 left-0`}>
              {error || helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;

