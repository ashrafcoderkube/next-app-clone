"use client";

import React from "react";
import { RotateCw } from "lucide-react";
import Icon from "./Icon";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import { useTheme } from "../../contexts/ThemeContext";
import { getProductImage, sortVariants } from "../../utils/common";
import whatsappIcon from "../../assets/Whatsapp.svg";
import { openCartPopup } from "../../redux/slices/cartSlice";
import SafeImage from "../SafeImage";

// Product data structure
interface ProductVariant {
  id: number;
  variation?: string;
  price: number;
  final_price: number;
  old_price: number | null;
  stock: number;
  image?: string;
}

interface Product {
  id: number | string;
  name?: string;
  alternate_name?: string;
  final_price: number;
  old_price: number | null;
  status: number;
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
  wholesaler_id?: number;
  retailer_product_id?: number | string;
  product_id?: number | string;
  retailer_id?: number;
}

interface CustomProductCardListProps {
  product: Product;
  // Visibility Controls
  showImage?: boolean;
  showPrice?: boolean;
  showOldPrice?: boolean;
  showVariants?: boolean;
  showWishlist?: boolean;
  showWhatsApp?: boolean;
  showGoToCart?: boolean;
  // State Props
  isWishlist?: boolean;
  isWishlistKey?: boolean;
  isWholesaler?: boolean;
  selectedVariant?: ProductVariant | null;
  // Event Handlers
  onProductClick?: (product: Product) => void;
  onAddToCart?: (e: React.MouseEvent) => void;
  onBuyNow?: (e: React.MouseEvent) => void;
  onWishlistToggle?: () => void;
  onWhatsAppClick?: (e: React.MouseEvent) => void;
  onVariantSelect?: (variant: ProductVariant) => void;
  onRemoveFromWishlist?: () => void;
  sendAddToCartEvent?: () => void;
}

