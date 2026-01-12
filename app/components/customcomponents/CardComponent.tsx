"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CustomProductCardGrid from "./CustomProductCardGrid";
import CustomProductCardList from "./CustomProductCardList";
import { useAppSelector, useAppDispatch } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import { getWhatsappLink, isInWishlist, sortVariants } from "@/app/utils/common";
import {
  getCartQuantityForProduct,
  getCartQuantityForVariant,
  MAX_GUEST_CART_PRODUCT_QUANTITY,
  MAX_GUEST_CART_VARIANT_QUANTITY,
} from "@/app/utils/cartItemUtils";
import { addToCart } from "@/app/redux/slices/cartSlice";
import { trackAddToCart } from "@/app/utils/analytics";
import { sendEvent } from "@/app/utils/facebookAnalytics";
import { setBuyNowProduct } from "@/app/redux/slices/checkoutSlice";
import {
  addToWishListData,
  removeFromWishList,
} from "@/app/redux/slices/wishlistSlice";
import useCartQuantity from "@/app/hooks/useCartQuantity";

interface ProductVariant {
  id: number;
  variation: string;
  final_price: number;
  price: number;
  old_price: number | null;
  stock: number;
  image?: string;
}

interface Product {
  id: number | string;
  product_id?: number | string;
  retailer_product_id?: number | string;
  retailer_id?: number;
  wholesaler_id?: number;
  name?: string;
  alternate_name?: string;
  product_name?: string;
  slug?: string;
  product_slug?: string;
  final_price: number;
  new_price?: number;
  price?: number;
  old_price: number | null;
  status: number;
  quantity: number;
  product_images?: string[];
  cover_image?: string;
  variations?: ProductVariant[];
  sub_category?: { sub_category_name: string };
  sub_category_name?: string;
  category?: { name: string };
  category_name?: string;
  added_to_wishlist?: string;
  added_on?: string;
  wishlist_id?: number;
  catalog_id?: number | null;
  globalRule?: string;
  duplicate_rule?: string;
  currency?: string;
}

interface CardComponentProps {
  product: Product;
  isWishlistKey?: boolean;
  viewMode?: "grid" | "list";
}

