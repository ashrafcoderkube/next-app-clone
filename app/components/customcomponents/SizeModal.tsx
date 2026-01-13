"use client";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getProductImage, sortVariants } from "@/app/utils/common";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
  } from "@headlessui/react";
  import { AlertCircle } from "lucide-react";
  import { useState, useEffect, useMemo, useCallback } from "react";
import SafeImage from "../SafeImage";
  
  export default function SelectSizeModal({
    open,
    setOpen,
    product,
    variants = [],
    price,
    onVariantSelect,
    onAddToCart,
    onBuyNow,
    actionType = "addToCart", // 'addToCart' or 'buyNow'
  }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const themeContext = useTheme() || {};
    const { textColor } = themeContext;
    const getOppositeTextColor = (bg) => {
      if (!bg) return "#000";
      bg = bg.replace("#", "");
      const r = parseInt(bg.slice(0, 2), 16);
      const g = parseInt(bg.slice(2, 4), 16);
      const b = parseInt(bg.slice(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 140 ? "#000000" : "#ffffff";
    };
  
    // Reset selected variant when modal opens/closes
    useEffect(() => {
      if (!open) {
        setSelectedVariant(null);
      }
    }, [open]);
  
    // Memoize variant click handler
    const handleVariantClick = useCallback(
      (variant: any) => {
        if (variant?.stock > 0) {
          setSelectedVariant(variant);
          if (onVariantSelect) {
            onVariantSelect(variant);
          }
        }
      },
      [onVariantSelect]
    );
  
    // Memoize confirm handler
    const handleConfirm = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
  
        if (!selectedVariant) {
          return; // Don't proceed if no variant selected
        }
  
        if (actionType === "buyNow" && onBuyNow) {
          onBuyNow(e, product, selectedVariant);
        } else if (actionType === "addToCart" && onAddToCart) {
          onAddToCart(e, product, selectedVariant);
        }
  
        setOpen(false);
      },
      [selectedVariant, actionType, onBuyNow, onAddToCart, product, setOpen]
    );
  
    // Memoize cancel handler
    const handleCancel = useCallback(() => {
      setOpen(false);
      setSelectedVariant(null);
    }, [setOpen]);
  
    // Filter only in-stock variants and sort them (memoized)
    const availableVariants = useMemo(() => {
      const inStock = variants.filter((v: any) => v?.stock > 0);
      return sortVariants(inStock);
    }, [variants]);
  
    // Get product image (memoized)
    const productImage = useMemo(() => getProductImage(product), [product]);
  
    // Memoize selected variant price
    const selectedVariantPrice = useMemo(() => {
      if (!selectedVariant) return null;
      return (
        parseFloat(selectedVariant?.final_price) ||
        parseFloat(selectedVariant?.price) ||
        price ||
        0
      );
    }, [selectedVariant, price]);
  
    // Memoize selected variant old price
    const selectedVariantOldPrice = useMemo(() => {
      if (!selectedVariant?.old_price) return null;
      const currentPrice =
        parseFloat(selectedVariant?.final_price) ||
        parseFloat(selectedVariant?.price) ||
        0;
      return selectedVariant.old_price > currentPrice
        ? selectedVariant.old_price
        : null;
    }, [selectedVariant]);
  
    return (
      <>
        <Dialog open={open} onClose={handleCancel} className="relative z-50">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/40 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
          />
  
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <AlertCircle className="text-orange-500" size={28} />
                  </div>
                  <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Select Size Required
                  </DialogTitle>
                </div>
  
                {/* Product Image and Info */}
                <div className="flex gap-4 mb-4">
                  {/* Product Image */}
                  {productImage && (
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-200/40 bg-gray-50">
                        <SafeImage
                          width={80}
                          height={80}
                          src={productImage}
                          alt={product?.name || "Product Image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
  
                  {/* Product Name and Price */}
                  <div className="flex-1 min-w-0">
                    {/* Product Name */}
                    {product?.alternate_name && (
                      <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.alternate_name}
                      </h4>
                    )}
  
                    {/* Price */}
                    <div>
                      {selectedVariantPrice !== null ? (
                        <div className="flex gap-2 items-center flex-wrap">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{selectedVariantPrice}
                          </p>
                          {selectedVariantOldPrice && (
                            <p className="text-sm font-normal line-through opacity-40 text-gray-600">
                              ₹{selectedVariantOldPrice}
                            </p>
                          )}
                        </div>
                      ) : price !== undefined ? (
                        <p className="text-lg font-bold text-gray-900">
                          ₹{price}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
  
                {/* Variants Selection */}
                {availableVariants.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Available Sizes:
                    </p>
                    <div className="flex flex-row flex-wrap gap-2">
                      {availableVariants.map((variant: any, index: number) => {
                        const isSelected = selectedVariant?.id === variant?.id;
                        return (
                          <button
                            key={variant?.id || index}
                            onClick={() => handleVariantClick(variant)}
                            className={`border-radius-xl px-4 py-2 min-w-[50px] flex items-center justify-center border text-sm uppercase cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "text-white"
                                : "text-gray-700 hover:border-gray-400"
                            }`}
                            style={
                              isSelected
                                ? {
                                    color: getOppositeTextColor(textColor), // 👈 only text
                                    backgroundColor: textColor,
                                    borderColor: `${themeContext?.buttonBackgroundColor}1A`,
                                  }
                                : {
                                    color: textColor,
                                    backgroundColor:
                                      getOppositeTextColor(textColor),
                                    borderColor: `${textColor}1A`,
                                  }
                            }
                            disabled={variant?.stock <= 0}
                          >
                            {variant?.variation}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedVariant && (
                      <p className="text-xs text-orange-600 mt-2">
                        Please select a size to continue
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-4">
                    No sizes available for this product.
                  </p>
                )}
              </div>
  
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  onClick={handleCancel}
                  className="cursor-pointer inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedVariant}
                  className={`cursor-pointer inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold transition border ${
                    selectedVariant ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    backgroundColor: themeContext?.buttonBackgroundColor,
                    color: themeContext?.buttonTextColor,
                    borderColor: themeContext?.buttonBorderColor,
                  }}
                >
                  {actionType === "buyNow" ? "Buy Now" : "Add to Cart"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </>
    );
  }
  