const CustomProductCardList = ({
  product,
  // Visibility Controls
  showImage = true,
  showPrice = true,
  showOldPrice = true,
  showVariants = true,
  showWishlist = true,
  showWhatsApp = false,
  showGoToCart = false,

  // State Props
  isWishlist = false,
  isWishlistKey = false,
  isWholesaler = false,
  selectedVariant = null,

  // Event Handlers
  onProductClick,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  onWhatsAppClick,
  onVariantSelect,
  onRemoveFromWishlist,
  sendAddToCartEvent,
}: CustomProductCardListProps) => {
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;
  const dispatch = useAppDispatch();
  const [imageRotation, setImageRotation] = React.useState(0);

  const productImage = getProductImage(product);

  // Reset rotation when product changes
  React.useEffect(() => {
    setImageRotation(0);
  }, [product?.id]);

  const handleImageRotation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // Get sorted variants for default selection
  const sortedVariantsForDefault = React.useMemo(() => {
    const variants = product?.variations || [];
    if (!variants?.length) return [];
    return sortVariants(variants) || variants;
  }, [product?.variations]);

  // Get first in-stock variant from sorted list for default selection
  const firstInStockSortedVariant = React.useMemo(() => {
    if (!sortedVariantsForDefault.length) return null;
    // Find first in-stock variant, or fallback to first variant if none in stock
    const inStockVariant = sortedVariantsForDefault.find((v) => v.stock > 0);
    return inStockVariant || sortedVariantsForDefault[0];
  }, [sortedVariantsForDefault]);

  // Use selectedVariant if provided (user selection), otherwise default to first sorted variant
  // This ensures the first variant from sorted list (e.g., "S" from "S, M, L, XXL") is selected by default
  const effectiveSelectedVariant = selectedVariant || firstInStockSortedVariant;

  // Track if we've already set the default variant for this product
  const hasSetDefaultVariant = React.useRef(false);
  const lastProductId = React.useRef(null);

  // Notify parent component to sync selectedVariant with first sorted variant (only on initial load)
  // Use timeout to ensure it runs after parent's initialization
  React.useEffect(() => {
    // Reset flag when product changes
    if (lastProductId.current !== product?.id) {
      hasSetDefaultVariant.current = false;
      lastProductId.current = product?.id;
    }

    // Only set default variant once per product, and only if no variant is currently selected
    if (
      !hasSetDefaultVariant.current &&
      !selectedVariant && // Only set default if no variant is selected
      firstInStockSortedVariant &&
      onVariantSelect
    ) {
      // Use timeout to ensure parent has finished initializing
      const timer = setTimeout(() => {
        // Update parent's selectedVariant to match first sorted variant
        // This ensures the first variant from sortVariants (e.g., "S") is selected
        onVariantSelect(firstInStockSortedVariant);
        hasSetDefaultVariant.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    product?.id,
    firstInStockSortedVariant?.id,
    selectedVariant?.id,
    onVariantSelect,
  ]);

  // -------------------------------------------------
  // VARIANT PRICE CALCULATION
  // -------------------------------------------------
  const getProductPrice = () => {
    const variations = product?.variations || [];
    const hasVariations = Array.isArray(variations) && variations.length > 0;

    const isSimpleProduct = product?.catalog_id === null || !hasVariations;

    if (isSimpleProduct) {
      if (hasVariations) {
        const variationWithStock = variations.find((v) => v.stock > 0);
        const selectedVariation = variationWithStock || variations[0];

        return {
          final_price:
            parseFloat(String(selectedVariation?.final_price)) ||
            parseFloat(String(selectedVariation?.price)) ||
            0,
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

    const inStockVariations = variations.filter((v) => v.stock > 0);
    const variationsToConsider =
      inStockVariations.length > 0 ? inStockVariations : variations;

    const getPrice = (v) =>
      parseFloat(String(v.final_price)) || parseFloat(String(v.price)) || 0;

    let selectedVariation;

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

  const displayedPrice = React.useMemo(() => {
    let priceData;
    if (effectiveSelectedVariant) {
      priceData = {
        final_price:
          parseFloat(String(effectiveSelectedVariant?.final_price)) ||
          parseFloat(String(effectiveSelectedVariant?.price)) ||
          0,
        old_price: effectiveSelectedVariant?.old_price || null,
      };
    } else {
      priceData = productPrice;
    }

    // Only show old_price if it's greater than final_price (indicating a discount)
    const finalPrice = priceData?.final_price || 0;
    const oldPrice = priceData?.old_price
      ? parseFloat(priceData.old_price)
      : null;

    return {
      final_price: finalPrice,
      old_price: oldPrice && oldPrice > finalPrice ? oldPrice : null,
    };
  }, [effectiveSelectedVariant, productPrice]);

  // Calculate available stock
  const getAvailableStock = () => {
    const variations = product?.variations || [];
    if (variations.length > 0) {
      // If variant is selected, use variant's stock
      if (effectiveSelectedVariant) {
        return effectiveSelectedVariant.stock || 0;
      }
      // If no variant selected, check if any variant has stock
      return variations.some((v) => v.stock > 0) ? 1 : 0;
    }
    // For products without variations, use product's quantity
    return product?.quantity || 0;
  };

  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock === 0;
  const getOppositeTextColor = (bg: string) => {
    if (!bg) return "#000";
    bg = bg.replace("#", "");

    const r = parseInt(bg.slice(0, 2), 16);
    const g = parseInt(bg.slice(2, 4), 16);
    const b = parseInt(bg.slice(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? "#000000" : "#ffffff";
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showGoToCart) {
      dispatch(openCartPopup());
    } else {
      if (onAddToCart) onAddToCart(e);
      if (sendAddToCartEvent) sendAddToCartEvent();
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBuyNow) onBuyNow(e);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) onWishlistToggle();
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWhatsAppClick) onWhatsAppClick(e);
  };

  const handleVariantClick = (variant: ProductVariant, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVariantSelect) onVariantSelect(variant);
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromWishlist) onRemoveFromWishlist();
  };
  const handleCardClick = () => {
    if (onProductClick) onProductClick(product);
  };

  return (
    <div
      className="product-card text-start relative card-element flex flex-row gap-3 md:gap-5 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
      style={{
        height: "auto",
        alignItems: "center",
        ...(themeId === 4 || themeId === 6
          ? {
              boxShadow:
                themeId === 6
                  ? "0 4px 6px rgba(16, 185, 129, 0.08), 0 2px 4px rgba(16, 185, 129, 0.05)"
                  : "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
            }
          : {}),
      }}
    >
      {/* Remove from Wishlist Button */}
      {isWishlistKey && (
        <button
          name="Remove from Wishlist"
          onClick={handleRemoveFromWishlist}
          className="flex-none w-10 h-10 p-2 transition-colors flex items-center justify-center sm:ml-0 cursor-pointer"
          title="Remove from Wishlist"
          style={{
            borderColor: `${textColor}2A`,
          }}
        >
          <Icon
            name="close"
            size={20}
            className="w-5 h-5 cursor-pointer text-black"
            strokeWidth="2"
            stroke={textColor}
          />
        </button>
      )}

      {/* Product Image */}
      {showImage && productImage && (
        <div
          className="group relative shrink-0 w-[140px] h-[140px] md:w-[150px] md:h-[150px] lg:w-[220px] lg:h-[220px]"
          style={{
            borderRadius: "1.125rem",
            overflow: "hidden",
            flexShrink: 0,
            flex: "0 0 auto",
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-full transition-transform duration-500"
            style={{
              transform: `rotate(${imageRotation}deg)`,
            }}
          >
            <SafeImage
              width={200}
              height={200}
              className="w-full h-full object-cover"
              src={productImage}
              alt={product?.name || "Product Image"}
              wholesalerId={product?.wholesaler_id}
              enableExifRotation={true}
              isBlur={true}
            />
          </div>

          {/* Rotation Icon Button - Bottom Right */}
          <button
            name="Rotate Image"
            onClick={handleImageRotation}
            className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 cursor-pointer"
            title="Rotate Image"
            aria-label="Rotate Image"
          >
            <RotateCw size={14} className="text-gray-700" />
          </button>

          {/* Hover Overlay - Add to Cart Button */}
          <div className="cart-hover-btn">
            {!isWishlistKey && (product?.status === 0 || isOutOfStock) ? (
              <button
                className={`w-full btn py-3.5 ${
                  themeId === 4 || themeId === 6
                    ? "rounded-2xl"
                    : "!rounded-none"
                }  text-base focus:outline-none flex items-center justify-center`}
                // style={{
                //   backgroundColor: themeId === 6 ? "#10b981" : "#101010",
                // }}
              >
                Out of Stock
              </button>
            ) : isWholesaler ? (
              <button
                onClick={handleBuyNowClick}
                className={`w-full btn py-3.5 border ${
                  themeId === 4 || themeId === 6
                    ? "rounded-2xl"
                    : "!rounded-none"
                } px-6 sm:px-[1.5rem] text-base focus:outline-none flex items-center justify-center`}
                style={{
                  backgroundColor: themeContext?.buyNowButtonBackgroundColor,
                  color: themeContext?.buyNowButtonTextColor,
                  borderColor: themeContext?.buyNowButtonBorderColor,
                }}
              >
                Buy Now
              </button>
            ) : (
              ""
              // <button
              //   onClick={handleAddToCartClick}
              //   className={`w-full btn py-3.5 ${
              //     themeId === 4 || themeId === 6
              //       ? "rounded-2xl"
              //       : themeId === 5
              //       ? "!rounded-none"
              //       : "!rounded-none"
              //   } px-6 sm:px-[1.5rem]  text-base focus:outline-none flex items-center justify-center`}
              //   // style={{
              //   //   backgroundColor: themeId === 6 ? "#10b981" : "#101010",
              //   // }}
              // >
              //   {showGoToCart ? "Go to Cart" : "Add to Cart"}
              // </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons Overlay (WhatsApp & Wishlist) */}
      <div className="hover-content absolute left-0 right-0 h-full pointer-events-none top-0">
        <div className="flex justify-between">
          {!isWishlistKey && (
            <div className="social-icon absolute flex sm:flex-row flex-col gap-2 top-[0.5rem] right-[0] pointer-events-auto z-10">
              {showWhatsApp && (
                <button
                  name="WhatsApp"
                  onClick={handleWhatsAppClick}
                  className={`bg-[#25D366] p-[9px] w-[2.625rem] h-[2.625rem] inline-block ${
                    themeId === 5 ? "rounded-none" : "rounded-[8px]"
                  } cursor-pointer`}
                >
                  <img src={whatsappIcon} alt="WhatsApp" />
                </button>
              )}

              {showWishlist && (
                <button
                  name="Wishlist"
                  onClick={handleWishlistClick}
                  className={`bg-[#1111116b] p-[9px] w-[2.625rem] h-[2.625rem] inline-block ${
                    themeId === 5 ? "rounded-none" : "rounded-[8px]"
                  } cursor-pointer`}
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
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-[0.5rem] text-start relative min-w-0">
        {/* Wishlist Added Date */}
        {isWishlist && product?.added_to_wishlist && (
          <h6 className="opacity-[0.5] text-sm font-normal">
            {product.added_to_wishlist}
          </h6>
        )}

        {/* Product Name */}
        {product?.name && (
          <h3
            className="sm:line-clamp-2 line-clamp-1 mb-[0.375rem] max-w-[150px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px] text-base sm:text-[1.125rem]"
            // style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}
          >
            {product.name}
          </h3>
        )}

        {/* Price */}
        {showPrice && displayedPrice?.final_price && (
          <div className="flex gap-2 items-center">
            <p
              className="font-bold"
              style={{
                margin: 0,
                fontSize: "1.25rem",
                color:
                  themeId === 3 || themeId === 4
                    ? themeContext?.buttonBackgroundColor
                    : themeId === 6
                    ? "#10b981"
                    : textColor,
              }}
            >
              ₹{displayedPrice.final_price}
            </p>
            {showOldPrice &&
              displayedPrice.old_price &&
              displayedPrice.old_price !== null && (
                <p
                  className="font-normal line-through opacity-40"
                  style={{ margin: 0, fontSize: "1rem" }}
                >
                  ₹{displayedPrice.old_price}
                </p>
              )}
          </div>
        )}

        {/* Product Variants */}
        {showVariants && product?.variations?.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2 w-[160px] sm:w-auto">
            {sortedVariantsForDefault.map((v, index) => {
              if (v?.stock <= 0) return null; // Hide out of stock variants
              const variantName = v?.product_variation || v?.variation || "";
              const isSelected =
                v?.id === effectiveSelectedVariant?.id ||
                variantName ===
                  (effectiveSelectedVariant?.product_variation ||
                    effectiveSelectedVariant?.variation);

              return (
                <span
                  key={v.id || variantName || index}
                  onClick={(e) => handleVariantClick(v, e)}
                  className={`leading-normal border-radius-xl px-[0.5rem] py-[0.24rem] min-w-[29px] flex items-center justify-center border text-sm uppercase cursor-pointer transition-all duration-200`}
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
                  {variantName}
                </span>
              );
            })}
          </div>
        )}
        {!isWishlistKey && (
          <div>
            <button
              name="Add to Cart"
              onClick={handleAddToCartClick}
              className={`btn sm:py-2.5 py-1.5 px-6 sm:px-[1.5rem]  text-base focus:outline-none flex items-center justify-center border`}
              style={{
                backgroundColor: themeContext?.addToCartButtonBackgroundColor,
                color: themeContext?.addToCartButtonTextColor,
                borderColor: themeContext?.addToCartButtonBorderColor,
              }}
            >
              {showGoToCart ? "Go to Cart" : "Add to Cart"}
            </button>
          </div>
        )}

        {/* View Details Button - Mobile */}
        {/* <div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
          <ButtonLink
            to={`/products/${product?.slug}`}
            className=" !sm:px-3 px-4 !py-[0.5rem]"
          >
            View Details
          </ButtonLink>
        </div> */}
      </div>

      {/* View Details Button - Desktop */}
      {/* <div
        className="relative z-10 hidden lg:block"
        onClick={(e) => e.stopPropagation()}
      >
        <ButtonLink to={`/products/${product?.slug}`}>View Details</ButtonLink>
      </div> */}
    </div>
  );
};

export default CustomProductCardList;
