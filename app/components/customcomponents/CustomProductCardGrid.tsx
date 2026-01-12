"use client";

import React from "react";
import { Star, RotateCw } from "lucide-react";
import Card from "./Card";
import Icon from "./Icon";
// import outOfStockImage from "../../assets/images/outOfStock.png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppSelector } from "../../redux/hooks";
import { useAppDispatch } from "../../redux/hooks";
import {
  getOppositeTextColor,
  getProductImage,
  sortVariants,
} from "../../utils/common";
import { openCartPopup } from "../../redux/slices/cartSlice";
import SafeImage from "../SafeImage";
import { selectThemeData } from "@/app/redux/selectors";
import { sendEvent } from "@/app/utils/facebookAnalytics";
import { trackAddToCart } from "@/app/utils/analytics";
import SelectSizeModal from "./SizeModal";

// Product data structure
interface ProductVariant {
  id: number;
  variation: string;
  price: number;
  old_price: number | null;
  stock: number;
  image?: string;
}

interface Product {
  id: number | string;
  name?: string;
  alternate_name?: string;
  final_price?: number | null;
  old_price?: number | null;
  status?: number;
  quantity: number;
  variations?: ProductVariant[];
  sub_category?: { sub_category_name: string };
  sub_category_name?: string;
  category?: { name: string };
  category_name?: string;
  added_to_wishlist?: string;
  cover_image?: string;
  images?: Array<{ image: string }> | string;
  product_images?: string[];
  image?: string;
  slug?: string;
  catalog_id?: number | null;
  globalRule?: string;
  wholesaler_id?: number | null;
  retailer_product_id?: number | string;
  product_id?: number | string;
  retailer_id?: number;
  sub_category_id?: number;
  created_at?: string;
}

interface CustomProductCardGridProps {
  product: Product;
  // Layout Options
  layout?: "overlay" | "theme1";
  // Visibility Controls
  showImage?: boolean;
  showDiscount?: boolean;
  showWishlist?: boolean;
  showWhatsApp?: boolean;
  showAddToCart?: boolean;
  showRating?: boolean;
  showDescription?: boolean;
  showVariants?: boolean;
  showPrice?: boolean;
  showOldPrice?: boolean;
  showGoToCart?: boolean;
  // Button Display Options
  buttonPosition?: "overlay" | "bottom" | "side";
  // State Props
  isWishlist?: boolean;
  isWishlistKey?: boolean;
  isWholesaler?: boolean;
  selectedVariant?: ProductVariant | null;
  // Event Handlers
  onProductClick?: (product: Product) => void;
  onAddToCart?: (
    e: React.MouseEvent,
    product: Product,
    variant: ProductVariant | null
  ) => void;
  onBuyNow?: (
    e: React.MouseEvent,
    product: Product,
    variant: ProductVariant | null
  ) => void;
  onWishlistToggle?: (product: Product) => void;
  onWhatsAppClick?: (
    e: React.MouseEvent,
    product: Product,
    variant: ProductVariant | null
  ) => void;
  onVariantSelect?: (variant: ProductVariant) => void;
  onRemoveFromWishlist?: (product: Product) => void;
  // Additional Props
  rating?: number;
  reviewCount?: number;
  description?: string;
  badge?: React.ReactNode | string;
}

