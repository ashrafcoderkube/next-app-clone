"use client";

/**
 * ButtonLink Component
 * Works as Link (with 'to') or Button (without 'to')
 * Uses theme colors from ThemeContext
 */
import React from "react";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "./Icon";
import { useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";

// ============================================
// Variants Configuration
// ============================================

interface LinkButtonProps {
  /** Link href (if provided, renders Next.js <Link>) */
  to?: string;

  /** Button / link content */
  children: React.ReactNode;

  /** Variant string like:
   *  "fill"
   *  "fill-arrow-rounded"
   *  "outline-pill"
   *  "link-arrow"
   */
  variant?: string;

  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";

  /** Additional Tailwind classes */
  className?: string;

  /** Make button full width */
  fullWidth?: boolean;

  /** Text casing */
  textCase?: "normal" | "uppercase" | "lowercase" | "capitalize";

  /** Font weight */
  fontWeight?: "normal" | "medium" | "semibold" | "bold";

  /** Icon position */
  iconPosition?: "left" | "right";

  /** Click handler (for button) */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /** Button type */
  type?: "button" | "submit" | "reset";

  /** Disable button */
  disabled?: boolean;

  /** Icon name passed to <Icon /> */
  iconName?: string;

  /** Force show / hide icon */
  showIcon?: boolean;

  /** Button type for color theming */
  buttonType?: "banner" | "collection" | "newsletter";
}

interface ButtonLinkProps {
  /** Link href */
  to?: string;

  /** Button content */
  children: React.ReactNode;

  /** Extra Tailwind classes */
  className?: string;

  /** Override icon visibility */
  showIcon?: boolean;

  /** Full variant override */
  variant?: string;

  /** Only override style part: fill | outline | link */
  buttonStyle?: "fill" | "outline" | "link";

  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /** Button type */
  type?: "button" | "submit" | "reset";

  /** Disable button */
  disabled?: boolean;

  /** Button type */
  buttonType?: "banner" | "collection" | "newsletter";
}

// Size Variants - Button, ButtonLink
const sizeVariants = {
  sm: {
    padding: "px-3 py-1",
    textSize: "text-sm",
    iconSize: "w-4 h-4",
    iconGap: "gap-1.5",
  },
  md: {
    padding: "px-4 py-2",
    textSize: "text-base",
    iconSize: "w-4 h-4",
    iconGap: "gap-2",
  },
  lg: {
    padding: "px-5 py-3",
    textSize: "text-base lg:text-lg",
    iconSize: "w-5 h-5 sm:w-6 sm:h-6",
    iconGap: "gap-2.5",
  },
  xl: {
    padding: "px-6 py-[0.9375rem]",
    textSize: "text-lg",
    iconSize: "w-5 h-5 sm:w-6 sm:h-6",
    iconGap: "gap-3",
  },
};

// Radius Variants
const radiusVariants: Record<string, string> = {
  square: "rounded-none",
  rounded: "rounded",
  "rounded-sm": "rounded-sm",
  "rounded-md": "rounded-md",
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-full": "rounded-full",
};

// Text Case Variants
const textCaseVariants: Record<string, string> = {
  normal: "normal-case",
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
};

// Font Weight Variants
const fontWeightVariants: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

// ============================================
// LinkButton Component (Internal)
// ============================================

// Parse variant string: "fill-rounded-arrow" → { style, radiusVariant, showIcon }
const parseVariant = (variant: string) => {
  const parts = variant.toLowerCase().split("-");
  let style = "fill",
    shape = "rounded",
    hasArrow = false;

  parts.forEach((part) => {
    if (["fill", "outline", "link"].includes(part)) style = part;
    else if (["square", "rounded", "pill"].includes(part)) shape = part;
    else if (part === "arrow") hasArrow = true;
  });

  const shapeToRadius: Record<string, string> = {
    square: "square",
    rounded: "rounded-lg",
    pill: "rounded-full",
  };
  return {
    style,
    radiusVariant: shapeToRadius[shape] || "rounded-lg",
    showIcon: hasArrow,
  };
};

function LinkButton({
  to,
  children,
  variant = "fill",
  size = "lg",
  className = "",
  fullWidth = false,
  textCase = "normal",
  fontWeight = "normal",
  iconPosition = "right", // 'left' | 'right'
  onClick,
  type = "button",
  disabled = false,
  iconName = "collection",
  showIcon: showIconProp,
  buttonType, // 'banner' | 'collection' | 'newsletter' | undefined (default)
  ...props
}: LinkButtonProps) {
  const themeContext = useTheme() || {};
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );

  const {
    style,
    radiusVariant,
    showIcon: variantShowIcon,
  } = parseVariant(variant);
  const sizeStyle = sizeVariants[size] || sizeVariants.md;
  const radiusStyle =
    radiusVariants[radiusVariant] || radiusVariants["rounded-xl"];
  const textCaseStyle = textCaseVariants[textCase] || textCaseVariants.normal;
  const fontWeightStyle =
    fontWeightVariants[fontWeight] || fontWeightVariants.medium;

  // Use prop if provided, otherwise use variant-based value
  const showIcon = showIconProp !== undefined ? showIconProp : variantShowIcon;
  const hasIcon = showIcon && themeId !== 3;
  const isLink = !!to;

  const baseClasses = `group inline-flex items-center justify-center ${fontWeightStyle} ${textCaseStyle} focus:outline-none transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;
  const widthClass = fullWidth ? "w-full" : "";

  // Determine colors based on buttonType
  let bgColor, textColor, borderColor;
  if (buttonType === "banner") {
    bgColor = themeContext?.bannerButtonColor || "#111111";
    textColor = themeContext?.bannerButtonTextColor || "#ffffff";
    borderColor = themeContext?.bannerButtonBorderColor || bgColor;
  } else if (buttonType === "collection") {
    bgColor = themeContext?.collectionButtonColor || "#111111";
    textColor = themeContext?.collectionButtonTextColor || "#ffffff";
    borderColor = themeContext?.collectionButtonBorderColor || bgColor;
  } else if (buttonType === "newsletter") {
    bgColor = themeContext?.newsletterButtonColor || "#111111";
    textColor = themeContext?.newsletterButtonTextColor || "#ffffff";
    borderColor = themeContext?.newsletterButtonBorderColor || bgColor;
  } else {
    // Default button colors
    bgColor = themeContext?.buttonBackgroundColor || "#111111";
    textColor = themeContext?.buttonTextColor || "#ffffff";
    borderColor = themeContext?.buttonBorderColor || bgColor;
  }

  const renderIcon = () =>
    hasIcon && (
      <span>
        <Icon
          name={iconName}
          className={`transform transition-transform duration-500 ease-in-out group-hover:rotate-45 origin-center ${sizeStyle.iconSize}`}
          stroke="currentColor"
          strokeWidth="2"
        />
      </span>
    );

  const renderContent = () => (
    <span className={`flex items-center ${hasIcon ? sizeStyle.iconGap : ""}`}>
      {iconPosition === "left" && renderIcon()}
      <span>{children}</span>
      {iconPosition === "right" && renderIcon()}
    </span>
  );

  const buttonProps = { type, disabled, onClick, ...props };
  const linkProps = { href: to, ...props };

  // FILL - Solid background
  if (style === "fill") {
    if (isLink) {
      return (
        <Link
          {...linkProps}
          className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize}  ${widthClass} ${radiusStyle} border hover:brightness-90 ${className}`}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderColor: borderColor,
          }}
        >
          {renderContent()}
        </Link>
      );
    }
    return (
      <button
        name={children?.toString()}
        {...buttonProps}
        className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize}  ${widthClass} ${radiusStyle} border hover:brightness-90 ${className}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderColor: borderColor,
        }}
      >
        {renderContent()}
      </button>
    );
  }

  // OUTLINE - Border only
  if (style === "outline") {
    if (isLink) {
      return (
        <Link
          {...linkProps}
          className={`${baseClasses} ${sizeStyle.padding}  ${widthClass} bg-transparent border ${radiusStyle} transition-colors ${className}`}
          style={{ color: bgColor, borderColor: borderColor }}
          onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = bgColor;
            target.style.color = textColor;
            target.style.borderColor = borderColor;
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
            const target = e.currentTarget as HTMLElement;
            target.style.backgroundColor = "transparent";
            target.style.color = bgColor;
            target.style.borderColor = borderColor;
          }}
        >
          {renderContent()}
        </Link>
      );
    }
    return (
      <button
        name={children?.toString()}
        {...buttonProps}
        className={`${baseClasses} ${sizeStyle.padding}  ${widthClass} bg-transparent border ${radiusStyle} transition-colors ${className}`}
        style={{ color: bgColor, borderColor: borderColor }}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
          const target = e.currentTarget as HTMLElement;
          target.style.backgroundColor = bgColor;
          target.style.color = textColor;
          target.style.borderColor = borderColor;
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
          const target = e.currentTarget as HTMLElement;
          target.style.backgroundColor = "transparent";
          target.style.color = bgColor;
          target.style.borderColor = borderColor;
        }}
      >
        {renderContent()}
      </button>
    );
  }

  // LINK - Text only
  if (style === "link") {
    if (isLink) {
      return (
        <Link
          {...linkProps}
          className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize} ${widthClass} bg-transparent ${radiusStyle} hover:opacity-80 transition-colors ${className}`}
          style={{ color: bgColor }}
        >
          {renderContent()}
        </Link>
      );
    }
    return (
      <button
        name={children?.toString()}
        {...buttonProps}
        className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize} ${widthClass} bg-transparent ${radiusStyle} hover:opacity-80 transition-colors ${className}`}
        style={{ color: bgColor }}
      >
        {renderContent()}
      </button>
    );
  }

  // Fallback
  if (isLink) {
    return (
      <Link
        {...linkProps}
        className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize} ${widthClass} ${radiusStyle} ${className}`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {renderContent()}
      </Link>
    );
  }
  return (
    <button
      name={children?.toString()}
      {...buttonProps}
      className={`${baseClasses} ${sizeStyle.padding} ${sizeStyle.textSize} ${widthClass} ${radiusStyle} ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {renderContent()}
    </button>
  );
}

