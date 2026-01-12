// Placeholder image path (replaces imported asset)
// import placeholderImage from "../assets/images/placeholder.webp";
const PLACEHOLDER_IMAGE = "../assets/images/placeholder.webp";

/**
 * Get product image from product object
 * Falls back to placeholder if no image found
 */
export const getProductImage = (product: any): string => {
  if (!product) return PLACEHOLDER_IMAGE;

  const image =
    product?.cover_image ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]?.image
      : typeof product?.images === "string"
      ? product.images
      : product?.product_images?.[0] || product?.image || PLACEHOLDER_IMAGE);

  // // If image is a relative path (doesn't start with http/https), prepend the base URL
  // if (image && typeof image === 'string' && !image.startsWith('http')) {
  //   return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://assets.jdwebnship.com/"}${image}`;
  // }

  return image || PLACEHOLDER_IMAGE;
};

export function addBaseUrlToMedia(mediaPath: string): string {
  // Handle null/undefined input
  if (!mediaPath) {
    return "";
  }

  // If the path is already a complete URL, return it as is
  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }


  // Define your base URL here
  const BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://assets.jdwebnship.com";

  // Clean the base URL (remove trailing slash)
  const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

  // Check if the mediaPath already contains the base URL
  if (mediaPath.startsWith(cleanBaseUrl)) {
    return mediaPath;
  }

  // Ensure the path starts with a slash
  const cleanPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;

  return `${cleanBaseUrl}${cleanPath}`;
}

export function addCdnBaseUrlToMedia(mediaPath: string): string {
  // Handle null/undefined input
  if (!mediaPath) {
    return "";
  }

  // If the path is already a complete URL, return it as is
  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }


  // Define your base URL here
  const BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://assets.jdwebnship.com";

  // Clean the base URL (remove trailing slash)
  const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

  // Check if the mediaPath already contains the base URL
  if (mediaPath.startsWith(cleanBaseUrl)) {
    return mediaPath;
  }

  // Ensure the path starts with a slash
  const cleanPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
  return `${cleanBaseUrl}/cdn-cgi/image/width=200,quality=5${cleanPath}`;
}


/**
 * Format status string (e.g., "pending_payment" -> "Pending Payment")
 */
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Generate WhatsApp share link
 * Note: This function uses window.open, so it should only be called from client components
 */
export const getWhatsappLink = (
  e: React.MouseEvent,
  product: {
    slug?: string;
    name?: string;
    id?: number | string;
  },
  phone_number: string | null | undefined,
  subdomain: string | null | undefined,
  variant?: {
    variation?: string;
    product_variation?: string;
  } | null
): boolean | null => {
  e.preventDefault();
  e.stopPropagation();

  // Check if we're in browser environment
  if (typeof window === "undefined") {
    console.warn("getWhatsappLink can only be called from client components");
    return null;
  }

  const productName = product?.name;
  const productUrl = `${subdomain || ""}/products/${productName}${
    product?.id ? `/${product?.id}` : ""
  }${
    variant
      ? `?variant=${variant?.variation || variant?.product_variation}`
      : ""
  }`;

  if (productName && phone_number && productUrl) {
    const cleanPhoneNumber = phone_number.replace(/[^\d+]/g, "");
    const message = `Hi,\nI am interested in ${product?.name} ${productUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=91${cleanPhoneNumber}&text=${encodedMessage}`;
    window.open(url, "_blank");
    return true;
  } else {
    console.error("Missing product name, URL, or phone number");
    return null;
  }
};

/**
 * Check if product is in wishlist
 */
export const isInWishlist = (
  product_id: number | string | null | undefined,
  wishlistData:
    | Array<{
        id?: number | string;
        // retailer_product_id?: number | string;
      }>
    | null
    | undefined
): boolean => {
  if (!wishlistData || !Array.isArray(wishlistData)) {
    return false;
  }
  return wishlistData.some(
    (item) => item.id === product_id
    // || item.retailer_product_id == product_id
  );
};

/**
 * Parse date string (DD/MM/YYYY format, ISO string, or "YYYY-MM-DD HH:mm:ss" format)
 */
export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;

  // Handle DD/MM/YYYY format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );
  }

  // Handle "YYYY-MM-DD HH:mm:ss" format (used in track order)
  // Convert "2024-12-20 10:30:00" to "2024-12-20T10:30:00"
  if (dateStr.includes(" ") && !dateStr.includes("T")) {
    const date = new Date(dateStr.replace(" ", "T"));
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle ISO string or other formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format date to DD/MM/YY format
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // Return original if invalid date

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

/**
 * Truncate words based on character limit
 * Note: For SSR compatibility, this version doesn't check window width
 * Use a client-side hook if you need responsive truncation
 */
export const truncateWords = (
  str: string | null | undefined = "",
  maxChars: number = 25
): string => {
  if (typeof window !== "undefined" && window.innerWidth > 640) {
    // Desktop & tablets – return full text
    return str;
  }
  if (!str) return "";
  if (str.length <= maxChars) return str;

  const trimmed = str.slice(0, maxChars - 3);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 6) {
    return trimmed.slice(0, lastSpace) + "...";
  }
  return trimmed + "...";
};

/**
 * Client-side version of truncateWords that checks window width
 * This should only be called from client components
 */
export const truncateWordsResponsive = (
  str: string | null | undefined = "",
  maxChars: number = 10
): string => {
  if (typeof window === "undefined") {
    // Fallback to non-responsive version during SSR
    return truncateWords(str, maxChars);
  }

  if (window.innerWidth > 640) {
    // Desktop & tablets – return full text
    return str || "";
  }

  // Mobile truncation logic
  return truncateWords(str, maxChars);
};

/**
 * Sort product variations by size/number
 * Handles clothing sizes (XS, S, M, L, XL, XXL, etc.) and numeric values
 */
export const sortVariants = (variants: any[]): any[] => {
  if (!variants || !Array.isArray(variants)) return variants;

  // Define size order for clothing sizes
  const sizeOrder: Record<string, number> = {
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    XXL: 6,
    XXXL: 7,
    XXXXL: 8,
  };

  return [...variants].sort((a, b) => {
    const aVal = (a?.variation || "").trim().toUpperCase();
    const bVal = (b?.variation || "").trim().toUpperCase();

    // Check if both are in size order
    const aSizeOrder = sizeOrder[aVal];
    const bSizeOrder = sizeOrder[bVal];

    if (aSizeOrder && bSizeOrder) {
      return aSizeOrder - bSizeOrder;
    }
    if (aSizeOrder) return -1;
    if (bSizeOrder) return 1;

    // Check if both are numeric
    const aNum = parseFloat(aVal);
    const bNum = parseFloat(bVal);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;

    // For other values, use alphabetical order
    return aVal.localeCompare(bVal);
  });
};

export const getOppositeTextColor = (bg: string | undefined): string => {
  if (!bg) return "#000";
  bg = bg.replace("#", "");
  const r = parseInt(bg.slice(0, 2), 16);
  const g = parseInt(bg.slice(2, 4), 16);
  const b = parseInt(bg.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "#000000" : "#ffffff";
};
