"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
// import { createPortal } from 'react-dom';
import Link from 'next/link';
import Icon from '../customcomponents/Icon';
import OutlineButton from '../customcomponents/OutlineButton';
import { getProductImage, truncateWords } from '../../utils/common';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { RootState } from '@/app/redux/store';
import { useTheme } from '@/app/contexts/ThemeContext';
import useCartQuantity from '@/app/hooks/useCartQuantity';
import {
  getCartQuantityForProduct,
  getCartQuantityForVariant,
  MAX_GUEST_CART_PRODUCT_QUANTITY,
  MAX_GUEST_CART_VARIANT_QUANTITY,
} from "@/app/utils/cartItemUtils";
import {
  removeFromCartApi,
  updateCartItem,
} from "@/app/redux/slices/cartSlice";
import SafeImage from "../SafeImage";
import { useRouter } from "next/navigation";

interface MiniCartProps {
  items?: any;
  onClose: () => void;
  isOpen?: boolean;
}

const MiniCart = ({ items = [], onClose }: MiniCartProps) => {
  const [closing, setClosing] = useState(false);
  const themeContext = useTheme() || {};
  const navigate = useRouter();

  // Lock body scroll when cart popup is open (similar to lightbox behavior)
  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSmoothClose = (callback?: () => void) => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      if (callback) callback();
    }, 300);
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      handleSmoothClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items?.length]);

  const cartContent = (
    <>
      <div
        className={`overlay w-full h-full fixed top-0 left-0 bg-[rgba(0,0,0,.65)] z-[99] transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={() => handleSmoothClose()}
      ></div>
      <div
        className={`scroll-bar flex flex-col justify-between fixed right-0 top-0 z-[100] w-full h-dvh max-w-[31.25rem] bg-white shadow-lg p-7.5 transition-transform duration-300 overflow-y-auto word-break ${closing ? 'translate-x-full' : 'translate-x-0'
          }`}
        style={{ backgroundColor: themeContext?.backgroundColor || '#ffffff' }}
      >
        <div>
          <div className="flex justify-between items-center border-b border-[#11111126] pb-5">
            <h2
              className="text-2xl font-bold"
              style={{ color: themeContext?.bodyTextColor }}
            >
              Cart ({items.length})
            </h2>
            <button
              className="cursor-pointer"
              onClick={() => handleSmoothClose()}
            >
              <Icon
                name="close"
                size={20}
                className="w-5 h-5"
                strokeWidth="2"
              />
            </button>
          </div>

          <div className="flex flex-col gap-6 mb-6 max-h-[calc(100vh-19rem)] overflow-y-auto p-5 scroll-bar">
            {items.map((item: any, index) => (
              <CartItem
                key={`${item.id}-${item?.selected_variant?.id ||
                  item?.selectedVariant?.id ||
                  "na" + index
                }`}
                item={item}
                allCartItems={items}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#11111126] pt-4">
          <OutlineButton
            onClick={() => handleSmoothClose(() => navigate.push("/checkout"))}
            paddingY="!py-3.5"
            height="h-[3.125rem]"
            className="w-full !md:text-[0.8125rem] !text-base"
          >
            Checkout
          </OutlineButton>
          <OutlineButton
            onClick={() => handleSmoothClose(() => navigate.push("/cart"))}
            paddingY="!py-3.5"
            height="h-[3.125rem]"
            className="w-full !md:text-[0.8125rem] !text-base"
          >
            View Cart
          </OutlineButton>
          <Link
            href="/shop"
            onClick={() => handleSmoothClose(() => navigate.push("/shop"))}
            className="text-lg underline cursor-pointer transition-all duration-300 text-center form-lable"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );

  // Use portal to render outside of relative container
  // return typeof document !== "undefined"
  //   ? createPortal(cartContent, document.body)
  //   : null;

  return cartContent;
};

export default MiniCart;

const CartItem = ({ item, allCartItems }) => {
  const dispatch = useAppDispatch();
  const { isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const themeContext = useTheme() || {};
  const availableStock =
    item?.selected_variant?.stock ?? item?.product_stock ?? 0;

  const productIdentity = useMemo(
    () => ({
      product_id: item?.product_id ?? item?.id ?? null,
      id: item?.id ?? item?.product_id ?? null,
      retailer_product_id: item?.retailer_product_id ?? null,
      product_slug: item?.product_slug ?? item?.slug ?? null,
    }),
    [
      item?.id,
      item?.product_id,
      item?.retailer_product_id,
      item?.product_slug,
      item?.slug,
    ]
  );

  const totalProductQuantity = useMemo(
    () => getCartQuantityForProduct(allCartItems, productIdentity),
    [allCartItems, productIdentity]
  );

  const currentVariantQuantity = useMemo(
    () =>
      getCartQuantityForVariant(
        allCartItems,
        productIdentity,
        item?.selected_variant || item?.selectedVariant || null
      ),
    [
      allCartItems,
      productIdentity,
      item?.selected_variant,
      item?.selectedVariant,
    ]
  );

  const { quantity, increase, decrease, canIncrease, canDecrease } =
    useCartQuantity({
      initial: item.quantity,
      availableStock,
      currentVariantQuantity: currentVariantQuantity,
      totalProductQuantity: totalProductQuantity,
      variantLimit: MAX_GUEST_CART_VARIANT_QUANTITY,
      productLimit: MAX_GUEST_CART_PRODUCT_QUANTITY,
      resetKey: item.id,
      onChange: (newQty, action) => {
        if (action === "decrease" && item.quantity === 1) {
          dispatch(removeFromCartApi(item));
          return;
        }
        const quantityChange = action === "increase" ? 1 : -1;
        dispatch(updateCartItem({ item, qty: quantityChange }));
      },
    });

  const handleIncrease = () => {
    if (!canIncrease || isUpdating) return;

    setIsUpdating(true);

    actionTimeoutRef.current = setTimeout(() => {
      increase();
      setIsUpdating(false);
    }, 500);
  };

  const handleDecrease = () => {
    if (!canDecrease || isUpdating) return;

    setIsUpdating(true);

    actionTimeoutRef.current = setTimeout(() => {
      decrease();
      setIsUpdating(false);
    }, 500);
  };

  return (
    <div className="flex gap-4 ">
      <div className="sm:w-25 sm:h-25 w-20 h-20 rounded-[1.125rem] bg-[#AAAAAA]/15 overflow-hidden">
        <SafeImage
          width={69}
          height={69}
          src={getProductImage(item)}
          alt={item.product_name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between gap-2">
        <div className="flex justify-between">
          <p
            className="text-base font-bold line-clamp-1 pr-2"
            style={{ color: themeContext?.bodyTextColor }}
          >
            {truncateWords(item.alternate_name || item.name)}
          </p>
          <p className="text-base font-bold whitespace-nowrap">
            ₹{item.final_price * quantity}
          </p>
        </div>
        {item?.selected_variant?.variation && (
          <div className="text-left">
            <span className="leading-none inline-block text-base">
              Size:
              <strong className="font-bold ml-2">
                {item?.selected_variant?.variation}
              </strong>
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 quantity-wrapper">
          {!isWholesaler && (
            <div className="flex items-center border border-[#AAAAAA] rounded-lg w-fit px-2 py-1 select-none">
              <button
                className='cursor-pointer'
                style={{ minWidth: '1.2rem' }}
                onClick={handleDecrease}
                disabled={!canDecrease || isUpdating}
              >
                <Icon name="minus" className="w-[1rem] h-[1rem]" />
              </button>
              <span className="px-2.5">{quantity}</span>
              <div className="flex relative group">
                <button
                  className='cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 '
                  style={{ minWidth: '1.2rem' }}
                  onClick={handleIncrease}
                  disabled={!canIncrease || isUpdating}
                >
                  <Icon name="plus" className="w-[1rem] h-[1rem]" />
                </button>
                {!canIncrease && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                      bg-black text-white text-xs rounded py-1 px-2 
                      whitespace-nowrap opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200"
                  >
                    No more items can be added
                    <span
                      className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 
                           border-x-4 border-x-transparent border-t-4 border-t-black"
                    ></span>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="text-sm underline cursor-pointer  transition-all duration-300"
            onClick={() => dispatch(removeFromCartApi(item))}
          >
            REMOVE
          </button>
        </div>
      </div>
    </div>
  );
};