// ============================================
// ButtonLink Component (Main Export)
// ============================================

function ButtonLink({
  to,
  children,
  className = "",
  showIcon: showIconProp,
  variant: variantProp,
  buttonStyle,
  onClick,
  type = "button",
  disabled = false,
  buttonType,
}: ButtonLinkProps) {
  const { themeId } = useAppSelector((state: RootState) => state.storeInfo);

  const getThemeConfig = (themeId: number) => {
    switch (themeId) {
      case 1:
        return {
          variant: "fill-arrow-rounded",
          textCase: "uppercase",
        };
      case 2:
        return {
          variant: "fill-arrow-pill",
        };
      case 5:
        return {
          variant: "fill-arrow-square",
          textCase: "normal",
        };
      case 3:
        return {
          variant: "fill-pill",
          textCase: "normal",
          showIcon: false,
        };
      case 4:
        return {
          variant: "fill-arrow-rounded",
          textCase: "normal",
          showIcon: false,
        };
      case 6:
        return {
          variant: "fill-arrow-rounded",
          textCase: "normal",
          showIcon: true,
        };
      default:
        return {
          variant: "fill-arrow-square",
        };
    }
  };

  const { variant: themeVariant, showIcon: themeShowIcon } =
    getThemeConfig(themeId);
  // Use prop if provided, otherwise use theme config value
  const showIcon = showIconProp !== undefined ? showIconProp : themeShowIcon;

  // If buttonStyle is provided (fill/outline/link), use theme's shape but change the style
  let variant = variantProp || themeVariant;
  if (buttonStyle && !variantProp) {
    // Extract shape from theme variant (rounded, pill, square)
    const themeShape = themeVariant.includes("pill")
      ? "pill"
      : themeVariant.includes("square")
      ? "square"
      : "rounded";
    const hasArrow = showIcon !== false && themeVariant.includes("arrow");
    variant = hasArrow
      ? `${buttonStyle}-arrow-${themeShape}`
      : `${buttonStyle}-${themeShape}`;
  }

  return (
    <>
      <LinkButton
        to={to}
        variant={variant}
        // textCase={textCase}
        showIcon={showIcon}
        className={className}
        onClick={onClick}
        type={type}
        disabled={disabled}
        buttonType={buttonType}
      >
        {children}
      </LinkButton>
    </>
  );
}

export default ButtonLink;

// ============================================
// ButtonLink2 Component (Secondary Export)
// ============================================

// Simple link with chevron
export const ButtonLink2 = ({ to, children, className = "", style = {} }) => {
  const themeContext = useTheme() || {};

  return (
    <Link
      href={to}
      className="font-bold flex items-center gap-1 transition-all hover:opacity-80"
      style={style}
    >
      {children}
      <Icon
        name="chevronRight"
        className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1 ${className}`}
        stroke={themeContext?.buttonBackgroundColor}
        strokeWidth="2"
      />
    </Link>
  );
};