const CustomProductCardGrid = ({
  product,
  layout = "overlay",
  showImage = false,
  showDiscount = false,
  showWishlist = false,
  showWhatsApp = false,
  showAddToCart = false,
  showRating = false,
  showDescription = false,
  showVariants = false,
  showPrice = false,
  showOldPrice = false,
  showGoToCart = false,
  buttonPosition = "overlay",
  isWishlist = false,
  isWishlistKey = false,
  selectedVariant = null,
  onProductClick,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  onWhatsAppClick,
  onVariantSelect,
  onRemoveFromWishlist,
  rating = 0,
  reviewCount = 0,
  description = "",
  badge = null,
}: CustomProductCardGridProps) => {
  const dispatch = useAppDispatch();
  const { themeId, isWholesaler } = useAppSelector(selectThemeData);
  const themeContext = useTheme() || {};
  const { textColor, headerTextColor } = themeContext;

  // Use theme button colors with fallbacks
  const addToCartButtonBackgroundColor =
    themeContext?.addToCartButtonBackgroundColor || "#111111";
  const addToCartButtonTextColor =
    themeContext?.addToCartButtonTextColor || "#ffffff";
  const addToCartButtonBorderColor =
    themeContext?.addToCartButtonBorderColor || "#111111";
  const buyNowButtonBackgroundColor =
    themeContext?.buyNowButtonBackgroundColor || "#111111";
  const buyNowButtonTextColor =
    themeContext?.buyNowButtonTextColor || "#ffffff";
  const buyNowButtonBorderColor =
    themeContext?.buyNowButtonBorderColor || "#111111";

  // Check if wholesaler from environment variable

  // For wholesalers: Track if user has explicitly selected a variant
  const [userSelectedVariant, setUserSelectedVariant] =
    React.useState<ProductVariant | null>(null);
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [modalActionType, setModalActionType] = React.useState<
    "addToCart" | "buyNow"
  >("addToCart");
  const [imageRotation, setImageRotation] = React.useState(0);
  const prevProductId = React.useRef(product?.id);
  const hasSettled = React.useRef(false);
  const settledVariantId = React.useRef<number | null>(null);

  // Reset when product changes
  React.useEffect(() => {
    if (prevProductId.current !== product?.id) {
      prevProductId.current = product?.id;
      hasSettled.current = false;
      settledVariantId.current = null;
      setUserSelectedVariant(null);
      setImageRotation(0);
    }
  }, [product?.id]);

  const prevSelectedVariantId = React.useRef<number | null>(null);

  // Wait for parent's useEffect to settle, then capture initial variant
  React.useEffect(() => {
    if (isWholesaler && !hasSettled.current) {
      const timer = setTimeout(() => {
        settledVariantId.current = selectedVariant?.id || null;
        prevSelectedVariantId.current = selectedVariant?.id || null;
        hasSettled.current = true;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedVariant?.id, isWholesaler]);

  // Track user selections for wholesalers
  React.useEffect(() => {
    if (isWholesaler && hasSettled.current) {
      const currentVariantId = selectedVariant?.id || null;
      const prevVariantId = prevSelectedVariantId.current;
      if (currentVariantId !== prevVariantId) {
        if (currentVariantId !== null) {
          setUserSelectedVariant(selectedVariant || null);
        } else {
          setUserSelectedVariant(null);
        }
        prevSelectedVariantId.current = currentVariantId;
      }
    }
  }, [selectedVariant, isWholesaler]);

  // Get sorted variants for default selection
  const sortedVariantsForDefault = React.useMemo(() => {
    if (!product?.variations?.length) return [];
    return sortVariants(product.variations) || product.variations;
  }, [product?.variations]);

  // Get first in-stock variant from sorted list
  const firstInStockSortedVariant = React.useMemo(() => {
    if (!sortedVariantsForDefault.length) return null;
    const inStockVariant = sortedVariantsForDefault.find((v) => v.stock > 0);
    return inStockVariant || sortedVariantsForDefault[0];
  }, [sortedVariantsForDefault]);

  // Get effective selected variant
  const getEffectiveSelectedVariant = (): ProductVariant | null => {
    if (isWholesaler) {
      return userSelectedVariant;
    }
    return selectedVariant || firstInStockSortedVariant;
  };

  const effectiveSelectedVariant = getEffectiveSelectedVariant();

  const hasSetDefaultVariant = React.useRef(false);
  const lastProductId = React.useRef<number | string | null>(null);

  // Notify parent component to sync selectedVariant with first sorted variant
  React.useEffect(() => {
    if (lastProductId.current !== product?.id) {
      hasSetDefaultVariant.current = false;
      lastProductId.current = product?.id;
    }

    if (
      !isWholesaler &&
      !hasSetDefaultVariant.current &&
      !selectedVariant &&
      firstInStockSortedVariant &&
      onVariantSelect
    ) {
      const timer = setTimeout(() => {
        onVariantSelect(firstInStockSortedVariant);
        hasSetDefaultVariant.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    product?.id,
    firstInStockSortedVariant?.id,
    isWholesaler,
    onVariantSelect,
    selectedVariant?.id,
  ]);

  const productImage = getProductImage(product);

  // VARIANT PRICE CALCULATION
  const getProductPrice = () => {
    const hasVariations =
      Array.isArray(product?.variations) && product.variations.length > 0;

    const isSimpleProduct = product?.catalog_id === null || !hasVariations;

    if (isSimpleProduct) {
      if (hasVariations) {
        const variationWithStock = product.variations.find((v) => v.stock > 0);
        const selectedVariation = variationWithStock || product.variations[0];

        return {
          final_price: parseFloat(String(selectedVariation?.price)) || 0,
          old_price: selectedVariation?.old_price || null,
        };
      } else {
        return {
          final_price: parseFloat(String(product?.final_price)) || 0,
          old_price: product?.old_price || null,
        };
      }
    }

    if (!hasVariations) {
      return {
        final_price: parseFloat(String(product?.final_price)) || 0,
        old_price: product?.old_price || null,
      };
    }

    const inStockVariations = product.variations.filter((v) => v.stock > 0);
    const variationsToConsider =
      inStockVariations.length > 0 ? inStockVariations : product.variations;

    const getPrice = (v: ProductVariant) => parseFloat(String(v.price)) || 0;

    let selectedVariation: ProductVariant;

    if (product?.globalRule === "lowest") {
      selectedVariation = variationsToConsider.reduce((lowest, current) =>
        getPrice(current) < getPrice(lowest) ? current : lowest
      );
    } else {
      selectedVariation = variationsToConsider.reduce((highest, current) =>
        getPrice(current) > getPrice(highest) ? current : highest
      );
    }

    return {
      final_price: getPrice(selectedVariation),
      old_price: selectedVariation.old_price || null,
      selectedVariation: selectedVariation,
    };
  };

  const productPrice = getProductPrice();

  // Calculate displayed price
  const displayedPrice = React.useMemo(() => {
    let priceData;
    if (effectiveSelectedVariant) {
      priceData = {
        final_price: parseFloat(String(effectiveSelectedVariant?.price)) || 0,
        old_price: effectiveSelectedVariant?.old_price || null,
      };
    } else {
      priceData = productPrice;
    }

    const finalPrice = priceData?.final_price || 0;
    const oldPrice = priceData?.old_price
      ? parseFloat(String(priceData.old_price))
      : null;

    return {
      final_price: finalPrice,
      old_price: oldPrice && oldPrice > finalPrice ? oldPrice : null,
    };
  }, [effectiveSelectedVariant, productPrice]);

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!displayedPrice?.old_price || !displayedPrice?.final_price) return null;
    if (displayedPrice.old_price <= displayedPrice.final_price) return null;
    const discount =
      ((displayedPrice.old_price - displayedPrice.final_price) /
        displayedPrice.old_price) *
      100;
    return Math.round(discount);
  };

  const discountPercentage = calculateDiscount();

  // Calculate available stock
  const getAvailableStock = () => {
    if (product?.variations?.length > 0) {
      if (effectiveSelectedVariant) {
        return effectiveSelectedVariant.stock || 0;
      }
      return product.variations.some((v) => v.stock > 0) ? 1 : 0;
    }
    return product?.quantity || 0;
  };

  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock === 0;

  // Send analytics events
  const sendAddToCartEvent = () => {
    sendEvent("AddToCart", product);
    trackAddToCart(product, 1);
  };

  // Handle clicks
  const handleCardClick = () => {
    if (onProductClick) onProductClick(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    console.log("handleAddToCartClick");
    e.preventDefault();
    e.stopPropagation();

    if (isWholesaler && product?.variations?.length > 0) {
      const variantToUse = userSelectedVariant;
      console.log("variantToUse", variantToUse);
      if (!variantToUse) {
        setModalActionType("addToCart");
        setShowSizeModal(true);
        return;
      }
      sendAddToCartEvent();
      onAddToCart?.(e, product, variantToUse);
    } else {
      sendAddToCartEvent();
      onAddToCart?.(e, product, selectedVariant || null);
    }
  };

  const handleModalAddToCart = (
    e: React.MouseEvent,
    product: Product,
    variant: ProductVariant
  ) => {
    e.preventDefault();
    e.stopPropagation();
    sendAddToCartEvent();
    onAddToCart?.(e, product, variant);
    if (isWholesaler) {
      setUserSelectedVariant(variant);
      prevSelectedVariantId.current = variant?.id;
    }
  };

  const handleModalBuyNow = (
    e: React.MouseEvent,
    product: Product,
    variant: ProductVariant
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onBuyNow?.(e, product, variant);
    if (isWholesaler) {
      setUserSelectedVariant(variant);
      prevSelectedVariantId.current = variant?.id;
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) onWishlistToggle(product);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWhatsAppClick?.(e, product, selectedVariant || null);
  };

  const handleImageRotation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // Render action buttons
  const renderActionButtons = () => {
    const actionButtonRadius = themeId === 5 ? "rounded-none" : "rounded-[8px]";

    if (themeId === 6 && showWishlist) {
      return (
        <div className="absolute top-3 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <button
            onClick={handleWishlistClick}
            className="w-9 h-9 !rounded-full bg-black backdrop-blur-sm shadow-lg flex items-center justify-center text-[#1e293b] hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Icon
              name="cardHeart"
              isWishlist={isWishlist}
              strokeWidth="1.42857"
              className="w-4 h-4"
            />
          </button>
        </div>
      );
    }

    return (
      <div className="hover-content">
        <div className="flex justify-between">
          <div className="social-icon">
            <div className="icon-wrapper p-1 flex flex-col gap-2 z-10">
              {showWhatsApp && !isWishlistKey && (
                <button
                  name="WhatsApp"
                  onClick={handleWhatsAppClick}
                  className={`bg-[#25D366] lg:p-[12px] lg:w-[2.625rem] lg:h-[2.625rem] p-[7px] w-[2.125rem] h-[2.125rem] inline-block ${actionButtonRadius} cursor-pointer`}
                  title="Share on WhatsApp"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#ffff"
                    className="max-w-[100%] max-h-[100%]"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
              )}

              {showWishlist && (
                <button
                  name="Wishlist"
                  onClick={handleWishlistClick}
                  className={`bg-[#1111116b] lg:p-[9px] lg:w-[2.625rem] lg:h-[2.625rem] p-[4px] w-[2.125rem] h-[2.125rem] inline-block ${actionButtonRadius} cursor-pointer`}
                >
                  <Icon
                    name="cardHeart"
                    isWishlist={isWishlist}
                    strokeWidth="1.42857"
                    className="max-w-[100%] max-h-[100%]"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render discount badge
  const renderDiscount = () => {
    if (!showDiscount || !discountPercentage) return null;

    if (themeId === 6) {
      return (
        <div
          className="absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          {discountPercentage}% OFF
        </div>
      );
    }

    return (
      <div
        className="product-cont-size absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-bold rounded-full"
        style={{
          backgroundColor: themeContext?.buttonBackgroundColor,
          color: themeContext?.buttonTextColor,
        }}
      >
        {discountPercentage}% OFF
      </div>
    );
  };

  // Render custom badge
  const renderBadge = () => {
    if (!badge) return null;
    if (themeId === 6 && typeof badge === "string") {
      return (
        <div
          className="absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          {badge}
        </div>
      );
    }
    return <div className="absolute top-3 left-3 z-10">{badge}</div>;
  };

  // Render rating stars
  const renderRating = () => {
    if (!showRating || !rating) return null;

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => {
            const isHalfStar = rating - i >= 0.5 && rating - i < 1;
            const isFullStar = rating - i >= 1;
            return (
              <Star
                key={i}
                size={14}
                className={
                  isFullStar
                    ? "text-yellow-400 fill-yellow-400"
                    : isHalfStar
                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                    : "text-gray-300"
                }
              />
            );
          })}
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-gray-600">({reviewCount})</span>
        )}
      </div>
    );
  };

  // Render product variants
  const renderVariants = () => {
    if (!showVariants || !product?.variations?.length) return null;

    const sortedVariants = sortedVariantsForDefault;

    if (themeId === 6) {
      return (
        <div className="flex flex-wrap gap-2">
          {sortedVariants?.map((variant, index) => {
            if (variant.stock <= 0) return null;
            const isSelected = effectiveSelectedVariant?.id === variant.id;

            return (
              <span
                key={variant.id || index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onVariantSelect) onVariantSelect(variant);
                }}
                className={`px-3 py-1.5 text-xs font-medium ${
                  themeId === 6 ? "rounded-none" : "rounded"
                } border cursor-pointer transition-all duration-200`}
                style={
                  isSelected
                    ? {
                        borderColor: themeContext?.buttonBackgroundColor,
                        backgroundColor: themeContext?.buttonBackgroundColor,
                        color: themeContext?.buttonTextColor,
                      }
                    : {
                        borderColor: themeContext?.buttonBackgroundColor,
                        backgroundColor: "transparent",
                        color: themeContext?.buttonBackgroundColor,
                      }
                }
              >
                {variant.variation}
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-row flex-wrap gap-2 product-cont-size">
        {sortedVariants?.map((variant, index) => {
          if (variant.stock <= 0) return null;

          const isSelected = effectiveSelectedVariant?.id === variant.id;

          return (
            <span
              key={variant.id || index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isWholesaler) {
                  setUserSelectedVariant(variant);
                  prevSelectedVariantId.current = variant?.id;
                }
                if (onVariantSelect) {
                  onVariantSelect(variant);
                }
              }}
              className="leading-normal border-radius-xl px-[0.5rem] py-[0.24rem] min-w-[29px] flex items-center justify-center border text-sm uppercase cursor-pointer transition-all duration-200"
              style={
                isSelected
                  ? {
                      color: getOppositeTextColor(textColor), // 👈 only text
                      backgroundColor: textColor,
                      borderColor: `${themeContext?.buttonBackgroundColor}1A`,
                    }
                  : {
                      backgroundColor: themeContext?.backgroundColor,
                      borderColor: `${textColor}5A`,
                      color: textColor,
                    }
              }
            >
              {variant.variation}
            </span>
          );
        })}
      </div>
    );
  };

  // Render add to cart button
  const renderAddToCartButton = () => {
    if (!showAddToCart) return null;

    if (product?.status === 0 || isOutOfStock) {
      if (isWholesaler) return null;
      return (
        <button
          name="Out of Stock"
          className={`z-10 w-full btn py-3.5 ${
            themeId === 4
              ? "rounded-2xl"
              : themeId === 5 || themeId === 6
              ? "!rounded-none"
              : "rounded-2xl"
          } text-white text-base focus:outline-none flex items-center justify-center`}
        >
          Out of Stock
        </button>
      );
    }

    if (isWholesaler) {
      return (
        <>
          {product?.status !== 0 && !isOutOfStock && isWholesaler && (
            <button
              name="Add to Cart"
              onClick={(e) => {
                console.log("add to cart button clicked");
                e.preventDefault();
                console.log("e.preventDefault");
                e.stopPropagation();
                console.log("e.stopPropagation");
                if (showGoToCart) {
                  console.log("open cart popup");
                  dispatch(openCartPopup());
                } else {
                  console.log("handle add to cart click");
                  console.log("e", e);
                  handleAddToCartClick(e);
                  console.log("handle add to cart click");
                }
              }}
              className="w-full btn py-3.5 md:text-base !text-sm focus:outline-none flex items-center justify-center"
              style={{
                backgroundColor: addToCartButtonBackgroundColor,
                color: addToCartButtonTextColor,
                borderColor: addToCartButtonBorderColor,
              }}
            >
              {showGoToCart ? "Go to Cart" : "Add to Cart"}
            </button>
          )}
          <button
            name="Buy Now"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWholesaler && product?.variations?.length > 0) {
                const variantToUse = userSelectedVariant;
                if (!variantToUse) {
                  setModalActionType("buyNow");
                  setShowSizeModal(true);
                  return;
                }
                onBuyNow?.(e, product, variantToUse);
              } else {
                onBuyNow?.(e, product, selectedVariant || null);
              }
            }}
            className={`z-10 w-full cart-btn py-3 sm:py-3.5 sm:px-3 !px-2 cursor-pointer border ${
              themeId === 5 || themeId === 6 ? "!rounded-none" : "rounded-2xl"
            } text-white text-base focus:outline-none flex items-center justify-center `}
            style={{
              color: buyNowButtonTextColor,
              backgroundColor: buyNowButtonBackgroundColor,
              borderColor: buyNowButtonBorderColor,
            }}
          >
            Buy Now
          </button>
        </>
      );
    }

    return (
      <button
        name="Add to Cart"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (showGoToCart) {
            dispatch(openCartPopup());
          } else {
            handleAddToCartClick(e);
          }
        }}
        className={`z-10 w-full cart-btn py-3 sm:py-3.5 sm:px-3 !px-2 cursor-pointer border ${
          themeId === 5 || themeId === 6 ? "!rounded-none" : "rounded-2xl"
        }  text-base focus:outline-none flex items-center justify-center `}
        style={{
          color: addToCartButtonTextColor,
          backgroundColor: addToCartButtonBackgroundColor,
          borderColor: addToCartButtonBorderColor,
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <Icon name="cart" size={18} />
          {showGoToCart ? "Go to Cart" : "Add to Cart"}
        </span>
      </button>
    );
  };

  // Render product info
  const renderProductInfo = () => {
    const categoryName =
      product?.sub_category?.sub_category_name ||
      product?.sub_category_name ||
      product?.category?.name ||
      product?.category_name ||
      null;

    return (
      <div
        className={`product-cont flex flex-col text-start justify-between flex-grow ${
          themeId === 6 ? "space-y-3" : "gap-[0.5rem]"
        }`}
      >
        <div className="flex gap-2 flex-col">
          {isWishlist && (
            <h6
              className={`text-sm font-normal ${
                product.added_to_wishlist ? "block mb-2" : "hidden"
              }`}
              style={{
                color: themeId === 6 ? "#64748b" : "#AAAAAA",
              }}
            >
              {product.added_to_wishlist}
            </h6>
          )}

          {themeId === 6 && categoryName && (
            <p
              className="text-[10px] uppercase tracking-[0.15em] font-medium"
              style={{
                color: "#64748b",
              }}
            >
              {categoryName}
            </p>
          )}

          {(product?.alternate_name || product?.name) && (
            <h3
              className={`font-semibold line-clamp-1 leading-tight ${
                themeId === 6
                  ? "text-base md:text-lg transition-colors"
                  : "text-[1.125rem]"
              }`}
              style={{
                color:
                  themeId === 6 ? headerTextColor : themeContext?.bodyTextColor,
              }}
            >
              {product.alternate_name || product.name}
            </h3>
          )}

          {showDescription && description && (
            <p
              className="text-sm line-clamp-2"
              style={{
                color: themeId === 6 ? textColor : undefined,
              }}
            >
              {description}
            </p>
          )}

          {renderRating()}

          {showPrice &&
            displayedPrice?.final_price !== undefined &&
            displayedPrice?.final_price !== 0 && (
              <div
                className={`flex items-baseline gap-2 sm:gap-3 product-cont-size ${
                  themeId === 6 ? "pt-2 border-t" : ""
                }`}
                style={
                  themeId === 6
                    ? { borderColor: themeContext?.buttonBackgroundColor }
                    : {}
                }
              >
                <p
                  className={`font-bold text-base sm:text-[1.125rem] ${
                    themeId === 6 ? "md:text-lg" : ""
                  }`}
                  style={{
                    margin: 0,
                    color: textColor,
                  }}
                >
                  ₹{displayedPrice.final_price}
                </p>
                {showOldPrice &&
                  displayedPrice.old_price &&
                  displayedPrice.old_price !== null && (
                    <p
                      className={`font-normal line-through ${
                        themeId === 6 ? "text-sm text-[#64748b]" : "opacity-40"
                      }`}
                      style={{ margin: 0 }}
                    >
                      ₹{displayedPrice.old_price}
                    </p>
                  )}
              </div>
            )}

          {renderVariants()}
        </div>

        {isWishlistKey && themeId !== 3 && (
          <button
            name="Remove From Wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRemoveFromWishlist) onRemoveFromWishlist(product);
            }}
            className="text-sm font-normal underline text-start cursor-pointer z-10"
          >
            Remove From Wishlist
          </button>
        )}
      </div>
    );
  };

  // Layout: Theme 1 (Default)
  const renderTheme1Layout = () => {
    if (themeId === 6) {
      return (
        <Card
          className="product-card group text-start relative card-element cursor-pointer h-full"
          data-product-id={
            product?.retailer_product_id || product?.product_id || product?.id
          }
          onClick={handleCardClick}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: `${themeContext?.bottomFooterBackgroundColor}1A`,
            border: `1px solid ${themeContext?.bottomFooterBackgroundColor}`,
            borderRadius: "0",
          }}
          applyBaseClasses={true}
        >
          {showImage && (
            <div
              className="relative overflow-hidden bg-[#f0fdf4]"
              style={{ borderRadius: "0" }}
            >
              <div className="product-image-container">
                <div
                  className="new_product_card_image product-image-wrapper"
                  style={{ borderRadius: "0" }}
                >
                  <div
                    className="w-full h-full absolute top-0 left-0 transition-transform duration-500"
                    style={{
                      transform: `rotate(${imageRotation}deg)`,
                    }}
                  >
                    <SafeImage
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={productImage}
                      alt={
                        product?.alternate_name ||
                        product?.name ||
                        "Product Image"
                      }
                      width={400}
                      height={400}
                      wholesalerId={product?.wholesaler_id}
                      enableExifRotation={true}
                    />
                  </div>

                  {badge ? renderBadge() : renderDiscount()}

                  <button
                    name="Rotate Image"
                    onClick={handleImageRotation}
                    className="absolute bottom-3 right-6 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 cursor-pointer"
                    title="Rotate Image"
                    aria-label="Rotate Image"
                  >
                    <RotateCw size={16} className="text-gray-700" />
                  </button>

                  {buttonPosition === "overlay" && renderActionButtons()}

                  {showAddToCart && !isWishlistKey && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-white backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 !rounded-none">
                      {product?.status === 0 || isOutOfStock ? (
                        <button
                          name="Out of Stock"
                          disabled
                          className="w-full cursor-not-allowed rounded-sm py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-md bg-gray-400 text-white opacity-60"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          name="Add to Cart"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (showGoToCart) {
                              dispatch(openCartPopup());
                            } else {
                              handleAddToCartClick(e);
                            }
                          }}
                          className="w-full cursor-pointer rounded-sm py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                          style={{
                            backgroundColor: addToCartButtonBackgroundColor,
                            color: addToCartButtonTextColor,
                            borderColor: addToCartButtonBorderColor,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          {showGoToCart ? "Go to Cart" : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-3 md:p-5 space-y-3">{renderProductInfo()}</div>
        </Card>
      );
    }

    return (
      <Card
        className="product-card text-start relative card-element cursor-pointer h-full mb-2"
        data-product-id={
          product?.retailer_product_id || product?.product_id || product?.id
        }
        onClick={handleCardClick}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          ...(themeId === 4 || themeId === 5
            ? {
                borderRadius: themeId === 5 ? "0" : "1rem",
              }
            : {}),
        }}
        applyBaseClasses={true}
      >
        {showImage && (
          <div
            className="new_product_card_image mb-3 relative flex flex-col align-items-center justify-center"
            style={{
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              className="w-full h-full absolute top-0 left-0 z-8 transition-transform duration-500"
              style={{
                transform: `rotate(${imageRotation}deg)`,
              }}
            >
              <SafeImage
                src={productImage}
                alt={
                  product?.alternate_name || product?.name || "Product Image"
                }
                width={400}
                height={400}
                className="w-full h-full object-cover"
                wholesalerId={product?.wholesaler_id}
                enableExifRotation={true}
                isBlur={true}
              />
            </div>

            {((isOutOfStock && isWholesaler) || product?.final_price === 0) && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
                style={{ pointerEvents: "none" }}
              >
                <div className="text-white text-2xl font-bold uppercase tracking-wider">
                  Out of Stock
                </div>
              </div>
            )}
            {badge ? renderBadge() : renderDiscount()}
            {buttonPosition === "overlay" && renderActionButtons()}

            <button
              name="Rotate Image"
              onClick={handleImageRotation}
              className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 cursor-pointer"
              title="Rotate Image"
              aria-label="Rotate Image"
            >
              <RotateCw size={16} className="text-gray-700" />
            </button>
          </div>
        )}
        <div
          className="flex flex-col gap-3.5 justify-between flex-grow content-wrap"
          style={{
            backgroundColor: "transparent",
            padding: "0",
          }}
        >
          {renderProductInfo()}

          {showAddToCart &&
            !isWishlistKey &&
            displayedPrice?.final_price !== 0 && (
              <div className="w-full mt-auto flex sm:flex-row flex-col gap-2">
                {/* {product?.status !== 0 && !isOutOfStock && isWholesaler && (
                  <button
                    name="Add to Cart"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (showGoToCart) {
                        dispatch(openCartPopup());
                      } else {
                        handleAddToCartClick(e);
                      }
                    }}
                    className="w-full btn py-3.5 md:text-base !text-sm focus:outline-none flex items-center justify-center"
                    style={{
                      backgroundColor: addToCartButtonBackgroundColor,
                      color: addToCartButtonTextColor,
                      borderColor: addToCartButtonBorderColor,
                    }}
                  >
                    Add to Cart
                  </button>
                )} */}
                {renderAddToCartButton()}
              </div>
            )}
        </div>
      </Card>
    );
  };

  const renderLayout = () => {
    switch (layout) {
      case "theme1":
        return renderTheme1Layout();
      default:
        return renderTheme1Layout();
    }
  };

  return (
    <>
      {renderLayout()}
      <SelectSizeModal
        open={showSizeModal}
        setOpen={setShowSizeModal}
        product={product}
        variants={product?.variations || []}
        price={displayedPrice?.final_price}
        onVariantSelect={(variant: ProductVariant) => {
          if (onVariantSelect) {
            onVariantSelect(variant);
          }
          if (isWholesaler) {
            setUserSelectedVariant(variant);
            prevSelectedVariantId.current = variant?.id;
          }
        }}
        onAddToCart={handleModalAddToCart}
        onBuyNow={handleModalBuyNow}
        actionType={modalActionType}
      />
    </>
  );
};

export default CustomProductCardGrid;
