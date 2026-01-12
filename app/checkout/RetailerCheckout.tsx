import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import {
  applyDiscount,
  clearBuyNowProduct,
  clearDiscount,
  getCoupon,
  performCheckout,
} from "../redux/slices/checkoutSlice";
import LoadingButton from "../components/customcomponents/LoadingButton";
// import Select from "react-select";
import { fetchCities, fetchStates } from "../redux/slices/addressSlice";
import DeliveryAddressCard from "../components/DeliveryAddressCard";
import ContinueShoppingLink from "../components/ContinueShoppingLink";
import CustomInput from "../components/customcomponents/CustomInput";
import { sendEvent } from "../utils/facebookAnalytics";
// import { trackBeginCheckout, trackPurchase } from "../utils/analytics";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { fetchCart } from "../redux/slices/cartSlice";
import Link from "next/link";
import { getProductImage, truncateWords } from "../utils/common";
import { PhoneVerify } from "../components/PhoneVerify";
import { Trash2 } from "lucide-react";
import CouponsDialog from "../components/CouponsDialog";
import SafeImage from "../components/SafeImage";
import { trackBeginCheckout, trackPurchase } from "../utils/analytics";

function RetailerCheckout() {
  const navigate = useRouter();
  // const [showForm, setShowForm] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [initialStateSet, setInitialStateSet] = useState(false);
  const [showCouponsDialog, setShowCouponsDialog] = useState(false);
  const cartItems = useAppSelector((state: RootState) => state.cart.cartItems);
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );
  // const { buyNowProduct, buyNow, selectedQuantity } = location.state || {};
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );
  const { states } = useAppSelector((state: RootState) => state.address);
  const { storeInfo } = useAppSelector((state: RootState) => state.storeInfo);
  const {
    discount,
    coupons,
    discountLoading,
    checkoutLoading,
    buyNowProduct,
    buyNowQuantity,
    isBuyNowMode,
  } = useAppSelector((state: RootState) => state.checkout);

  // Ensure coupons is always an array
  const safeCoupons = Array.isArray(coupons) ? coupons : [];

  const isCouponEnabled = storeInfo?.data?.storeinfo?.is_coupon_enabled;

  const itemsToShow =
    isBuyNowMode && buyNowProduct
      ? [
        {
          ...buyNowProduct,
          quantity: buyNowQuantity || 1,
        },
      ]
      : cartItems;

  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const dispatch = useAppDispatch();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const userData = user?.customer || {};
  const { shippingAddress } = useAppSelector((state: RootState) => state.shippingAddress);

  const couponCriteria = discount?.coupon?.criteria || null;
  const isAllCriteria = couponCriteria === "all";
  const isCategoriesCriteria = couponCriteria === "categories";
  const isUsersCriteria = couponCriteria === "users";
  const isProductsCriteria = couponCriteria === "products";
  // const discountPerProduct = discount?.coupon?.discount_per_product;
  const discountType = discount?.coupon?.discount_type || "fixed";
  const discountProductIds = discount?.coupon?.product_ids || [];
  const discountCategoryIds = discount?.coupon?.category_ids || [];
  // const discountCustomerIds = discount?.coupon?.customer_ids || [];
  const totalCouponDiscount = Number(discount?.coupon?.discount) || 0;

  // Comprehensive function to validate coupon against cart and prices
  const validateCouponForCart = (couponData: any, currentSubtotal: number, cartItems: any) => {
    if (!couponData) {
      return { isValid: false, reason: "Invalid coupon" };
    }

    const validationResult = { isValid: true, reason: null };

    // Validate min_order_amount
    if (
      couponData?.min_order_amount &&
      currentSubtotal < couponData?.min_order_amount
    ) {
      return {
        isValid: false,
        reason: `Minimum order amount of ₹${couponData.min_order_amount} required. Your cart total is ₹${currentSubtotal}`,
      };
    }

    // Validate max_order_amount
    if (
      couponData.max_order_amount &&
      currentSubtotal > couponData.max_order_amount
    ) {
      return {
        isValid: false,
        reason: `Maximum order amount of ₹${couponData.max_order_amount} allowed. Your cart total is ₹${currentSubtotal}`,
      };
    }

    // Check if coupon applies to products in cart
    if (
      couponData.product_ids &&
      Array.isArray(couponData.product_ids) &&
      couponData.product_ids.length > 0
    ) {
      const cartProductIds = cartItems.map(
        (item: any) => item.product_id || item.retailer_product_id || item.id
      );
      const hasMatchingProduct = couponData.product_ids.some(
        (couponProductId: any) => cartProductIds.includes(couponProductId)
      );

      if (!hasMatchingProduct) {
        return {
          isValid: false,
          reason: "This coupon is not applicable to products in your cart",
        };
      }
    }

    // Check if coupon applies to sub_category
    if (couponData.sub_category && couponData.sub_category.id) {
      const hasMatchingCategory = cartItems.some((item) => {
        const itemSubCategoryId = item.sub_category_id || item.sub_category?.id;
        return itemSubCategoryId === couponData.sub_category.id;
      });

      if (!hasMatchingCategory) {
        return {
          isValid: false,
          reason: `This coupon is only valid for ${couponData.sub_category.sub_category_name} category`,
        };
      }
    }

    // Check if discount would exceed product prices
    // If coupon has product_ids, check only those products; otherwise check all products
    const itemsToCheck =
      couponData.product_ids &&
        Array.isArray(couponData.product_ids) &&
        couponData.product_ids.length > 0
        ? cartItems.filter((item) => {
          const itemId =
            item.product_id || item.retailer_product_id || item.id;
          return couponData.product_ids.includes(itemId);
        })
        : cartItems; // If no product_ids, check all items

    if (itemsToCheck.length > 0) {
      // const couponCriteria = couponData.criteria || null;
      // const isAllCriteria = couponCriteria === "all";
      // const isCategoriesCriteria = couponCriteria === "categories";
      // const isUsersCriteria = couponCriteria === "users";
      const discountType = couponData.discount_type || "fixed";
      const totalCouponDiscount = Number(couponData.discount) || 0;

      let totalDiscountAmount = 0;

      if (discountType === "percentage") {
        const totalCartAmount = itemsToCheck.reduce(
          (sum: number, item: any) => sum + (item.final_price || 0) * (item.quantity || 1),
          0
        );
        totalDiscountAmount = (totalCartAmount * totalCouponDiscount) / 100;
      } else {
        totalDiscountAmount = totalCouponDiscount;
      }

      const discountPerItem =
        totalDiscountAmount / Math.max(1, itemsToCheck.length);

      for (const item of itemsToCheck) {
        const itemTotalPrice = (item.final_price || 0) * (item.quantity || 1);

        if (discountPerItem > itemTotalPrice) {
          return {
            isValid: false,
            reason: `Discount amount (₹${Math.round(
              discountPerItem
            )}) exceeds product price (₹${itemTotalPrice}) for ${item.product_name || "item"
              }`,
          };
        }
      }
    }

    return validationResult;
  };

  // Helper function to validate coupon before applying (for form submission)
  const validateCouponBeforeApply = (
    couponData: any,
    currentSubtotal: number,
    setFieldError: any
  ) => {
    const validation = validateCouponForCart(
      couponData,
      currentSubtotal,
      itemsToShow
    );

    if (!validation.isValid) {
      if (typeof setFieldError === "function") {
        setFieldError("coupon_code", validation.reason);
      }
      toast.error(validation.reason);
      return false;
    }

    return true;
  };

  const calculateDiscountDistribution = () => {
    if (!discount?.coupon) {
      return { eligibleItems: [], discountPerItem: 0 };
    }

    let eligibleItems = [];

    if (isAllCriteria || isUsersCriteria) {
      eligibleItems = itemsToShow;
    } else if (isCategoriesCriteria) {
      eligibleItems = itemsToShow.filter((item: any) => {
        const itemCategoryId = String(
          item.sub_category_id || item.sub_category?.id || ""
        );
        return discountCategoryIds.includes(itemCategoryId);
      });
    } else if (isProductsCriteria) {
      eligibleItems = itemsToShow.filter((item: any) => {
        const itemId = String(
          item.product_id || item.retailer_product_id || item.id || ""
        );
        return discountProductIds.includes(itemId);
      });
    }

    if (eligibleItems.length === 0) {
      return { eligibleItems: [], discountPerItem: 0 };
    }

    let totalDiscountAmount = 0;

    if (discountType === "percentage") {
      const totalCartAmount = eligibleItems.reduce(
        (sum, item) => sum + (item.final_price || 0) * (item.quantity || 1),
        0
      );
      totalDiscountAmount = (totalCartAmount * totalCouponDiscount) / 100;
    } else {
      totalDiscountAmount = totalCouponDiscount;
    }

    const discountPerItem = totalDiscountAmount / eligibleItems.length;

    return { eligibleItems, discountPerItem };
  };

  const { eligibleItems, discountPerItem } = calculateDiscountDistribution();

  const eligibleItemIds = new Set(
    eligibleItems.map((item) =>
      String(item.product_id || item.retailer_product_id || item.id || "")
    )
  );

  const updatedCartItems = itemsToShow.map((item: any) => {
    const itemId = String(
      item.product_id || item.retailer_product_id || item.id || ""
    );
    const itemTotalPrice = (item.final_price || 0) * (item.quantity || 1);
    const isEligible = eligibleItemIds.has(itemId);

    if (isEligible && discount?.coupon) {
      const calculatedDiscount = discountPerItem;

      // Ensure discount doesn't exceed product price
      const validDiscountValue = Math.min(calculatedDiscount, itemTotalPrice);
      const discountedPrice = Math.max(0, itemTotalPrice - validDiscountValue);

      return {
        ...item,
        discountedPrice: discountedPrice,
        discountApplied: true,
        validDiscountValue: validDiscountValue,
      };
    }

    return {
      ...item,
      discountedPrice: itemTotalPrice,
      discountApplied: false,
      validDiscountValue: 0,
    };
  });

  // Calculate current subtotal
  const currentSubtotal = itemsToShow.reduce(
    (acc: number, item: any) =>
      acc + (item.final_price || 0) * (item.quantity || 1),
    0
  );

  // Function to apply coupon (used by both form and dialog)
  const applyCoupon = (couponCode:any, setFieldError:any) => {
    const products = updatedCartItems.map(item => ({
      product_id: item.product_id || item.retailer_product_id || item.id,
      final_price: item.discountApplied ? item.final_price : item.final_price
    }));
    const payload = {
      coupon_code: couponCode.trim(),
      products: products,
    };
    dispatch(applyDiscount({ payload, setFieldError }));
  };

  // Handler for applying coupon from dialog
  const handleApplyCouponFromDialog = (coupon: any, currentSubtotal: number) => {
    // Validate coupon before applying
    const isValid = validateCouponBeforeApply(coupon, currentSubtotal, null);

    if (!isValid) {
      return; // Stop if validation fails
    }

    // Set the coupon code in the form and apply it
    couponForm.setFieldValue("coupon_code", coupon.coupon_code);
    applyCoupon(coupon.coupon_code, (field: any, error: any) => {
      couponForm.setFieldError(field, error);
    });

    // Close the dialog after applying
    setShowCouponsDialog(false);
  };

  // Function to validate coupon when user types manually
  // const validateCouponOnBlur = (value:any) => {
  //   if (!value || !value.trim()) {
  //     return; // Don't validate empty field
  //   }

  //   const couponToValidate = coupons.find(
  //     (coupon) => coupon.coupon_code?.toLowerCase() === value.trim().toLowerCase()
  //   );

  //   if (couponToValidate) {
  //     validateCouponBeforeApply(couponToValidate, currentSubtotal, (field, error) => {
  //       couponForm.setFieldError(field, error);
  //       toast.error(error);
  //     });
  //   }
  // };

  const couponForm = useFormik({
    initialValues: { coupon_code: "" },
    onSubmit: (values:any, { setFieldError }:any) => {
      // Find the coupon being applied from the available coupons
      const couponToApply = safeCoupons.find(
        (coupon:any) =>
          coupon.coupon_code?.toLowerCase() ===
          values?.coupon_code.trim().toLowerCase()
      );

      // Validate coupon before applying
      if (couponToApply) {
        const isValid = validateCouponBeforeApply(
          couponToApply,
          currentSubtotal,
          setFieldError
        );
        if (!isValid) {
          return; // Stop if validation fails
        }
      }

      applyCoupon(values?.coupon_code, setFieldError);
    },
  });

  const payload = {
    product_ids: updatedCartItems.map(item => item.product_id || item.retailer_product_id || item.id),
    sub_category_ids: updatedCartItems.map(item => item.sub_category_id),
  }

  useEffect(() => {
    dispatch(clearDiscount());
    dispatch(getCoupon(payload));
  }, [dispatch]);

  // Validate and adjust discount after it's applied
  useEffect(() => {
    if (discount?.coupon && updatedCartItems.length > 0) {
      const currentSubtotal = updatedCartItems.reduce(
        (acc, item) => acc + (item.final_price || 0) * (item.quantity || 1),
        0
      );

      const coupon = discount.coupon;

      // Validate min_order_amount
      if (
        coupon.min_order_amount &&
        currentSubtotal < Number(coupon.min_order_amount)
      ) {
        toast.error(
          `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`
        );
        dispatch(clearDiscount());
        couponForm.resetForm();
        return;
      }

      // Validate max_order_amount
      if (
        coupon.max_order_amount &&
        currentSubtotal > Number(coupon.max_order_amount)
      ) {
        toast.error(
          `Maximum order amount of ₹${coupon.max_order_amount} allowed for this coupon`
        );
        dispatch(clearDiscount());
        couponForm.resetForm();
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount, updatedCartItems]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    return () => {
      dispatch(clearBuyNowProduct());
    };
  }, [dispatch]);

  // const subtotal = updatedCartItems?.reduce(
  //   (acc, item) =>
  //     acc + (item.discountedPrice || item.final_price) * (item.quantity || 1),
  //   0
  // );

  const subtotal = updatedCartItems?.reduce(
    (acc, item) => acc + item.final_price * item.quantity,
    0
  );

  // Calculate discount amount using validated discount values
  const discountAmount = updatedCartItems?.reduce((sum, item) => {
    if (item.discountApplied && item.validDiscountValue) {
      return sum + item.validDiscountValue;
    }
    return sum;
  }, 0);

  const total = subtotal;
  // Ensure total never goes below 0
  const discTotal = Math.max(0, total - discountAmount);

  const priceDetails = [
    { label: "Subtotal", value: subtotal },
    {
      label: "Discount",
      value: discountAmount,
      display: discount ? true : false,
    },
    { label: "Shipping", value: 0, isFree: true },
  ];

  // const totalDiscount = updatedCartItems?.reduce((sum, item) => {
  //   if (item.discountApplied) {
  //     return sum + discountValue * (item.quantity || 1);
  //   }
  //   return sum;
  // }, 0);
  // // const total = subtotal;
  // const discTotal = subtotal - totalDiscount;

  // const priceDetails = [
  //   { label: "Subtotal", value: subtotal },
  //   {
  //     label: "Discount",
  //     value: totalDiscount,
  //     display: discount ? true : false,
  //   },
  //   { label: "Shipping", value: 0, isFree: true },
  // ];

  const formik = useFormik({
    initialValues: {
      phone_number: userData.phone_number || "",
      email: userData.email || "",
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
      address: userData.address || "",
      pincode: userData.pincode || "",
      alt_phone_number: userData.alt_phone_number
        ? userData.alt_phone_number
        : userData.phone_number || "",
      city: userData.city || "",
      state: userData.state || "",
      coupon_id: discount?.coupon?.id || "",
    },
    // validationSchema: CheckoutSchema,
    onSubmit: (values) => {
      // Track Purchase event before checkout (while cart items are still available)
      if (updatedCartItems && updatedCartItems.length > 0) {
        // Prepare transaction data
        const transaction = {
          transaction_id: `pending_${Date.now()}`, // Will be updated with actual order_id
          value: discTotal || total,
          currency: "INR",
          items: updatedCartItems.map((item) => ({
            id: item.product_id || item.retailer_product_id || item.id,
            item_id: item.product_id || item.retailer_product_id || item.id,
            name: item.alternate_name,
            category: item.category || "",
            brand: item.brand || "",
            price: item.discountApplied
              ? Math.round(item.final_price * item.quantity)
              : item.final_price || 0,
            quantity: item.quantity || 1,
          })),
        };

        // Google Analytics - Purchase
        trackPurchase(transaction);

        // Facebook Conversions API - Purchase
        sendEvent("Purchase", {
          final_price: discTotal || total,
          currency: "INR",
        });
      }

      const products = updatedCartItems.map(item => {
        const base = { quantity: item.quantity || 1 };
        return item.retailer_id
          ? {
            ...base,
            // retailer_id: item.retailer_id,
            product_id:
              item?.product_id || item?.retailer_product_id || item?.id,
            final_amount: item?.discountApplied
              ? Math.round(item?.final_price * item?.quantity)
              : Math.round(item?.final_price * item?.quantity),
            product_variation: item?.selected_variant?.variation || null,
            product_variation_id: item?.selected_variant?.id || null,
            quantity: item?.quantity || null,
            coupon_id: item?.discountApplied
              ? discount?.coupon?.id
              : undefined,
          }
          : {
            ...base,
            wholesaler_id: item.wholesaler_id,
            product_id: item?.id || item?.product_id,
            final_amount: item?.discountApplied
              ? Math.round(item?.final_price * item?.quantity)
              : Math.round(item?.final_price * item?.quantity),
            product_variation: item?.selected_variant?.variation || null,
            product_variation_id: item?.selected_variant?.id || null,
            quantity: item?.quantity || null,
            coupon_id: item?.discountApplied
              ? discount?.coupon?.id
              : undefined,
          };
      });

      const addresses = Array.isArray(shippingAddress) ? shippingAddress : [];
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      const defaultAddress = addresses.find((addr) => addr.is_default);

      const addressData = selectedAddress || defaultAddress || values;
      const addressId = selectedAddress?.id || defaultAddress?.id || undefined;

      const payload = {
        ...values,
        products,
        phone_number:
          addressData?.phone_number ||
          values?.phone_number ||
          userData?.phone_number,
        email: addressData?.email || values?.email || userData?.email,
        firstname:
          addressData?.firstname || values?.firstname || userData?.firstname,
        lastname:
          addressData?.lastname || values?.lastname || userData?.lastname,
        address: addressData?.address || values?.address,
        city: addressData?.city || values?.city,
        state: addressData?.state || values?.state,
        pincode: addressData?.pincode || values?.pincode,
        alt_phone_number:
          addressData?.alt_phone_number || values?.alt_phone_number,
        // user_token: import.meta.env.VITE_API_KEY,
        payment_method: paymentMethod,
        address_id: addressId,
      };
      dispatch(performCheckout({ payload, navigate, isBuyNowMode }));
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStates());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (selectedState?.value) {
      dispatch(fetchCities(selectedState?.value));
    }
  }, [dispatch, selectedState]);

  const stateOptions = (states || []).map((state) => ({
    value: state.id,
    label: state.name,
  }));
  // const cityOptions =
  //   selectedState?.label && Array.isArray(cities[selectedState.label])
  //     ? cities[selectedState.label].map((city) => ({
  //       value: city,
  //       label: city,
  //     }))
  //     : [];

  useEffect(() => {
    if (!initialStateSet && userData?.state && stateOptions.length > 0) {
      const selected = stateOptions.find(
        (opt) => opt.label === userData.state || opt.value === userData.state
      );
      if (selected) {
        setSelectedState(selected);
        formik.setFieldValue("state", selected.label);
        setInitialStateSet(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOptions, initialStateSet]);

  // useEffect(() => {
  //   if (
  //     verified &&
  //     user?.is_existing_customer &&
  //     user?.addresses?.length === 0
  //   ) {
  //     setShowForm(true);
  //   } else if (
  //     verified &&
  //     !user?.is_existing_customer &&
  //     user?.addresses?.length === 0
  //   ) {
  //     setShowForm(true);
  //   } else {
  //     setShowForm(false);
  //   }
  // }, [verified, user?.is_existing_customer, user?.addresses?.length]);

  // Track InitiateCheckout when checkout page loads with items
  useEffect(() => {
    if (updatedCartItems && updatedCartItems.length > 0) {
      // Google Analytics - InitiateCheckout
      const gaItems = updatedCartItems.map((item) => ({
        id: item.product_id || item.retailer_product_id || item.id,
        item_id: item.product_id || item.retailer_product_id || item.id,
        name: item.alternate_name,
        category: item.category || "",
        brand: item.brand || "",
        price: item.final_price || 0,
        quantity: item.quantity || 1,
      }));
      trackBeginCheckout(gaItems, "INR");

      // Facebook Conversions API - InitiateCheckout
      // Calculate total value for Facebook event
      const totalValue = updatedCartItems.reduce(
        (sum, item) => sum + (item.final_price || 0) * (item.quantity || 1),
        0
      );

      sendEvent("InitiateCheckout", {
        final_price: totalValue,
        currency: "INR",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PriceDisplay = ({
    price,
    quantity = 1,
    discountApplied = false,
    discountValue = 0,
  }) => {
    const totalPrice = price * quantity;
    // Ensure discount doesn't exceed product price and discounted price never goes below 0
    const validDiscount = Math.min(discountValue, totalPrice);
    const discountedPrice = Math.max(0, Math.round(totalPrice - validDiscount));

    return (
      <span>
        {discountApplied && validDiscount > 0 ? (
          <>
            <span className="font-bold pr-2">₹{discountedPrice}</span>

            <span
              style={{
                textDecoration: "line-through",
                color: "gray",
              }}
            >
              ₹{totalPrice}
            </span>
          </>
        ) : (
          <span className="text-base">
            <span className="font-bold">₹{totalPrice}</span>
          </span>
        )}
      </span>
    );
  };

  return (
    <div>
      {/* Form */}
      <div className="w-full max-w-auto mx-auto py-10 lg:py-[6.25rem] px-container 2xl:px-[0.9375rem] checkout-container">
        <div className="grid lg:grid-cols-2 gap-8 text-start w-full xl:gap-15 items-start">
          <div className="w-full ">
            <div
              className="sm:hidden max-sm:flex flex-col gap-6 p-[1.5rem] md:p-[1.875rem] rounded-[1.5rem] mb-[1.5rem]"
              style={{
                backgroundColor: themeContext?.bottomFooterBackgroundColor,
                color: bottomFooterTextColor,
                height: "fit-content",
              }}
            >
              {!isBuyNowMode && (
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold  ">Your Items</h3>
                  <Link href="/cart" className="text-sm uppercase underline  " prefetch={false}>
                    Edit Cart
                  </Link>
                </div>
              )}
              {updatedCartItems?.map((item, index) => {
                return (
                  <div key={index} className="bottom-card">
                    <div className="flex sm:gap-[0.82rem] justify-between">
                      <div className="flex gap-[1rem] sm:gap-[1.5rem]">
                        <div className="w-[4rem] md:w-[5rem] h-[4rem] md:h-[5rem] rounded-[0.625rem] overflow-hidden shrink-0">
                          <SafeImage
                            src={getProductImage(item)}
                            alt={item.alternate_name}
                            className='w-full h-full object-cover shrink-0'
                            width={200}
                            height={200}
                          />
                        </div>
                        <div>
                          <h3 className='font-bold line-clamp-2 text-sm sm:text-base max-w-[200px]'>
                            {truncateWords(item.alternate_name)}
                          </h3>
                          <div
                            className="flex items-center gap-2 mt-1"
                            style={{
                              color: bottomFooterTextColor,
                            }}
                          >
                            {item?.selected_variant && (
                              <>
                                <span className="text-base border-r pr-2 border-[#1111111f]">
                                  <span
                                    className="font-bold"
                                    style={{
                                      color: `${bottomFooterTextColor}a1`,
                                    }}
                                  >
                                    Size:{" "}
                                  </span>
                                  <span className="font-bold text-black uppercase">
                                    {item.selected_variant.variation}
                                  </span>
                                </span>
                              </>
                            )}
                            <span>
                              {item?.discountApplied &&
                                item?.validDiscountValue ? (
                                <>
                                  <span className="  font-bold pr-2">
                                    <span>₹ </span>
                                    {Math.max(
                                      0,
                                      Math.round(
                                        item?.final_price * item?.quantity -
                                        item?.validDiscountValue
                                      )
                                    )}
                                  </span>{" "}
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "gray",
                                    }}
                                  >
                                    ₹{item?.final_price * item?.quantity}
                                  </span>
                                </>
                              ) : (
                                <span className="text-base ">
                                  <span className="  font-bold pr-2">
                                    ₹{item?.final_price * item?.quantity}{" "}
                                  </span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-sm sm:text-base">
                        × {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {!isAuthenticated && <PhoneVerify />}

            <div
              className={`flex flex-col gap-4 lg:gap-6 !mt-0 ${isAuthenticated ? "account-box" : ""
                }`}
              style={{
                backgroundColor:
                  themeId === 4 || themeId === 5 || themeId === 6
                    ? themeId === 6
                      ? "#f0fdf4"
                      : themeContext?.bottomFooterBackgroundColor
                    : "",
                color:
                  themeId === 4 || themeId === 5 || themeId === 6
                    ? themeId === 6
                      ? "#1e293b"
                      : bottomFooterTextColor
                    : "",
              }}
            >
              {isAuthenticated && (
                <div className="w-full">
                  <CustomInput
                    id="phoneNumber"
                    type="text"
                    label="Phone Number"
                    placeholder="Enter your Phone number"
                    value={userData.mobile_number}
                    readOnly
                  />
                </div>
              )}
              {isAuthenticated && (
                <>
                  <h3 className="text-2xl font-bold">Shipping Details</h3>
                  <hr className="opacity-10" />
                </>
              )}

              {isAuthenticated && (
                <div>
                  <DeliveryAddressCard
                    selectedAddressId={selectedAddressId}
                    onSelect={setSelectedAddressId}
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className="p-[1.5rem] md:p-[1.875rem] border-radius-xl checkout-box card-border"
            style={{
              backgroundColor: themeContext?.bottomFooterBackgroundColor,
              color: bottomFooterTextColor,
              height: "fit-content",
            }}
          >
            <div className="flex flex-col gap-6 ">
              {!isBuyNowMode && (
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold  ">Your Orders</h3>
                  <Link
                    href="/cart"
                    className="text-sm uppercase underline hidden sm:block"
                    prefetch={false}
                  >
                    Edit Cart
                  </Link>
                </div>
              )}
              {updatedCartItems?.map((item, index) => {
                return (
                  <div key={index} className="bottom-card hidden sm:block">
                    <div className="flex sm:gap-[0.82rem] justify-between">
                      <div className="flex gap-[1rem] sm:gap-[1.5rem]">
                        <div className="w-[4rem] md:w-[5rem] h-[4rem] md:h-[5rem] rounded-[0.625rem] overflow-hidden shrink-0">
                          <SafeImage
                            src={getProductImage(item)}
                            alt={item.alternate_name}
                            className="w-full h-full object-cover shrink-0"
                            width={200}
                            height={200}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold line-clamp-2 text-sm sm:text-base max-w-[200px]">
                            {truncateWords(item.alternate_name)}
                          </h3>
                          <div
                            className="flex items-center gap-2 mt-1"
                            style={{
                              color: bottomFooterTextColor,
                            }}
                          >
                            {item?.selected_variant && (
                              <>
                                <span
                                  className="text-base pr-2 border-[#1111111f]"
                                  style={{
                                    borderRight:
                                      themeId === 3
                                        ? "none"
                                        : "1px solid #1111111f",
                                  }}
                                >
                                  <span
                                    className="font-bold"
                                    style={{
                                      color: `${bottomFooterTextColor}a1`,
                                    }}
                                  >
                                    Size:{" "}
                                  </span>
                                  <span className="font-bold text-black uppercase">
                                    {item.selected_variant.variation}
                                  </span>
                                </span>
                              </>
                            )}

                            {themeId !== 3 && (
                              <PriceDisplay
                                price={item?.final_price}
                                quantity={item?.quantity}
                                discountApplied={item?.discountApplied}
                                discountValue={item?.validDiscountValue || 0}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-sm sm:text-base checkout-price">
                        {themeId === 3 && (
                          <PriceDisplay
                            price={item?.final_price}
                            quantity={item?.quantity}
                            discountApplied={item?.discountApplied}
                            discountValue={item?.validDiscountValue || 0}
                          />
                        )}
                        <span
                          style={{
                            opacity: themeId === 3 ? "0.5" : "1",
                          }}
                        >
                          × {item.quantity || 1}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupons Display - Only show if there are applicable coupons */}
            {(() => {
              // Filter to get only applicable coupons
              const applicableCoupons = safeCoupons.filter((coupon) => {
                    const validation = validateCouponForCart(
                      coupon,
                      currentSubtotal,
                      itemsToShow
                    );
                    return validation.isValid;
                  });

              // Only show section if there are applicable coupons
              if (applicableCoupons?.length === 0) {
                return null;
              }

              return (
                <div className="relative w-full my-6">
                  <div
                    className="mb-4 btn-radius"
                    // style={{
                    //   backgroundColor: theme?.backgroundColor || "#ffffff",
                    // }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4
                        className="font-semibold"
                        // style={{ color: textColor }}
                      >
                        Available Coupons
                      </h4>
                      {applicableCoupons?.length > 1 && (
                        <div
                          className="underline text-sm cursor-pointer transition-colors case-class font-medium"
                          style={
                            {
                              // color: textColor,
                            }
                          }
                          onClick={() => setShowCouponsDialog(true)}
                        >
                          View All Coupons
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {applicableCoupons?.slice(0, 1)?.map((coupon) => (
                        <li
                          key={coupon.id}
                          className="flex md:flex-row md:items-center justify-between gap-2 md:gap-4 p-2 px-3 border btn-radius"
                          style={{
                            backgroundColor: `${themeContext?.backgroundColor}50`,
                            borderColor: `${themeContext?.backgroundColor}a1`,
                          }}
                        >
                          {/* User-centered summary */}
                          <span
                            className="font-bold  flex-1"
                            // style={{ color: textColor }}
                          >
                            {coupon.coupon_code}
                          </span>
                          <span className="font-medium ">
                            {coupon.discount_type === "fixed"
                              ? `Save ₹${coupon.discount}`
                              : `Save ${coupon.discount}%`}
                            {coupon.sub_category?.sub_category_name &&
                              ` on ${coupon.sub_category.sub_category_name}`}
                          </span>
                          {coupon.max_discount_amount && (
                            <span className="text-xs text-gray-500 ml-3">
                              (Up to ₹{coupon.max_discount_amount} off)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Discount */}
            {isCouponEnabled && (
              <div className="relative w-full my-6">
                {discount ? (
                  <div className="flex items-center gap-3 mt-3 p-3 border border-green-600 rounded-lg bg-green-50 shadow-sm">
                    <span className="inline-block px-3 py-1 rounded-md border border-green-600 bg-white text-sm font-medium text-green-700">
                      {discount?.coupon?.name}
                    </span>
                    <span className="text-green-700 text-sm font-medium">
                      Coupon Applied!
                    </span>
                    <button
                      onClick={() => {
                        couponForm.resetForm();
                        dispatch(clearDiscount());
                      }}
                      name="Remove Coupon"
                      className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={couponForm.handleSubmit}
                    className="coupon-button-box btn-radius"
                  >
                    {themeId !== 3 && (
                      <>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            id="coupon_code"
                            name="coupon_code"
                            placeholder="Coupon Code"
                            className={`w-full px-4 py-4 text-gray-700 placeholder-gray-500 bg-transparent focus:outline-none 
                      ${couponForm.touched.coupon_code &&
                                couponForm.errors.coupon_code
                                ? "border-red-500"
                                : discount
                                  ? "border-green-500"
                                  : "border-none"
                              }`}
                            style={{
                              color: textColor,
                              backgroundColor: themeContext?.backgroundColor,
                              borderColor: `${textColor}1A`,
                            }}
                            value={couponForm.values.coupon_code}
                            onChange={couponForm.handleChange}
                            onBlur={couponForm.handleBlur}
                            disabled={!!discount || discountLoading}
                          />
                          {couponForm.touched.coupon_code &&
                            couponForm.errors.coupon_code && (
                              <p className="mt-1 text-sm text-red-600 absolute">
                                {couponForm.errors.coupon_code as string}
                              </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                          <LoadingButton
                            type="submit"
                            disabled={couponForm.values.coupon_code === ""}
                            loading={discountLoading}
                            text="Apply"
                            BorderRadius={true}
                            className="custom-rounded-right"
                            backgroundColor={themeContext?.buttonBackgroundColor}
                            textColor={themeContext?.buttonTextColor}
                            borderColor={themeContext?.buttonBorderColor}
                          />
                        </div>
                      </>
                    )}

                    {themeId === 3 && (
                      <div className="">
                        <input
                          type="text"
                          id="coupon_code"
                          name="coupon_code"
                          placeholder="Enter your coupon code"
                          className="border-1 mb-2 border-[#12121226] rounded-4xl px-2 py-3 w-full"
                          value={couponForm.values.coupon_code}
                          onChange={couponForm.handleChange}
                          onBlur={couponForm.handleBlur}
                          disabled={!!discount || discountLoading}
                        />
                        {couponForm.touched.coupon_code &&
                          couponForm.errors.coupon_code && (
                            <p className="mt-1 text-sm text-red-600 absolute ">
                              {couponForm.errors.coupon_code as string}
                            </p>
                          )}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={
                              couponForm.values.coupon_code === ""
                                ? true
                                : false
                            }
                            className={`btn-outline w-full px-2 py-3 rounded-4xl ${couponForm.values.coupon_code === ""
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                              }`}
                            style={{
                              color: themeContext?.buttonBackgroundColor,
                              borderColor: themeContext?.buttonBackgroundColor,
                            }}
                            name="Apply Coupon"
                          >
                            Apply your Coupon
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="my-6">
              <h3 className="text-xl font-bold mb-4 border-t border-[#11111126] pt-6">
                Payment Method
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  className={`relative ${subtotal > 50000 ? "opacity-60" : ""}`}
                >
                  <label
                    className={`flex items-center gap-3 p-2 xl:p-4 border border-radius-xl transition-all duration-300 ${subtotal > 50000
                      ? "cursor-not-allowed bg-gray-50 border-gray-200/40"
                      : paymentMethod === "cod"
                        ? "border-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
                        : "border-[#AAAAAA] hover:border-black/60 cursor-pointer"
                      }`}
                    style={{
                      backgroundColor: themeContext?.bottomFooterBackgroundColor,
                      color: bottomFooterTextColor,
                      borderColor: bottomFooterTextColor,
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="peer hidden "
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      disabled={subtotal > 50000}
                    />
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border shrink-0 ${subtotal > 50000 ? "border-gray-300 bg-gray-100" : ""
                        }`}
                      style={{
                        borderColor: bottomFooterTextColor,
                        backgroundColor: subtotal > 50000 ? "#f3f4f6" : "", // gray-100 fallback if disabled
                      }}
                    >
                      <span
                        className={`relative w-[10px] h-[10px] rounded-full xl:top-[0rem] lg:-mt-[0.02rem] md:top-[0rem] md:left-[0] left-[0.013rem]`}
                        style={{
                          backgroundColor:
                            subtotal > 50000
                              ? "#d1d5db" // gray-300
                              : paymentMethod === "cod"
                                ? bottomFooterTextColor // radio dot uses theme text color when active
                                : "transparent",
                        }}
                      />
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold ${subtotal > 50000 ? "text-gray-500" : ""
                          }`}
                      >
                        Cash on Delivery (COD)
                      </span>
                      {subtotal > 50000 && (
                        <span className="text-xs text-red-500 mt-1">
                          Cash on Delivery option is not available for orders
                          above ₹50,000.
                        </span>
                      )}
                    </div>
                  </label>
                </div>
                {storeInfo?.data?.storeinfo?.prepaid_option === 1 && (
                  <label
                    className={`flex items-center gap-3 p-2 xl:p-4 border border-radius-xl transition-all duration-300 `}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="peer hidden"
                      checked={paymentMethod === "prepaid"}
                      onChange={() => setPaymentMethod("prepaid")}
                    />
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border shrink-0`}
                    >
                      <span
                        className={`relative w-[10px] h-[10px] rounded-full xl:top-[0rem] lg:-mt-[0.02rem] md:top-[0rem] md:left-[0] left-[0.013rem] `}
                        style={{
                          backgroundColor:
                            paymentMethod === "prepaid"
                              ? bottomFooterTextColor // radio dot uses theme text color when active
                              : "",
                        }}
                      />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Prepaid</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
            <div className="space-y-[0.9375rem] checkout-price-details">
              {priceDetails
                ?.filter((item) => item.display !== false)
                ?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium text-lg ">{item.label}</span>
                    <span
                      className={`font-medium text-lg ${item.label.toLowerCase() === "discount"
                        ? "text-green-600"
                        : " "
                        }`}
                    >
                      {item.isFree
                        ? "Free"
                        : `${item.label.toLowerCase() === "discount" ? "-" : ""
                        }₹${item.value || 0}`}
                    </span>
                  </div>
                ))}

              <div className="border-t border-[#11111126] pt-6 my-6 flex justify-between font-medium checkout-price-details ">
                <span className="font-medium text-lg ">Total</span>
                <span className="\text-lg font-bold">₹{discTotal || 0}</span>
              </div>
            </div>
            <LoadingButton
              type="button"
              onClick={() => {
                const addresses = Array.isArray(shippingAddress)
                  ? shippingAddress
                  : [];
                const hasDefaultAddress = addresses?.some(
                  (addr) => addr.is_default
                );
                // Check if there's a selected address, default address, or form is shown
                if (!selectedAddressId && !hasDefaultAddress) {
                  toast.error("Please select a shipping address");
                  return;
                }
                formik.handleSubmit();
              }}
              disabled={
                checkoutLoading ||
                !paymentMethod ||
                (!selectedAddressId &&
                  !(
                    Array.isArray(shippingAddress) &&
                    shippingAddress.some((addr) => addr.is_default)
                  ))
              }
              loading={checkoutLoading}
              text="Place Order"
              backgroundColor={themeContext?.newsletterButtonColor}
              textColor={themeContext?.newsletterButtonTextColor}
              borderColor={themeContext?.newsletterButtonBorderColor}
            />
            <div className="text-center mt-6">
              <ContinueShoppingLink variant="text" />
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Dialog */}
      <CouponsDialog
        open={showCouponsDialog}
        setOpen={setShowCouponsDialog}
        coupons={safeCoupons}
        onApplyCoupon={handleApplyCouponFromDialog}
        currentSubtotal={currentSubtotal}
        // cartItems={itemsToShow}
        validateCoupon={validateCouponForCart}
      />
    </div>
  );
}

export default RetailerCheckout;
