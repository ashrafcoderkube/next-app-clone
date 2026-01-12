import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radiusVariant?: "square" | "rounded" | "rounded-sm" | "rounded-md" | "rounded-lg" | "rounded-xl" | "rounded-full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  bgVariant?: "transparent" | "white" | "light" | "theme" | string;
  borderVariant?: "none" | "thin" | "medium" | "thick";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  applyBaseClasses?: boolean;
  applyBackground?: boolean;
  applyBorder?: boolean;
  applyRadius?: boolean;
  applyShadow?: boolean;
  applyPadding?: boolean;
  applyHover?: boolean;
}

const Card = ({
  children,
  radiusVariant = "rounded",
  shadow = "md",
  className = "",
  bgVariant = "white",
  borderVariant = "none",
  hover = false,
  padding = "md",
  applyBaseClasses = false,
  applyBackground = false,
  applyBorder = false,
  applyRadius = false,
  applyShadow = false,
  applyPadding = false,
  applyHover = false,
  ...props
}: CardProps) => {
  const radiusVariants = {
    square: "rounded-none",
    rounded: "rounded",
    "rounded-sm": "rounded-sm",
    "rounded-md": "rounded-md",
    "rounded-lg": "rounded-lg",
    "rounded-xl": "rounded-xl",
    "rounded-full": "rounded-full",
  };

  const shadowVariants = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  };

  const backgroundVariants = {
    transparent: "bg-transparent",
    white: "bg-white",
    light: "bg-gray-50",
    theme: null,
  };

  const borderVariants = {
    none: "",
    thin: "border border-gray-200",
    medium: "border-2 border-gray-300",
    thick: "border-[3px] border-gray-400",
  };

  const paddingVariants = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const radiusStyle = radiusVariants[radiusVariant] || radiusVariants.rounded;
  const shadowStyle =
    shadow in shadowVariants ? shadowVariants[shadow] : shadowVariants.md;
  const bgStyle =
    backgroundVariants[bgVariant as keyof typeof backgroundVariants] !== undefined
      ? backgroundVariants[bgVariant as keyof typeof backgroundVariants]
      : bgVariant;
  const borderStyle =
    borderVariant in borderVariants
      ? borderVariants[borderVariant]
      : "";
  const paddingClass = paddingVariants[padding] || paddingVariants.md;

  const baseClasses = applyBaseClasses
    ? "overflow-hidden transition-all duration-200"
    : "";

  const hoverClasses =
    hover && applyHover
      ? `hover:-translate-y-1 cursor-pointer ${
          shadow !== "none" ? "hover:shadow-lg" : ""
        }`
      : "";

  const cardClassName = `
    ${applyBaseClasses ? baseClasses : ""}
    ${applyBackground ? bgStyle || "" : ""}
    ${applyBorder ? borderStyle : ""}
    ${applyRadius ? radiusStyle : ""}
    ${applyShadow ? shadowStyle : ""}
    ${applyPadding ? paddingClass : ""}
    ${applyHover ? hoverClasses : ""}
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim();

  const cardStyle =
    bgVariant === "theme"
      ? { backgroundColor: "#111111" } // Default theme color
      : undefined;

  return (
    <div className={cardClassName} style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;

