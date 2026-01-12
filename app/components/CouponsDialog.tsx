"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  X,
  Tag,
  Info,
  DollarSign,
  CreditCard,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface Coupon {
  id: string;
  coupon_code: string;
  discount_type: 'fixed' | 'percentage';
  discount: number;
  coupon_name?: string;
  description?: string;
  sub_category?: {
    sub_category_name: string;
  };
  min_order_amount?: number;
  max_order_amount?: number;
  payment_method?: string;
}

interface CartItem {
  id?: string | number;
  product_id?: number | string;
  retailer_product_id?: number | string;
  product_slug?: string;
  slug?: string;
  selectedVariant?: any;
  selected_variant?: any;
  quantity?: number | string;
  product_name?: string;
  name?: string;
  images?: any;
  cover_image?: string;
  product_stock?: number;
  wishlist_id?: number | string | null;
  final_price?: number;
  retailer_id?: number | string;
  wholesaler_id?: number | string;
  sub_category_id?: number | string;
  category_id?: number | string;
  status?: string | number;
  message?: string;
  [key: string]: any;
}

interface CouponsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  coupons?: Coupon[];
  onApplyCoupon?: (coupon: Coupon, subtotal: number) => void;
  currentSubtotal?: number;
  cartItems?: CartItem[];
  validateCoupon?: (coupon: Coupon, subtotal: number, cartItems: CartItem[]) => { isValid: boolean; reason?: string };
}