const CardComponent = ({
  product,
  isWishlistKey = false,
  viewMode = "grid",
}: CardComponentProps) => {
  const productData: Product = isWishlistKey
    ? {
      name: product.alternate_name || product.name, 
      slug: product.product_slug || product.slug,
      final_price: product.new_price || product.price || product.final_price,
      old_price: product.old_price,
      product_images: product.product_images,
      id: product.retailer_product_id || product.product_id || product.id,
      product_id: product.product_id,
      retailer_product_id: product.retailer_product_id,
      retailer_id: product.retailer_id,
      wholesaler_id: product.wholesaler_id,
      added_to_wishlist: product.added_on,
      cover_image: product.cover_image,
      status: product.status || 1,
      quantity: product.quantity || 0,
      variations: product.variations,
      sub_category: product.sub_category,
      sub_category_name: product.sub_category_name,
      category: product.category,
      category_name: product.category_name,
      catalog_id: product.catalog_id,
      globalRule: product.globalRule,
      duplicate_rule: product.duplicate_rule,
      currency: product.currency,
    }
    : product;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { storeInfo, isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );
  const { wishlist } = useAppSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const phone_number = storeInfo?.data?.storeinfo?.mobile_no;
  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  // subdomain is not in StoreInfoData type, using window.location.origin as fallback
  const subdomain = typeof window !== "undefined" ? window.location.origin : null;
  const wishlistData = wishlist?.data?.wishlist;
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);
  const isWishlist =
    (isAuthenticated && isInWishlist(productData?.id, wishlistData)) || false;
  const getProductPrice = () => {
    const hasVariations =
      Array.isArray(productData?.variations) &&
      productData.variations.length > 0;

    // Case 1: No catalog_id OR no variations → show default behavior
    const isSimpleProduct = productData?.catalog_id === null || !hasVariations;

    if (isSimpleProduct) {
      if (hasVariations) {
        const variationWithStock = productData.variations.find(
          (v) => v.stock > 0
        );
        const selectedVariation =
          variationWithStock || productData.variations[0];

        return {
          final_price:
            parseFloat(String(selectedVariation?.final_price)) ||
            parseFloat(String(selectedVariation?.price)) ||
            0,
          old_price: selectedVariation?.old_price || null,
        };
      } else {
        return {
          final_price: parseFloat(String(productData?.final_price)) || 0,
          old_price: productData?.old_price || null,
        };
      }
    }

    // Case 2: This is a catalog product → apply globalRule/duplicate_rule
    if (!hasVariations) {
      return {
        final_price: parseFloat(String(productData?.final_price)) || 0,
        old_price: productData?.old_price || null,
      };
    }

    // Filter in-stock variations first, fallback to all if none in stock
    const inStockVariations = productData.variations.filter(
      (v) => v.stock > 0
    );
    const variationsToConsider =
      inStockVariations.length > 0
        ? inStockVariations
        : productData.variations;

    // Helper to get numeric price
    const getPrice = (v: ProductVariant) =>
      parseFloat(String(v.final_price)) || parseFloat(String(v.price)) || 0;

    let selectedVariation: ProductVariant;

    // Use duplicate_rule if available, otherwise use globalRule
    const rule = productData?.duplicate_rule || productData?.globalRule;

    if (rule === "lowest") {
      selectedVariation = variationsToConsider.reduce((lowest, current) =>
        getPrice(current) < getPrice(lowest) ? current : lowest
      );
    } else {
      // Default = highest price (or any rule other than "lowest")
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

  // Initialize variant with first available variant from sorted list if variants exist
  useEffect(() => {
    if (productPrice?.selectedVariation) {
      setSelectedVariant(productPrice?.selectedVariation);
    } else if (
      productData?.variations?.length > 0 &&
      !selectedVariant
    ) {
      // Use sorted variants to get first in-stock variant
      const sortedVariants =
        sortVariants(productData.variations) ||
        productData.variations;
      const firstAvailableVariant = sortedVariants.find((v) => v?.stock > 0);
      if (firstAvailableVariant) {
        setSelectedVariant(firstAvailableVariant);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData?.variations]);

  const productIdentity = useMemo(
    () => ({
      product_id: product?.product_id ?? product?.id ?? null,
      id: product?.id ?? product?.product_id ?? null,
      retailer_product_id: product?.retailer_product_id ?? null,
      product_slug: product?.slug ?? product?.product_slug ?? null,
    }),
    [
      product?.id,
      product?.product_id,
      product?.retailer_product_id,
      product?.slug,
      product?.product_slug,
    ]
  );

  const cartQuantity = useMemo(
    () =>
      getCartQuantityForVariant(
        cartItems,
        productIdentity,
        selectedVariant || null
      ),
    [cartItems, productIdentity, selectedVariant]
  );

  const cartProductQuantity = useMemo(
    () => getCartQuantityForProduct(cartItems, productIdentity),
    [cartItems, productIdentity]
  );

  const baseStock = selectedVariant?.stock ?? product?.quantity ?? 0;

  const totalInCart = cartQuantity || 0;

  const hasReachedVariantLimit =
    cartQuantity >= MAX_GUEST_CART_VARIANT_QUANTITY;
  const hasReachedProductLimit =
    cartProductQuantity >= MAX_GUEST_CART_PRODUCT_QUANTITY;
  const showGoToCart = isWholesaler
    ? cartQuantity >= 1
    : hasReachedVariantLimit || hasReachedProductLimit;

  const availableStock = Math.max(0, baseStock - totalInCart);

  const { quantity } = useCartQuantity({
    initial: 1,
    availableStock,
    currentVariantQuantity: cartQuantity,
    totalProductQuantity: cartProductQuantity,
    variantLimit: MAX_GUEST_CART_VARIANT_QUANTITY,
    productLimit: MAX_GUEST_CART_PRODUCT_QUANTITY,
    resetKey: selectedVariant?.id,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e?.preventDefault();
    if (availableStock === 0) {
      toast.warning("Out of Stock");
    } else if (totalInCart + quantity > availableStock) {
      toast.warning("Cannot add more than available stock");
    } else if (product.variations?.length > 0) {
      if (selectedVariant) {
        dispatch(
          addToCart({
            item: {
              ...product,
              selectedVariant: {
                id: selectedVariant.id,
                variation: selectedVariant.variation,
                final_price:
                  selectedVariant.final_price || selectedVariant.price,
                stock: selectedVariant.stock,
              },
            },
            quantity,
          })
        );
      } else {
        toast.warning("Please select a size");
      }
    } else {
      dispatch(
        addToCart({
          item: {
            ...product,
          },
          quantity,
        })
      );
    }
  };

  const sendAddToCartEvent = () => {
    sendEvent("AddToCart", product);
    trackAddToCart(product, quantity);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const hasVariants = productData?.variations?.length > 0;

    if (hasVariants && !selectedVariant) {
      toast.warn("Please select a variant");
      return;
    }

    const payload = {
      quantity: 1,
      alternate_name: productData?.alternate_name || productData?.name,
      images: productData?.product_images || productData?.cover_image,
      product_stock: selectedVariant?.stock ?? productData?.quantity ?? 0,
      wishlist_id: productData?.wishlist_id ?? null,
      final_price: Number(
        selectedVariant?.price ??
        selectedVariant?.final_price ??
        productData?.final_price ??
        productData?.new_price ??
        0
      ).toFixed(2),
      retailer_id: productData?.retailer_id,
      wholesaler_id: productData?.wholesaler_id,
      id: productData?.id,
      product_slug: productData?.slug,
      selected_variant: selectedVariant
        ? {
          id: selectedVariant.id,
          variation: selectedVariant.variation,
          final_price: selectedVariant.price || selectedVariant.final_price,
          stock: selectedVariant.stock,
        }
        : null,
    };

    dispatch(setBuyNowProduct({ product: payload, quantity: 1 }));
    router.push("/checkout");
  };

  const addToWishList = () => {
    if (isAuthenticated) {
      if (isWishlist) {
        const payload = {
          product_id: productData?.id,
          // retailer_product_id: productData?.retailer_id
          //   ? productData?.id
          //   : null,
        };
        dispatch(removeFromWishList(payload));
      } else {
        const payload = {
          product_id: productData?.id,
          // retailer_id: productData?.wholesaler_id
          //   ? null
          //   : productData?.retailer_id,
          // wholesaler_id: productData?.retailer_id
          //   ? null
          //   : productData?.wholesaler_id,
        };
        dispatch(addToWishListData(payload));
      }
    } else {
      router.push("/signin");
    }
  };

  const removeDataFromWishlist = ({
    product_id,
    retailer_product_id,
  }: {
    product_id?: number | string;
    retailer_product_id?: number | string;
  }) => {
    const payload: {
      retailer_product_id?: string | number | "";
      product_id?: string | number | "";
    } = {
      // retailer_product_id: retailer_product_id ? retailer_product_id : "",
      product_id: !retailer_product_id ? product_id : "",
    };
    dispatch(removeFromWishList(payload));
  };

  // Grid View Layout - Using CustomProductCardGrid
  const renderGridView = () => (
    <CustomProductCardGrid
      product={productData}
      layout="overlay"
      showImage={true}
      showDiscount={false}
      showWishlist={themeId !== 3 ? !isWishlistKey : true}
      showWhatsApp={storeInfo?.data?.storeinfo?.enquiry_whatsapp === 1}
      showAddToCart={true}
      showVariants={true}
      showPrice={true}
      isWholesaler={isWholesaler}
      showOldPrice={true}
      buttonPosition="overlay"
      isWishlist={isWishlist}
      isWishlistKey={isWishlistKey}
      selectedVariant={selectedVariant}
      onProductClick={() => {
        // Store navigation context and product position for shop page
        if (typeof window !== "undefined") {
          sessionStorage.setItem("navigatingFromShop", "true");
          // Store a stable product identifier for scrolling back
          const productIdentifier = productData?.retailer_product_id || productData?.product_id || productData?.id;
          if (productIdentifier) {
            sessionStorage.setItem("scrollToProductId", String(productIdentifier));
          }
        }
        router.push(`/product/${productData?.id}`);
      }}
      onAddToCart={(e) => {
        sendAddToCartEvent();
        handleAddToCart(e);
      }}
      onWishlistToggle={
        isWishlist
          ? () =>
            removeDataFromWishlist({
              product_id: productData.id,
            })
          : addToWishList
      }
      onWhatsAppClick={(e) =>
        getWhatsappLink(e, productData, phone_number, subdomain, selectedVariant)
      }
      onVariantSelect={(variant) => setSelectedVariant(variant as ProductVariant)}
      onRemoveFromWishlist={() =>
        removeDataFromWishlist({
          product_id: productData.id,
        })
      }
      onBuyNow={handleBuyNow}
      showGoToCart={showGoToCart}
    />
  );

  const renderListView = () => (
    <CustomProductCardList
      product={productData}
      showImage={true}
      showPrice={true}
      showOldPrice={true}
      showVariants={true}
      isWishlist={isWishlist}
      showWishlist={themeId !== 3 ? !isWishlistKey : true}
      showWhatsApp={storeInfo?.data?.storeinfo?.enquiry_whatsapp === 1}
      isWishlistKey={isWishlistKey}
      isWholesaler={isWholesaler}
      selectedVariant={selectedVariant}
      onProductClick={() => {
        // Store navigation context and product position for shop page
        if (typeof window !== "undefined") {
          sessionStorage.setItem("navigatingFromShop", "true");
          // Store a stable product identifier for scrolling back
          const productIdentifier = productData?.retailer_product_id || productData?.product_id || productData?.id;
          if (productIdentifier) {
            sessionStorage.setItem("scrollToProductId", String(productIdentifier));
          }
        }
        router.push(`/product/${productData?.id}`);
      }}
      onAddToCart={(e) => {
        sendAddToCartEvent();
        handleAddToCart(e);
      }}
      onBuyNow={handleBuyNow}
      onWishlistToggle={addToWishList}
      onWhatsAppClick={(e) =>
        getWhatsappLink(e, productData, phone_number, subdomain, selectedVariant)
      }
      onVariantSelect={(variant) => setSelectedVariant(variant as ProductVariant)}
      onRemoveFromWishlist={() =>
        removeDataFromWishlist({
          product_id: productData.product_id,
          retailer_product_id: productData.retailer_product_id,
        })
      }
      showGoToCart={showGoToCart}
    />
  );

  return <>{viewMode === "list" ? renderListView() : renderGridView()}</>;
};

export default CardComponent;
