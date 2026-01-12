'use client';

import { useMemo } from 'react';
import { getProductImage, truncateWords } from '../utils/common';
import useCartQuantity from '../hooks/useCartQuantity';
import Link from 'next/link';
import SafeImage from './SafeImage';
import Icon from './customcomponents/Icon';
import {
  getCartQuantityForProduct,
  getCartQuantityForVariant,
  MAX_GUEST_CART_VARIANT_QUANTITY,
  MAX_GUEST_CART_PRODUCT_QUANTITY,
} from '../utils/cartItemUtils';
import { useTheme } from '../contexts/ThemeContext';
import { removeFromCartApi, updateCartItem } from '../redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectCart, selectStoreInfo } from '../redux/selectors';

export default function CartList({ item }: { item: any }) {
  const dispatch = useAppDispatch();
  const { cartItems } = useAppSelector((selectCart))
  const { isWholesaler, themeId } = useAppSelector((selectStoreInfo));
  const { textColor } = useTheme() || {};

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
    () => getCartQuantityForProduct(cartItems, productIdentity),
    [cartItems, productIdentity]
  );

  const currentVariantQuantity = useMemo(
    () =>
      getCartQuantityForVariant(
        cartItems,
        productIdentity,
        item?.selected_variant || item?.selectedVariant || null
      ),
    [cartItems, productIdentity, item?.selected_variant, item?.selectedVariant]
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
      onChange: (newQty: number, action: string) => {
        if (action === 'decrease' && item.quantity === 1) {
          dispatch(removeFromCartApi(item));
          return;
        }
        const quantityChange = action === 'increase' ? 1 : -1;
        dispatch(updateCartItem({ item, qty: quantityChange }));
      },
    });

  return (
    <div
      key={item.cart_id}
      className='cart-product-box relative border-radius-xl'
      style={{
        border:
          themeId === 4 || themeId === 5 ? `1px solid ${textColor}10` : 'none',
      }}
    >
      {(themeId === 4 || themeId === 5) && (
        <div
          onClick={() => dispatch(removeFromCartApi(item))}
          className='absolute top-2 right-2 z-10'
        >
          <Icon
            name='close'
            size={20}
            className='w-5 h-5 cursor-pointer text-black'
            strokeWidth='2'
          // stroke={textColor}
          />
        </div>
      )}
      <div className='flex gap-[0.938rem] flex-1 max-w-[33.938rem]'>
        <div className='flex items-center gap-2'>
          {themeId !== 3 && themeId !== 4 && themeId !== 5 && themeId !== 6 && (
            <div
              onClick={() => dispatch(removeFromCartApi(item))}
              className={`${themeId === 1 ? 'hidden' : 'block'}`}
            >
              <Icon
                name='close'
                size={20}
                className='w-5 h-5 cursor-pointer text-black'
                strokeWidth='2'
                stroke={textColor}
              />
            </div>
          )}

          <Link
            href={item?.product_id ? `/product/${item.product_id}` : '#'}
            className={`lg:w-[6.25rem] lg:h-[6.25rem] w-20 h-20 shrink-0 bg-gray-200 overflow-hidden ${themeId === 2 ? 'rounded-[1.125rem]' : 'border-radius-xl'
              }`}
          >
            <SafeImage
              width={69}
              height={69}
              src={getProductImage(item)}
              alt={item?.product_name || 'No product name'}
              className={`lg:w-[6.25rem] lg:h-[6.25rem] w-20 h-20 object-cover ${themeId === 2 ? 'rounded-[1.125rem]' : 'border-radius-xl'
                }`}
            />
          </Link>
        </div>
        <div>
          <Link href={item?.product_id ? `/product/${item.product_id}` : '#'}>
            <div
              className='sm:text-lg text-base font-bold mb-2.5
                 transition-colors duration-300  cursor-pointer'
            >
              {truncateWords(item?.alternate_name || 'Unnamed Product')}
            </div>
          </Link>
          <div className='flex mb-2'>
            {item?.selected_variant?.variation && (
              <span className='leading-none inline-block font-bold text-base opacity-[0.5] border-r border-[#AAAAAA] pr-2 mr-2'>
                Size:
                <strong className='font-bold ml-2'>
                  {item?.selected_variant?.variation}
                </strong>
              </span>
            )}
            <div className='flex items-center gap-2'>
              <span className='leading-none text-base font-bold  '>
                ₹
                {item?.final_price
                  ? item.final_price.toLocaleString('en-IN')
                  : 0}
              </span>
            </div>
          </div>
          {themeId !== 3 && themeId !== 4 && themeId !== 5 && themeId !== 6 && (
            <button
              name='Remove from Cart'
              onClick={() => dispatch(removeFromCartApi(item))}
              className={`text-sm underline uppercase cursor-pointer ${themeId === 2 ? 'hidden' : 'block'
                }`}
            >
              Remove
            </button>
          )}
          {(themeId === 4 || themeId === 5) && !isWholesaler && (
            <div className='flex items-center gap-2 border-[#AAAAAA] border-radius-xl mt-2'>
              <button
                name='Decrease Quantity'
                onClick={decrease}
                className='text-2xl font-normal focus:outline-none cursor-pointer flex justify-center border border-[#AAAAAA] border-radius-xl px-1 py-1'
                // style={{ minWidth: "2.5rem" }}
                disabled={!canDecrease}
              >
                <Icon
                  name='minus'
                  className='w-5 h-5'
                />
              </button>
              <span className='text-base font-normal select-none w-4  flex justify-center'>
                {quantity}
              </span>
              <div className='relative group'>
                <button
                  name='Increase Quantity'
                  onClick={increase}
                  disabled={!canIncrease}
                  className='text-2xl font-normal focus:outline-none flex justify-center
                    cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border border-[#AAAAAA] border-radius-xl px-1 py-1'
                // style={{ minWidth: "2.5rem" }}
                >
                  <Icon
                    name='plus'
                    className='w-5 h-5'
                  />
                </button>
                {!canIncrease && (
                  <div
                    className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                      bg-black text-white text-xs rounded-md py-1 px-2
                      whitespace-nowrap opacity-0 group-hover:opacity-100
                      transition-opacity duration-200'
                  >
                    No more items can be added
                    <span
                      className='absolute left-1/2 top-full -translate-x-1/2 w-0 h-0
                              border-x-4 border-x-transparent border-t-4 border-t-black'
                    ></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex md:items-center items-end md:justify-between md:flex-row flex-col'>
        {themeId !== 4 && themeId !== 5 && !isWholesaler && (
          <div
            className='flex items-center md:gap-7.5 md:h-12 h-10 border border-radius-xl md:mr-[4rem] max-md:mb-2'
            style={{
              borderColor: `${textColor}2A`,
            }}
          >
            <button
              name='Decrease Quantity'
              onClick={decrease}
              className='text-2xl font-normal focus:outline-none cursor-pointer flex justify-center'
              style={{ minWidth: '2.5rem' }}
              disabled={!canDecrease}
            >
              <Icon
                name='minus'
                className='w-5 h-5'
              />
            </button>
            <span className='text-base font-normal select-none w-1'>
              {quantity}
            </span>
            <div className='relative group'>
              <button
                name='Increase Quantity'
                onClick={increase}
                disabled={!canIncrease}
                className='text-2xl font-normal focus:outline-none flex justify-center
                 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                style={{ minWidth: '2.5rem' }}
              >
                <Icon
                  name='plus'
                  className='w-5 h-5'
                />
              </button>
              {!canIncrease && (
                <div
                  className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                   bg-black text-white text-xs rounded-md py-1 px-2
                   whitespace-nowrap opacity-0 group-hover:opacity-100
                   transition-opacity duration-200'
                >
                  No more items can be added
                  <span
                    className='absolute left-1/2 top-full -translate-x-1/2 w-0 h-0
                           border-x-4 border-x-transparent border-t-4 border-t-black'
                  ></span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='flex items-center'>
          <p
            className='text-lg font-bold w-[80px]'
          // style={{
          //   color: textColor,
          // }}
          >
            ₹
            {item?.final_price && item?.quantity
              ? (item.final_price * item.quantity).toLocaleString('en-IN')
              : 0}
          </p>
        </div>
      </div>

      {themeId === 3 && (
        <button
          name='Remove from Cart'
          onClick={() => dispatch(removeFromCartApi(item))}
          className={`text-sm  uppercase cursor-pointer `}
        >
          <Icon
            name={'delete'}
            strokeWidth='2'
            stroke={textColor}
            className='h-6 w-6 cursor-pointer'
          />
        </button>
      )}
    </div>
  );
}