export default function CouponsDialog({
  open,
  setOpen,
  coupons = [],
  onApplyCoupon,
  currentSubtotal = 0,
  cartItems = [],
  validateCoupon,
}: CouponsDialogProps) {
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const formatPaymentMethod = (method: string) => {
    if (!method) return null;
    if (method === "both") return "COD & Prepaid";
    if (method === "cod") return "Cash on Delivery";
    if (method === "prepaid") return "Prepaid Only";
    return method;
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className='relative z-50'
    >
      <DialogBackdrop
        transition
        className='fixed inset-0 bg-black/40 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200'
      />

      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <DialogPanel
          transition
          className='relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-2xl max-h-[90vh] flex flex-col data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200'
          style={{ backgroundColor: themeContext?.backgroundColor || "#ffffff" }}
        >
          {/* Header */}
          <div className='p-6 border-b border-gray-200/40 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className='flex h-12 w-12 items-center justify-center rounded-full'
                style={{
                  backgroundColor: `${textColor}5A`,
                }}
              >
                <Tag
                  style={{
                    color: textColor,
                  }}
                  size={24}
                />
              </div>
              <DialogTitle
                as='h3'
                className='text-xl font-semibold'
              >
                Available Coupons
              </DialogTitle>
            </div>
            <button
              name="Close Coupons Dialog"
              onClick={() => setOpen(false)}
              className='transition-colors cursor-pointer'
              style={{
                color: textColor,
              }}
            >
              <X
                style={{
                  color: textColor,
                }}
                size={24}
              />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-6 scroll-bar'>
            {coupons.length === 0 ? (
              <div className='text-center py-12'>
                <p
                  className='text-lg'
                  style={{ color: textColor }}
                >
                  No coupons available
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {coupons.map((coupon) => {
                  // Validate coupon for current cart
                  const validation =
                    validateCoupon && typeof validateCoupon === "function"
                      ? (() => {
                          try {
                            return validateCoupon(
                              coupon,
                              currentSubtotal,
                              cartItems
                            );
                          } catch (error) {
                            console.error("Error validating coupon:", error);
                            return { isValid: true, reason: null };
                          }
                        })()
                      : { isValid: true, reason: null };

                  const isInvalid = !validation.isValid;

                  return (
                    <div
                      key={coupon.id}
                      className={`border rounded-lg p-5 transition-all duration-200 ${
                        isInvalid ? "opacity-75" : "opacity-100"
                      }`}
                      style={{
                        backgroundColor: themeContext?.bottomFooterBackgroundColor,
                        color: bottomFooterTextColor,
                      }}
                    >
                      {/* Coupon Header */}
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4'>
                        <div className='flex items-center gap-3 flex-wrap'>
                          <span
                            className='font-semibold text-lg px-4 py-2 rounded-md border-2'
                            style={{
                              borderColor: `${textColor}20`,
                              backgroundColor: `${textColor}30`,
                            }}
                          >
                            {coupon.coupon_code}
                          </span>
                          <span className='font-semibold text-lg'>
                            {coupon.discount_type === "fixed"
                              ? `₹${coupon.discount}`
                              : `${coupon.discount}%`}{" "}
                            off
                          </span>
                        </div>
                      </div>

                      {/* Coupon Name */}
                      {coupon.coupon_name && (
                        <h4 className='font-semibold text-base mb-3'>
                          {coupon.coupon_name}
                        </h4>
                      )}

                      {/* Description */}
                      {coupon.description && (
                        <p className='text-sm text-gray-600 mb-4 leading-relaxed'>
                          {coupon.description}
                        </p>
                      )}

                      {/* Coupon Details Grid */}
                      <div
                        className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t'
                        style={{
                          borderColor: "#ffffff66",
                        }}
                      >
                        {/* Sub Category */}
                        {coupon.sub_category && (
                          <div className='flex items-start gap-2'>
                            <ShoppingBag
                              className='text-blue-600 mt-0.5'
                              size={16}
                            />
                            <div>
                              <p
                                className='text-xs font-medium'
                                style={{ color: textColor }}
                              >
                                Valid On
                              </p>
                              <p
                                className='text-sm font-semibold'
                                style={{ color: textColor }}
                              >
                                {coupon.sub_category.sub_category_name}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Min Order Amount */}
                        {coupon.min_order_amount && (
                          <div className='flex items-start gap-2'>
                            <div>
                              <p className='text-xs font-medium'>
                                Min Order
                              </p>
                              <p className='text-sm font-semibold'>
                                ₹{coupon.min_order_amount}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Max Order Amount */}
                        {coupon.max_order_amount && (
                          <div className='flex items-start gap-2'>
                            <div>
                              <p className='text-xs font-medium'>
                                Max Order
                              </p>
                              <p className='text-sm font-semibold'>
                                ₹{coupon.max_order_amount}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Payment Method */}
                        {coupon.payment_method && (
                          <div className='flex items-start gap-2'>
                            <CreditCard
                              className='text-blue-600 mt-0.5'
                              size={16}
                            />
                            <div>
                              <p className='text-xs font-medium'>
                                Payment Method
                              </p>
                              <p className='text-sm font-semibold'>
                                {formatPaymentMethod(coupon.payment_method)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Order Amount Range Info */}
                      {(coupon.min_order_amount || coupon.max_order_amount) &&
                        !isInvalid && (
                          <div
                            className='mt-4 p-3 border btn-radius'
                            style={{
                              borderColor: "#ffffff66",
                            }}
                          >
                            <div className='flex items-center gap-2'>
                              <Info
                                className='text-blue-600 mt-0.5 flex-shrink-0'
                                size={16}
                              />
                              <p className='text-xs leading-relaxed'>
                                {coupon.min_order_amount &&
                                coupon.max_order_amount
                                  ? `This coupon is valid for orders between ₹${coupon.min_order_amount} and ₹${coupon.max_order_amount}`
                                  : coupon.min_order_amount
                                  ? `Minimum order amount of ₹${coupon.min_order_amount} required`
                                  : `Maximum order amount of ₹${coupon.max_order_amount} allowed`}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Validation Error Message */}
                      {isInvalid && validation.reason && (
                        <div className='mt-4 p-3 bg-red-50 border border-red-200 btn-radius'>
                          <div className='flex items-center gap-2'>
                            <AlertCircle
                              className='text-red-600 mt-0.5 flex-shrink-0'
                              size={16}
                            />
                            <p className='text-xs text-red-700 leading-relaxed font-medium'>
                              {validation.reason}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Apply Button */}
                      <div className='mt-4 pt-4 border-t border-blue-100'>
                        <button
                          name="Apply Coupon"
                          onClick={() => {
                            if (onApplyCoupon && !isInvalid) {
                              onApplyCoupon(coupon, currentSubtotal);
                            }
                          }}
                          disabled={isInvalid}
                          className={`w-full btn-radius inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold transition border ${
                            isInvalid
                              ? "cursor-not-allowed"
                              : "btn cursor-pointer hover:opacity-90"
                          }`}
                          style={{
                            backgroundColor: themeContext?.buttonBackgroundColor,
                            color: themeContext?.buttonTextColor,
                            borderColor: themeContext?.buttonBorderColor,
                          }}
                        >
                          <Tag size={16} />
                          {isInvalid ? "Not Applicable" : "Apply Coupon"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-gray-200/40'>
            <button
              name="Close Coupons Dialog"
              onClick={() => setOpen(false)}
              className='w-full btn cursor-pointer inline-flex justify-center rounded-md px-4 py-3.5 text-sm font-semibold text-white transition'
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
