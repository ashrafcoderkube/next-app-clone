"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import ProductSliderSection from "../../components/ProductSliderSection";
import whatsappIcon from "../../assets/Whatsapp.svg";
import whatsapp from "../../assets/Whatsapp2.svg";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  clearProductDetails,
  selectProductGalleryItems,
  setProductDetails,
} from "../../redux/slices/productSlice";
import {
  getOppositeTextColor,
  getWhatsappLink,
  isInWishlist,
  sortVariants,
} from "../../utils/common";
import {
  addToWishListData,
  removeFromWishList,
} from "../../redux/slices/wishlistSlice";
import { toast } from "react-toastify";
import { addToCart, openCartPopup } from "../../redux/slices/cartSlice";
import useCartQuantity from "../../hooks/useCartQuantity";
import LoadingButton from "../../components/customcomponents/LoadingButton";
import Loader from "../../components/customcomponents/Loader";
import Icon from "../../components/customcomponents/Icon";
import {
  LightboxSlider,
  ThumbsSlider,
} from "../../components/customcomponents/Slider";
import ShareDialog from "../../components/model/ShareModel";
import {
  getCartQuantityForProduct,
  getCartQuantityForVariant,
  MAX_GUEST_CART_VARIANT_QUANTITY,
  MAX_GUEST_CART_PRODUCT_QUANTITY,
} from "../../utils/cartItemUtils";
import { sendEvent } from "../../utils/facebookAnalytics";
import { trackAddToCart, trackProductView } from "../../utils/analytics";
import { setBuyNowProduct } from "../../redux/slices/checkoutSlice";
import { useTheme } from "../../contexts/ThemeContext";
import NotFound from "../../not-found/page";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import Image from "next/image";
import HtmlContent from "@/app/components/HtmlContent";

interface ProductDetailClientProps {
  initialProductData?: any;
  slug: string;
}

