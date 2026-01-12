"use client";

import React from "react";
import Icon from "./Icon";

interface SwiperNavButtonProps {
  className?: string;
  theme?: any;
  buttonTextColor?: string;
  onClick?: () => void;
}

export default function SwiperNavButton({
  className = "",
  theme,
  buttonTextColor,
  onClick,
}: SwiperNavButtonProps) {
  const isPrev = className.includes("prev");
  const iconName = isPrev ? "chevronLeft" : "chevronRight";

  return (
    <button
      name={isPrev ? "Previous" : "Next"}
      className={`${className} absolute top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-[#F7F7F7] rounded-full shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200`}
      onClick={onClick}
      style={{
        color: "transparent",
      }}
      aria-label={isPrev ? "Previous" : "Next"}
    >
      <Icon name={iconName} size={25} />
    </button>
  );
}
