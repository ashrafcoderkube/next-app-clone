"use client";

import Image from "next/image";
import { useState, useMemo, memo, useEffect, useRef } from "react";
import placeholder from "../assets/images/placeholder.webp";
import { addBaseUrlToMedia, addCdnBaseUrlToMedia } from "../utils/common";
import {
  getRotationFromOrientation,
  getWebPOrientation,
} from "../utils/imageOrientation";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  loading?: "lazy" | "eager";
  wholesalerId?: number | string | null;
  enableExifRotation?: boolean;
  isBlur?: boolean;
}

interface NoImageProps {
  className?: string;
  width?: number;
  height?: number;
}

const SafeImageComponent = ({
  src,
  alt,
  onClick,
  className,
  width,
  height,
  style,
  fill = false,
  priority = false,
  quality = 75,
  sizes,
  loading = "lazy",
  wholesalerId = null,
  enableExifRotation = false,
  isBlur = false,
  ...props
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [exifRotation, setExifRotation] = useState(0);
  const [dimensionRotation, setDimensionRotation] = useState(0);
  const [originalImageLoaded, setOriginalImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const allowedWholesalerIds = [1128, 1795];

  const shouldApplyMergedStyle =
    wholesalerId !== null &&
    allowedWholesalerIds.includes(Number(wholesalerId));

  useEffect(() => {
    const detectExifOrientation = async () => {
      // Only process if enabled and .webp images
      if (!enableExifRotation || !src || !src.toLowerCase().endsWith(".webp")) {
        setExifRotation(0);
        return;
      }

      // Wait a bit for image to start loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const orientation = await getWebPOrientation(src);
        const rotation = getRotationFromOrientation(orientation);
        setExifRotation(rotation);
      } catch (error) {
        // console.warn(
        //   `[SafeImage] Failed to detect EXIF orientation for ${src}:`,
        //   error
        // );
        setExifRotation(0);
      }
    };

    if (src && enableExifRotation) {
      detectExifOrientation();
    }
  }, [src, enableExifRotation]);

  // Handle dimension-based rotation when image loads
  useEffect(() => {
    if (!enableExifRotation || !imgRef.current || !src) {
      return;
    }

    const img = imgRef.current;

    const handleImageLoad = async () => {
      // Check image dimensions for rotation
      const imgWidth = img.naturalWidth || img.width || 0;
      const imgHeight = img.naturalHeight || img.height || 0;

      // If width > height, rotate 90 degrees (portrait to landscape assumption)
      if (imgWidth > imgHeight && imgWidth > 0 && imgHeight > 0) {
        setDimensionRotation(90);
      } else {
        setDimensionRotation(0);
      }
    };

    // Check if image is already loaded
    if (img.complete && img.naturalWidth > 0) {
      handleImageLoad();
    } else {
      // Wait for image to load
      img.addEventListener("load", handleImageLoad, { once: true });
    }

    return () => {
      img.removeEventListener("load", handleImageLoad);
    };
  }, [src, enableExifRotation]);

  // Memoize the processed image source to avoid recalculating on every render
  const imageSrc = useMemo(() => addBaseUrlToMedia(src), [src]);
  const imageSrcWithCDN = useMemo(() => addCdnBaseUrlToMedia(src), [src]);

  // Check if CDN and original URLs are different (only do progressive loading if they differ)
  const shouldUseProgressiveLoading = useMemo(() => {
    return imageSrc && imageSrcWithCDN && imageSrc !== imageSrcWithCDN;
  }, [imageSrc, imageSrcWithCDN]);

  // Preload the original high-quality image in the background
  useEffect(() => {
    if (
      !shouldUseProgressiveLoading ||
      !imageSrc ||
      imageSrc.trim() === "" ||
      hasError ||
      originalImageLoaded
    ) {
      // If URLs are same or progressive loading not needed, mark as loaded immediately
      if (!shouldUseProgressiveLoading && imageSrc) {
        setOriginalImageLoaded(true);
      }
      return;
    }

    // Only preload in browser environment
    if (typeof window === "undefined") {
      return;
    }

    const preloadImage = document.createElement("img");
    preloadImage.onload = () => {
      setOriginalImageLoaded(true);
    };
    preloadImage.onerror = () => {
      // If original fails to load, keep using CDN image
      // cons ole.warn(`[SafeImage] Failed to preload original image: ${imageSrc}`);
    };
    preloadImage.src = imageSrc;

    return () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [
    imageSrc,
    imageSrcWithCDN,
    hasError,
    originalImageLoaded,
    shouldUseProgressiveLoading,
  ]);

  // Reset originalImageLoaded when src changes
  useEffect(() => {
    setOriginalImageLoaded(false);
  }, [src]);

  // Memoize the final source to use
  // Use CDN image initially (blurred), then switch to original once loaded
  const finalSrc = useMemo(() => {
    if (hasError || !imageSrc || imageSrc.trim() === "") {
      return placeholder;
    }
    // If progressive loading is enabled and original is loaded, use original
    if (shouldUseProgressiveLoading && originalImageLoaded && imageSrc) {
      return imageSrc;
    }
    // Use CDN image if progressive loading is enabled, otherwise use original
    if (shouldUseProgressiveLoading && imageSrcWithCDN) {
      return imageSrcWithCDN;
    }
    // Fallback to original image
    return imageSrc;
  }, [
    hasError,
    imageSrc,
    imageSrcWithCDN,
    originalImageLoaded,
    shouldUseProgressiveLoading,
  ]);

  // Memoize error handler to prevent recreation
  const handleError = useMemo(() => () => setHasError(true), []);

  const getMergedTransform = () => {
    const existingTransform = style?.transform || "";

    // Priority: EXIF rotation first, then dimension-based rotation
    // If EXIF says no rotation, use dimension-based rotation
    const finalRotation = exifRotation !== 0 ? exifRotation : dimensionRotation;
    const rotationTransform =
      finalRotation !== 0 ? `rotate(${finalRotation}deg)` : "";

    if (!rotationTransform) {
      return existingTransform || "none";
    }

    if (!existingTransform || existingTransform === "none") {
      return rotationTransform;
    }

    // Combine transforms: existing first, then rotation
    return `${existingTransform} ${rotationTransform}`;
  };

  const mergedStyle = {
    ...style,
    filter:
      shouldUseProgressiveLoading &&
      !originalImageLoaded &&
      finalSrc !== placeholder &&
      isBlur
        ? "blur(10px)"
        : "blur(0px)",
    transform: getMergedTransform(),
    transition: "filter 0.3s ease-in-out",
  };

  // Apply blur to CDN image while original loads
  // Preserve existing transform if any
  const baseStyle = {
    ...style,
    filter:
      shouldUseProgressiveLoading &&
      !originalImageLoaded &&
      finalSrc !== placeholder &&
      isBlur
        ? "blur(10px)"
        : style?.filter || "none",
    transform: style?.transform || "none",
    transition: "filter 0.3s ease-in-out",
  };

  // Use mergedStyle only if wholesalerId matches the allowed IDs, otherwise use baseStyle
  const finalStyle = shouldApplyMergedStyle ? mergedStyle : baseStyle;

  return (
    <Image
      ref={imgRef}
      width={width}
      height={height}
      src={finalSrc}
      alt={alt || "Image"}
      className={className}
      style={finalStyle}
      onClick={onClick}
      onError={handleError}
      fill={fill}
      priority={priority}
      quality={quality}
      sizes={sizes || ""}
      loading={loading}
      {...props}
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(SafeImageComponent);

const NoImageComponent = memo(function NoImage({
  className,
  width,
  height,
  ...props
}: NoImageProps) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={placeholder}
        alt={"No image"}
        className={className}
        width={width}
        height={height}
        priority={false}
        quality={75}
        loading="lazy"
        {...props}
      />
    </div>
  );
});

export { NoImageComponent as NoImage };