function ProductDetailClient({
  initialProductData,
  slug,
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variant");
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = React.useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [variant, setVariant] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoDownloadLoading, setVideoDownloadLoading] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);

  const themeId = useAppSelector((state: RootState) => state.storeInfo.themeId);
  const {
    productDetails,
    loading: productLoading,
    error,
  } = useAppSelector((state: RootState) => state.products);

  const { wishlist } = useAppSelector((state: RootState) => state.wishlist);
  const { storeInfo, isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { cartItems, addLoading } = useAppSelector(
    (state: RootState) => state.cart
  );
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;
  const subdomain = storeInfo?.data?.storeinfo?.subdomain;
  const phone_number = storeInfo?.data?.storeinfo?.mobile_no;
  const product = productDetails;
  const wishlistData = wishlist?.data?.wishlist;
  const productPrice = variant || product;
  const productRef = useRef(false);
  const productImg = React.useMemo(
    () => (Array.isArray(product?.images) ? product.images : []),
    [product?.images]
  );
  const galleryItems = useAppSelector(selectProductGalleryItems);

  const isWishlist =
    (isAuthenticated && isInWishlist(product?.id, wishlistData)) || false;

  // eslint-disable-next-line no-unused-vars
  const [thumbHeight, setThumbHeight] = useState("515px");
  // eslint-disable-next-line no-unused-vars
  const [mainHeight, setMainHeight] = useState("400px");
  const mainContainerRef = useRef(null);
  const thumbContainerRef = useRef(null);

  // Set initial product data from server-side fetch
  useEffect(() => {
    if (
      initialProductData &&
      initialProductData.success &&
      initialProductData.data
    ) {
      dispatch(setProductDetails(initialProductData.data));
    }
  }, [initialProductData, dispatch]);

  const addToWishList = useCallback(() => {
    if (isAuthenticated) {
      if (isWishlist) {
        const payload = {
          product_id: product?.id,
          // retailer_product_id: product?.retailer_id ? product?.id : null,
        };
        dispatch(removeFromWishList(payload));
      } else {
        const payload = {
          product_id: product?.id,
          // retailer_id: product?.wholesaler_id ? null : product?.retailer_id,
          // wholesaler_id: product?.retailer_id ? null : product?.wholesaler_id,
        };
        dispatch(addToWishListData(payload));
      }
    } else {
      router.push("/signin");
    }
  }, [isAuthenticated, isWishlist, product?.id, dispatch, router]);

  useEffect(() => {
    if (product?.id) {
      trackProductView(product);
      sendEvent("ViewContent", product);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch]);

  useEffect(() => {
    if (product?.variations?.length > 0) {
      let selectedVariant = null;

      // Get sorted variants for consistent ordering
      const sortedVariants =
        sortVariants(product.variations) || product.variations;

      if (variantId) {
        const decodedVariantId = decodeURIComponent(variantId);
        selectedVariant = sortedVariants.find(
          (v) => v.variation === decodedVariantId && v.stock > 0
        );
      }

      if (!selectedVariant) {
        // Use first in-stock variant from sorted list, or first variant if none in stock
        selectedVariant =
          sortedVariants.find((v) => v.stock > 0) || sortedVariants[0];
      }

      setVariant(selectedVariant);

      if (selectedVariant && selectedVariant.variation !== variantId) {
        const newSearchParams = new URLSearchParams();
        newSearchParams.set(
          "variant",
          encodeURIComponent(selectedVariant.variation)
        );
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }
    } else {
      setVariant(null);
    }
  }, [product?.variations, variantId, router, pathname]);

  const handleVariantSelect = useCallback(
    (selectedVariant) => {
      setVariant(selectedVariant);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(
        "variant",
        encodeURIComponent(String(selectedVariant.variation).toUpperCase())
      );

      window.history.replaceState(
        {
          ...window.history.state,
          as: pathname,
          search: newSearchParams.toString(),
        },
        "",
        `${pathname}?${newSearchParams.toString()}`
      );
    },
    [searchParams, pathname]
  );

  // Calculate discount - only if old_price is greater than final_price
  const discount = useMemo(
    () =>
      productPrice?.old_price &&
      productPrice?.final_price &&
      parseFloat(productPrice.old_price) > parseFloat(productPrice.final_price)
        ? (
            ((productPrice?.old_price - productPrice?.final_price) /
              productPrice?.old_price) *
            100
          ).toFixed(0)
        : 0,
    [productPrice?.old_price, productPrice?.final_price]
  );

  const selectedVariant = useMemo(
    () =>
      product?.variations?.length > 0 &&
      product?.variations?.find((v) => v.variation === variant?.variation),
    [product?.variations, variant?.variation]
  );

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

  const baseStock = useMemo(
    () => selectedVariant?.stock ?? product?.quantity ?? 0,
    [selectedVariant?.stock, product?.quantity]
  );

  const totalInCart = useMemo(() => cartQuantity || 0, [cartQuantity]);

  const hasReachedVariantLimit = useMemo(
    () => cartQuantity >= MAX_GUEST_CART_VARIANT_QUANTITY,
    [cartQuantity]
  );
  const hasReachedProductLimit = useMemo(
    () => cartProductQuantity >= MAX_GUEST_CART_PRODUCT_QUANTITY,
    [cartProductQuantity]
  );
  const showGoToCart = useMemo(
    () =>
      isWholesaler
        ? cartQuantity >= 1
        : hasReachedVariantLimit || hasReachedProductLimit,
    [isWholesaler, cartQuantity, hasReachedVariantLimit, hasReachedProductLimit]
  );

  const availableStock = useMemo(
    () => Math.max(0, baseStock - totalInCart),
    [baseStock, totalInCart]
  );

  // Memoize sorted product variations
  const sortedProductVariations = useMemo(
    () => sortVariants(product?.variations || []),
    [product?.variations]
  );

  const { quantity, increase, decrease, canIncrease, canDecrease } =
    useCartQuantity({
      initial: 1,
      availableStock,
      currentVariantQuantity: cartQuantity,
      totalProductQuantity: cartProductQuantity,
      variantLimit: MAX_GUEST_CART_VARIANT_QUANTITY,
      productLimit: MAX_GUEST_CART_PRODUCT_QUANTITY,
      resetKey: selectedVariant?.id,
      // onChange: (newQty, action) => {
      //   const quantityChange = action === "increase" ? 1 : -1;
      //   dispatch(updateCartItem({ item, qty: quantityChange }));
      // },
    });

  const handleAddToCart = useCallback(() => {
    // e.stopPropagation();
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
  }, [
    availableStock,
    totalInCart,
    quantity,
    product,
    selectedVariant,
    dispatch,
  ]);

  const sendAddToCartEvent = useCallback(() => {
    sendEvent("AddToCart", product);
    trackAddToCart(product, quantity);
  }, [product, quantity]);

  const handleSlideChange = useCallback(
    (swiper) => {
      setActiveIndex(swiper.activeIndex);
      if (thumbsSwiper) {
        thumbsSwiper.slideTo(swiper.activeIndex);
      }
      setTimeout(() => {
        if (mainContainerRef.current) {
          const currentImg = mainContainerRef.current.querySelector("img");
          if (currentImg && currentImg.complete) {
            const containerWidth = mainContainerRef.current.offsetWidth;
            const aspectRatio =
              currentImg.naturalWidth > 0 && currentImg.naturalHeight > 0
                ? currentImg.naturalWidth / currentImg.naturalHeight
                : 1.5;
            const calculatedHeight = containerWidth / aspectRatio;
            setMainHeight(`${calculatedHeight}px`);
          }
        }
      }, 50);
    },
    [thumbsSwiper]
  );

  // Memoized event handlers for buttons
  const handleWishlistClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToWishList();
    },
    [addToWishList]
  );

  const handleQuantityDecrease = useCallback(() => {
    decrease();
  }, [decrease]);

  const handleQuantityIncrease = useCallback(() => {
    increase();
  }, [increase]);

  const handleAddToCartClick = useCallback(() => {
    if (showGoToCart) {
      dispatch(openCartPopup());
    } else {
      handleAddToCart();
      sendAddToCartEvent();
    }
  }, [showGoToCart, dispatch, handleAddToCart, sendAddToCartEvent]);

  const handleBuyNowClick = useCallback(() => {
    const productToBuy = {
      quantity,
      alternate_name: product?.alternate_name,
      images: product?.images,
      cover_image: product?.cover_image,
      product_stock: product?.selectedVariant?.stock ?? product?.quantity ?? 0,
      wishlist_id: product?.wishlist_id ?? null,
      final_price: Number(
        variant?.final_price ?? product?.final_price ?? 0
      ).toFixed(2),
      retailer_id: product?.retailer_id,
      wholesaler_id: product?.wholesaler_id,
      id: product?.id || product?.product_id,
      product_slug: product?.slug,
      selected_variant: selectedVariant
        ? {
            id: selectedVariant.id,
            variation: selectedVariant.variation,
            final_price: selectedVariant.final_price || selectedVariant.price,
            stock: selectedVariant.stock,
          }
        : null,
    };
    dispatch(
      setBuyNowProduct({
        product: productToBuy,
        quantity: quantity,
      })
    );
    router.push("/checkout");
  }, [quantity, product, variant, selectedVariant, dispatch, router]);

  const handleWhatsappClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      getWhatsappLink(e, product, phone_number, subdomain, variant);
    },
    [product, phone_number, subdomain, variant]
  );

  const handleWishlistClickAlt = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToWishList();
    },
    [addToWishList]
  );

  useEffect(() => {
    const updateHeights = () => {
      if (thumbContainerRef.current) {
        const thumbImg = thumbContainerRef.current.querySelector("img");
        const slidesPerView = 5;
        const spaceBetween = 15;
        const containerWidth = thumbContainerRef.current.offsetWidth;
        const aspectRatio =
          thumbImg &&
          thumbImg.complete &&
          thumbImg.naturalWidth > 0 &&
          thumbImg.naturalHeight > 0
            ? thumbImg.naturalWidth / thumbImg.naturalHeight
            : 1.5;
        const singleThumbHeight = containerWidth / aspectRatio;
        const totalThumbHeight =
          singleThumbHeight * slidesPerView +
          spaceBetween * (slidesPerView - 1);
        setThumbHeight(`${totalThumbHeight}px`);
      }

      if (mainContainerRef.current) {
        const mainImg = mainContainerRef.current.querySelector("img");
        if (mainImg && mainImg.complete) {
          const containerWidth = mainContainerRef.current.offsetWidth;
          const aspectRatio =
            mainImg.naturalWidth > 0 && mainImg.naturalHeight > 0
              ? mainImg.naturalWidth / mainImg.naturalHeight
              : 1.5;
          const calculatedHeight = containerWidth / aspectRatio;
          setMainHeight(`${calculatedHeight}px`);
        }
      }
    };

    const timer = setTimeout(updateHeights, 100);
    window.addEventListener("resize", updateHeights);
    return () => {
      window.removeEventListener("resize", updateHeights);
      clearTimeout(timer);
    };
  }, [productImg]);

  useEffect(() => {
    if (productImg.length > 0) {
      productImg.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
      });
    }
  }, [productImg]);

  const isProductNotFound = !productLoading && slug && (!product || error);

  if (isProductNotFound && !productRef) {
    return <NotFound />;
  }

  const videoItems = galleryItems.filter((item) =>
    /\.(webm|mp4|mov|m4v|ogg|ogv|3gp|3g2|avi|wmv|flv)$/i.test(item)
  );

  const handleDownloadVideo = async () => {
    if (videoDownloadLoading) return;

    setVideoDownloadLoading(true);
    try {
      const videoUrl = videoItems[0];
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = videoUrl.split("/").pop() || "video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(videoItems[0], "_blank");
    } finally {
      setVideoDownloadLoading(false);
    }
  };

  return (
    <div className="mr-auto ml-auto">
      {productLoading ? "" : null}
      {productLoading ? (
        <Loader height="h-[80vh]" />
      ) : (
        <div className="pt-[7.125rem] ">
          <div className="flex flex-wrap gap-8 xl:gap-12.5 2xl:gap-[3.75rem] px-container word-break">
            {/* Image Column - spans 4 columns on lg+ (4/6) */}
            <div className="product-left">
              <div className="md:sticky md:top-[100px] product-slide w-full flex flex-col-reverse md:flex-row relative">
                {themeId !== 3 && themeId !== 4 && themeId !== 5 && (
                  <div className="wishlist-button absolute top-0 right-0 m-4 z-10">
                    <button
                      onClick={handleWishlistClick}
                      style={{
                        backgroundColor: `${isWishlist ? "white" : "red-500"}`,
                      }}
                      className="cursor-pointer w-full h-full p-2 rounded-[0.625rem] text-base focus:outline-none shadow"
                    >
                      <Icon
                        name="heart"
                        stroke={"#ff0000"}
                        isWishlist={isWishlist}
                        size={24}
                      />
                    </button>
                  </div>
                )}
                {/* Thumbnail Slider */}
                <div className="w-full h-full">
                  {/* <div className="product__slider flex flex-row md:flex-col w-full md:w-[100px] md:mr-6 mt-6 md:mt-0 md:max-h-[515px]">
                  <div className="thumb__prev cursor-pointer text-center text-sm h-auto w-8 md:h-12 md:w-auto flex items-center justify-center select-none focus:outline-none">
                    <Icon
                      name="chevronUp"
                      size={32}
                      className="hidden md:block ai ai-ChevronUp"
                    />
                  </div> */}

                  <ThumbsSlider
                    galleryItems={galleryItems}
                    setLightboxImage={setLightboxImage}
                    productName={product?.name}
                    wholesalerId={product?.wholesaler_id}
                  />
                </div>
                {/* Lightbox */}
                {lightboxImage !== null && (
                  <LightboxSlider
                    galleryItems={galleryItems}
                    activeIndex={activeIndex}
                    setLightboxImage={setLightboxImage}
                    ref={mainContainerRef}
                    productName={product?.name}
                    wholesalerId={product?.wholesaler_id}
                  />
                )}
              </div>

              {lightboxImage !== null && (
                <LightboxSlider
                  galleryItems={galleryItems}
                  activeIndex={activeIndex}
                  setLightboxImage={setLightboxImage}
                  ref={mainContainerRef}
                  productName={product?.name}
                  wholesalerId={product?.wholesaler_id}
                />
              )}
            </div>

            {/* Details Column - spans 2 columns on lg+ (2/6) */}
            <div className="product-right">
              {themeId === 2 && Number(discount) > 0 && (
                <span
                  className="mr-1 text-[0.875rem] discount font-normal px-2 py-1  rounded-[100px]"
                  style={{
                    backgroundColor: `${themeContext?.buttonBackgroundColor}`,
                    color: themeContext?.buttonTextColor,
                  }}
                >
                  Save {discount}%
                </span>
              )}
              <div className="flex flex-row gap-2">
                {/* Product Title */}
                <h3
                  className="text-[1.5rem] lg:text-[2rem] font-bold mb-3.5 break-words"
                  style={{ color: themeContext?.bodyTextColor }}
                >
                  {product?.alternate_name}
                </h3>
                {/* Share Dialog */}
                {themeId === 6 && (
                  <ShareDialog
                    url={
                      typeof window !== "undefined" ? window.location.href : ""
                    }
                    product={product}
                    variant={variant}
                  />
                )}
              </div>
              {product?.hsn_code && (
                <div className="flex items-center gap-2 mb-2">
                  HSN Code:
                  <h3
                    className="text-md font-semibold"
                    style={{ color: themeContext?.bodyTextColor }}
                  >
                    {product?.hsn_code}
                  </h3>
                </div>
              )}

              {/* Price */}
              {(productPrice?.final_price || productPrice?.price) &&
                productPrice?.final_price !== 0 && (
                  <div className="price-wrapper">
                    <span
                      className="font-bold"
                      style={{
                        color: textColor,
                        // themeId === 3
                        //   ? theme?.buttonBackgroundColor
                        //   : themeId === 6
                        //   ? '#10b981'
                        //   : 'inherit',
                      }}
                    >
                      ₹{productPrice?.final_price || productPrice?.price || ""}
                    </span>
                    {productPrice?.old_price > 0 &&
                      parseFloat(productPrice.old_price) >
                        parseFloat(
                          productPrice.final_price || productPrice.price || 0
                        ) && (
                        <>
                          <span className="mx-3 line-through text-[1rem] text-[#808080]">
                            ₹{productPrice?.old_price}
                          </span>
                          {themeId === 1 && Number(discount) > 0 && (
                            <>
                              <span
                                className="mr-1 text-[0.875rem] discount px-[0.375rem] rounded-sm"
                                style={{
                                  backgroundColor: `${themeContext?.buttonBackgroundColor}`,
                                  color: themeContext?.buttonTextColor,
                                }}
                              >
                                {discount}%
                              </span>
                              <span className="mr-1 text-[0.75rem] text-[#808080] uppercase">
                                off
                              </span>
                            </>
                          )}
                          {/* {themeId === 6 && discount > 0 && (
                            <>
                              <span className='mr-1 text-[0.875rem] discount bg-[#10b981] px-[0.375rem] text-[#FFFFFF] rounded-md font-semibold'>
                                {discount}% OFF
                              </span>
                            </>
                          )} */}
                          {themeId === 3 && Number(discount) > 0 && (
                            <>
                              <span
                                className="mr-1 text-[0.875rem] discount bg-[#111111] px-[0.375rem] text-[#FFFFFF] rounded-xl
                        "
                                style={{
                                  backgroundColor:
                                    themeContext?.buttonBackgroundColor,
                                  color: themeContext?.buttonTextColor,
                                }}
                              >
                                save {discount}%
                              </span>
                            </>
                          )}
                          {(themeId === 4 ||
                            themeId === 5 ||
                            themeId === 6) && (
                            // <span
                            //   className={`inline-flex items-center gap-2 px-3 py-1.5 border-radius-xl text-sm font-medium ${
                            //     (
                            //       product?.product_variations?.length > 0
                            //         ? variant?.stock > 0
                            //         : product?.quantity > 0
                            //     )
                            //       ? "bg-[#10b981] text-[#ffffff]"
                            //       : "bg-red-500/10 text-red-500"
                            //   }`}
                            // >
                            //   {product?.product_variations?.length > 0
                            //     ? variant?.stock > 0
                            //       ? "In Stock"
                            //       : "Out of stock"
                            //     : product?.quantity > 0
                            //     ? "In Stock"
                            //     : "Out of stock"}
                            // </span>
                            <span
                              className="mr-1 text-[0.875rem] discount font-normal px-2 py-1  rounded-[100px]"
                              style={{
                                backgroundColor: `${themeContext?.buttonBackgroundColor}`,
                                color: themeContext?.buttonTextColor,
                              }}
                            >
                              Save {discount}%
                            </span>
                          )}
                        </>
                      )}
                  </div>
                )}

              {/* Stock Status */}
              {product?.in_stock === 1 ? (
                // !product?.subscribed_product
                //   ? product?.status === 1
                //   : product?.status === 1 &&
                //     product?.subscribed_product?.status === 1
                <div
                  className="item-stock-status mb-6 border-b pb-6"
                  style={{
                    borderColor: `${themeContext?.buttonTextColor}1A`,
                  }}
                >
                  {themeId !== 4 && themeId !== 5 && themeId !== 6 && (
                    <p className="text-2xl flex items-center">
                      <span
                        className={`indicator rounded-[0.625rem] inline-block h-[0.625rem] w-[0.625rem] mr-2 ${
                          (
                            product?.variations?.length > 0
                              ? variant?.stock > 0
                              : product?.quantity > 0
                          )
                            ? "bg-[#25D366]"
                            : "bg-red-500"
                        }`}
                      ></span>
                      {product?.variations?.length > 0
                        ? variant?.stock > 0
                          ? "In stock"
                          : "Out of stock"
                        : product?.quantity > 0
                        ? "In stock"
                        : "Out of stock"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-base font-semibold">
                      !
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold tracking-[0.18em] uppercase text-red-600">
                        Out of Stock
                      </h4>
                      <p className="mt-1 text-xs text-red-500/80">
                        Check back soon or browse similar products below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Size Variants */}
              {(product?.variations?.length > 0 ||
                product?.variations?.length > 0) && (
                <div className="mb-6">
                  {themeId != 3 && (
                    <h4 className="case-class text-sm font-bold mb-2">Size</h4>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {sortedProductVariations?.map((item) => {
                      const isSelected =
                        item?.id === selectedVariant?.id ||
                        item?.variation === selectedVariant?.variation;

                      return (
                        <button
                          key={item.id}
                          disabled={!item?.stock}
                          onClick={() => handleVariantSelect(item)}
                          className={`
                px-5 relative overflow-hidden py-3 text-[16px] font-medium
                border border-[#E6E7E8]  size-btn
                ${
                  variant?.variation === item?.variation && item?.stock > 0
                    ? themeContext?.buttonBackgroundColor
                    : ""
                }
                ${
                  item?.stock <= 0
                    ? "cursor-not-allowed opacity-50 text-[#808080]"
                    : "cursor-pointer"
                }`}
                          style={
                            isSelected
                              ? {
                                  color: getOppositeTextColor(textColor), // 👈 only text
                                  backgroundColor: textColor,
                                  borderColor: `${themeContext?.buttonBackgroundColor}1A`,
                                }
                              : {
                                  backgroundColor:
                                    themeContext?.backgroundColor,
                                  borderColor: `${textColor}5A`,
                                  color: textColor,
                                }
                          }
                        >
                          {item?.variation}
                          {item?.stock <= 0 && (
                            <span className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center cross-line"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons: Quantity + Add to Cart */}
              {themeId !== 3 && themeId !== 4 && themeId !== 6 && (
                <>
                  <div className="flex xl:flex-row sm:flex gap-4 mb-3.5">
                    <div className="flex gap-4 w-full">
                      {
                        // !product?.subscribed_product
                        // ? product?.status === 1
                        // : product?.status === 1 &&
                        //   product?.subscribed_product?.status === 1) &&
                        // ((product?.product_variations?.length > 0 &&
                        //   variant?.stock > 0) ||
                        //   (product?.product_variations?.length === 0 &&
                        //     product?.quantity > 0)
                        product?.in_stock === 1 && (
                          <>
                            {/* Quantity Selector */}
                            {!isWholesaler && (
                              <div className="quantity-wrapper">
                                <div
                                  className="inline-flex items-center border border-gray-300 py-2 h-full select-none"
                                  style={{
                                    borderColor: `${textColor}`,
                                  }}
                                >
                                  <div className="relative group">
                                    <button
                                      onClick={handleQuantityDecrease}
                                      disabled={!canDecrease || quantity === 1}
                                      className="w-10 h-full flex items-center justify-center rounded-[0.625rem] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Icon name="minus" className="w-5 h-5" />
                                    </button>
                                    {(!canDecrease || quantity === 1) && (
                                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                        No more items can be removed
                                        <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></span>
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-center text-lg font-medium w-5">
                                    {quantity}
                                  </span>

                                  <div className="relative group">
                                    <button
                                      onClick={handleQuantityIncrease}
                                      disabled={!canIncrease}
                                      className="w-10 h-full flex items-center justify-center rounded-[0.625rem] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Icon name="plus" className="w-5 h-5" />
                                    </button>
                                    {!canIncrease && (
                                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                        No more items can be added
                                        <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Add to Cart Button */}
                            {
                              // !product?.subscribed_product
                              // ? product?.status === 1
                              // : product?.status === 1 &&
                              //   product?.subscribed_product?.status === 1) &&
                              // ((product?.product_variations?.length > 0 &&
                              //   variant?.stock > 0) ||
                              //   (product?.product_variations?.length === 0 &&
                              //     product?.quantity > 0)
                              product?.in_stock === 1 && (
                                <LoadingButton
                                  loading={addLoading}
                                  onClick={handleAddToCartClick}
                                  fullWidth={false}
                                  backgroundColor={
                                    themeContext?.addToCartButtonBackgroundColor
                                  }
                                  textColor={
                                    themeContext?.addToCartButtonTextColor
                                  }
                                  borderColor={
                                    themeContext?.addToCartButtonBorderColor
                                  }
                                  text={
                                    showGoToCart ? "Go to Cart" : "Add to Cart"
                                  }
                                  className="btn btn-outline !break-normal w-auto sm:w-full whitespace-nowrap"
                                />
                              )
                            }
                          </>
                        )
                      }
                    </div>
                  </div>

                  {/* Buy Now + Social Actions */}
                  <div className="flex flex-wrap sm:flex-row gap-4 mb-3.5">
                    {
                      // !product?.subscribed_product
                      // ? product?.status === 1
                      // : product?.status === 1 &&
                      //   product?.subscribed_product?.status === 1) &&
                      // ((product?.product_variations?.length > 0 &&
                      //   variant?.stock > 0) ||
                      //   (product?.product_variations?.length === 0 &&
                      //     product?.quantity > 0)
                      product?.in_stock === 1 && (
                        <button
                          onClick={handleBuyNowClick}
                          disabled={
                            product?.productVariations?.length > 0 &&
                            !selectedVariant
                          }
                          className={`
            max-md:text-[0.8125rem] grow btn py-3.5 border px-6 sm:px-[1.5rem]
            rounded-[0.625rem] text-base focus:outline-none flex items-center justify-center
            ${
              product?.productVariations?.length > 0 && !selectedVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
                          style={{
                            backgroundColor:
                              themeContext?.buyNowButtonBackgroundColor,
                            color: themeContext?.buyNowButtonTextColor,
                            borderColor: themeContext?.buyNowButtonBorderColor,
                          }}
                        >
                          Buy Now
                        </button>
                      )
                    }

                    <div className="text-xl w-auto  flex rounded-[0.625rem] gap-3.5">
                      {/* WhatsApp */}
                      {storeInfo?.data?.storeinfo?.enquiry_whatsapp === 1 && (
                        <button
                          onClick={handleWhatsappClick}
                          className="btn border sm:min-w-[55px] py-2.5 px-3.5 rounded-[0.625rem] text-base focus:outline-none flex items-center justify-center !bg-[#25D366]"
                          style={{
                            borderColor: `${themeContext?.buttonTextColor}2A`,
                          }}
                        >
                          <Image
                            src={whatsappIcon}
                            alt="WhatsApp"
                            width={24}
                            height={24}
                          />
                        </button>
                      )}

                      {/* Share */}
                      <ShareDialog
                        url={
                          typeof window !== "undefined"
                            ? window.location.href
                            : ""
                        }
                        product={product}
                        variant={variant}
                      />
                    </div>
                  </div>
                </>
              )}

              {(themeId === 3 || themeId === 4 || themeId === 6) && (
                <>
                  <div className="flex xl:flex-row sm:flex gap-4 mb-3.5">
                    <div className="flex gap-4 w-full whitespace-nowrap">
                      {product?.in_stock === 1 && (
                        // !product?.subscribed_product
                        // ? product?.status === 1
                        // : product?.status === 1 &&
                        //   product?.subscribed_product?.status === 1
                        <>
                          {/* Quantity Selector */}
                          {!isWholesaler && (
                            <div className="quantity-wrapper">
                              <div
                                className="inline-flex items-center py-2 h-full select-none border"
                                style={{
                                  borderColor: `${textColor}`,
                                }}
                              >
                                <div className="relative group">
                                  <button
                                    onClick={handleQuantityDecrease}
                                    disabled={!canDecrease || quantity === 1}
                                    className="w-10 h-full flex items-center justify-center text-gray-800 rounded-[0.625rem] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Icon
                                      name="minus"
                                      className="w-5 h-5"
                                      stroke={textColor}
                                    />
                                  </button>
                                  {(!canDecrease || quantity === 1) && (
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                      No more items can be removed
                                      <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></span>
                                    </span>
                                  )}
                                </div>

                                <span className="text-center text-lg font-medium w-5">
                                  {quantity}
                                </span>

                                <div className="relative group">
                                  <button
                                    onClick={handleQuantityIncrease}
                                    disabled={!canIncrease}
                                    className="w-10 h-full flex items-center justify-center text-gray-800 rounded-[0.625rem] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Icon
                                      name="plus"
                                      className="w-5 h-5"
                                      stroke={textColor}
                                    />
                                  </button>
                                  {!canIncrease && (
                                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                                      No more items can be added
                                      <span className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Add to Cart Button */}

                          <LoadingButton
                            loading={addLoading}
                            onClick={handleAddToCartClick}
                            fullWidth={false}
                            backgroundColor={
                              themeContext?.addToCartButtonBackgroundColor
                            }
                            textColor={themeContext?.addToCartButtonTextColor}
                            borderColor={
                              themeContext?.addToCartButtonBorderColor
                            }
                            text={showGoToCart ? "Go to Cart" : "Add to Cart"}
                            className="btn  !break-normal  whitespace-nowrap"
                          />

                          {product?.in_stock === 1 && (
                            // !product?.subscribed_product
                            // ? product?.status === 1
                            // : product?.status === 1 &&
                            //   product?.subscribed_product?.status === 1
                            <button
                              onClick={handleBuyNowClick}
                              disabled={
                                product?.variations?.length > 0 &&
                                !selectedVariant
                              }
                              className={`border
            max-md:text-[0.8125rem] grow btn py-3.5 px-6 sm:px-[1.5rem]
            rounded-[0.625rem] text-base focus:outline-none flex items-center justify-center
            ${
              product?.variations?.length > 0 && !selectedVariant
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
                              style={{
                                backgroundColor:
                                  themeContext?.buyNowButtonBackgroundColor,
                                color: themeContext?.buyNowButtonTextColor,
                                borderColor:
                                  themeContext?.buyNowButtonBorderColor,
                              }}
                            >
                              Buy Now
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Buy Now + Social Actions */}
                  <div className="flex flex-wrap sm:flex-row gap-4 mb-3.5">
                    <div className="text-xl w-auto  flex items-center rounded-[0.625rem] gap-3.5">
                      {/* WhatsApp */}
                      {storeInfo?.data?.storeinfo?.enquiry_whatsapp === 1 && (
                        <>
                          <button
                            onClick={handleWhatsappClick}
                            className="sm:min-w-[55px]  py-2.5 px-3.5  text-base focus:outline-none flex items-center justify-center p-0 flex-wrap cursor-pointer"
                            style={{
                              backgroundColor: themeContext?.backgroundColor,
                              color: textColor,
                            }}
                          >
                            <Image
                              width={24}
                              height={24}
                              src={whatsapp}
                              alt="WhatsApp"
                            />
                            <span className=" ml-1">WhatsApp Enquiry</span>
                          </button>
                          <div className="border-l border-gray-300 h-[24px]"></div>
                        </>
                      )}
                      {/* Wishlist */}
                      {themeId !== 6 && (
                        <>
                          <button
                            onClick={handleWishlistClickAlt}
                            className="sm:min-w-[55px]   text-base focus:outline-none flex items-center justify-center p-0 flex-wrap cursor-pointer"
                            style={{
                              backgroundColor: themeContext?.backgroundColor,
                              color: textColor,
                            }}
                          >
                            <Icon
                              name="heart"
                              isWishlist={isWishlist}
                              size={24}
                              stroke={"#ff0000"}
                            />
                            <span className=" ml-1">Wishlist</span>
                          </button>

                          <div className="border-l border-gray-300 h-[24px]"></div>
                          <ShareDialog
                            url={
                              typeof window !== "undefined"
                                ? window.location.href
                                : ""
                            }
                            product={product}
                            variant={variant}
                          />
                        </>
                      )}
                      {/* Share */}
                    </div>
                  </div>
                </>
              )}

              {(videoItems.length > 0 ||
                product?.description ||
                product?.brand?.size_guide_url) && (
                <div className="border-t border-[#111111]/15 mt-6 pt-6">
                  {isWholesaler && videoItems.length > 0 && (
                    <div className="flex flex-row gap-2">
                      <button
                        className="btn px-5 py-2.5 flex items-center justify-center border"
                        onClick={() => setShowVideo(true)}
                        style={{
                          backgroundColor: themeContext?.buttonTextColor,
                          color: themeContext?.buttonBackgroundColor,
                          border: `1px solid ${themeContext?.buttonBorderColor}`,
                        }}
                      >
                        <Icon
                          name="playVideo"
                          className="w-5 h-5"
                          fill={themeContext?.buttonBackgroundColor}
                        />
                        <span className="ml-2">Play video</span>
                      </button>

                      <button
                        className={`btn px-5 py-2.5 flex items-center justify-center border ${
                          videoDownloadLoading ? "opacity-70" : ""
                        }`}
                        style={{
                          backgroundColor: themeContext?.buttonTextColor,
                          color: themeContext?.buttonBackgroundColor,
                          border: `1px solid ${themeContext?.buttonBorderColor}`,
                        }}
                        onClick={handleDownloadVideo}
                        disabled={videoDownloadLoading}
                      >
                        {videoDownloadLoading ? (
                          <svg
                            className="animate-spin w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            style={{
                              color: themeContext?.buttonBackgroundColor,
                            }}
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Icon
                            name="playVideo"
                            className="w-5 h-5"
                            fill={themeContext?.buttonBackgroundColor}
                          />
                        )}
                        <span className="ml-2">
                          {videoDownloadLoading
                            ? "Downloading..."
                            : "Download video"}
                        </span>
                      </button>
                    </div>
                  )}
                  {isWholesaler && showVideo && (
                    <LightboxSlider
                      galleryItems={videoItems}
                      activeIndex={activeIndex}
                      setLightboxImage={() => setShowVideo(false)}
                      ref={mainContainerRef}
                      productName={product?.name}
                      wholesalerId={productDetails?.product?.wholesaler_id}
                    />
                  )}
                  {product?.brand?.size_guide_url && (
                    <div className="w-full  relative overflow-hidden mb-4">
                      <button
                        className="text-sm flex items-center gap-1 font-bold cursor-pointer mb-2
             transition-transform duration-200 ease-in-out
            "
                      >
                        Size Guide
                      </button>
                      <div className="border border-[#111111]/15  overflow-hidden relative">
                        <div>
                          <div
                            className="absolute bottom-5 right-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 cursor-pointer"
                            onClick={() => {
                              setShowSizeGuideModal(true);
                              document.body.style.overflow = "hidden";
                            }}
                          >
                            <Icon name="zoom" strokeWidth="0" />
                          </div>
                        </div>
                        <iframe
                          src={product?.brand?.size_guide_url}
                          className="w-full h-[20vh] relative z-0 m-0 p-0  "
                          title="Size Guide"
                          frameBorder="0"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            marginTop: "-20px", // Negative margin to hide toolbar
                            marginLeft: "-20px",
                            marginRight: "-20px",
                            marginBottom: "-20px",
                            width: "calc(100% + 40px)",
                            clipPath: "inset(5px 0 0 0)", // Clip the top 40px to hide toolbar
                          }}
                          onLoad={(e) => {
                            // Additional attempt to hide toolbar
                            setTimeout(() => {
                              try {
                                const iframe = e.target as HTMLIFrameElement;
                                if (iframe.contentWindow) {
                                  // Try to communicate with the iframe
                                  iframe.contentWindow.postMessage(
                                    {
                                      type: "HIDE_TOOLBAR",
                                    },
                                    "*"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Could not communicate with iframe:",
                                  error
                                );
                              }
                            }, 1000);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Description */}
                  {product?.description && (
                    <div className="description-wrapper pt-2">
                      <h4 className="text-sm font-bold mb-4 lg:text-2xl">
                        Product Summary
                      </h4>
                      <HtmlContent htmlContent={product?.description} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuideModal && product?.brand?.size_guide_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40  transition-opacity filter blur-1">
          <div className="relative w-[80vw] max-w-5xl h-auto max-h-[100dvh] bg-white rounded-lg overflow-hidden mx-4 ">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-1">
                Size Guide
              </h3>
              <button
                onClick={() => {
                  setShowSizeGuideModal(false);
                  document.body.style.overflow = "";
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className="w-full h-auto max-h-[100dvh] relative overflow-hidden">
              {/* Overlay to cover toolbar */}

              <iframe
                // src={`${product.brand.size_guide_url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
                src={`${product.brand.size_guide_url}`}
                className="w-full h-auto max-h-[100dvh] relative z-0 m-0 p-0"
                title="Size Guide"
                frameBorder="0"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  // marginTop: "-40px", // Negative margin to hide toolbar
                  // marginLeft: "-20px",
                  // marginRight: "-20px",
                  // width: "calc(100% + 50px)",
                  // clipPath: "inset(40px 0 0 0)", // Clip the top 40px to hide toolbar
                }}
                onLoad={(e) => {
                  // Additional attempt to hide toolbar
                  setTimeout(() => {
                    try {
                      const iframe = e.target as HTMLIFrameElement;
                      if (iframe.contentWindow) {
                        // Try to communicate with the iframe
                        iframe.contentWindow.postMessage(
                          {
                            type: "HIDE_TOOLBAR",
                          },
                          "*"
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Could not communicate with iframe:",
                        error
                      );
                    }
                  }, 1000);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ProductSliderSection />
    </div>
  );
}

export default memo(ProductDetailClient);
