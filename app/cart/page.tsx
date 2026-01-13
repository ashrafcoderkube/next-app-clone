'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCart } from '../redux/slices/cartSlice';
import CartList from '../components/CartList';
import { useTheme } from '../contexts/ThemeContext';
import LoadingButton from '../components/customcomponents/LoadingButton';
import { RootState } from '../redux/store';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import ButtonLink from '../components/customcomponents/ButtonLink';
import { NoImage } from '../components/SafeImage';
import ContinueShoppingLink from '../components/ContinueShoppingLink';
import CustomCategoryCard from '../components/customcomponents/CustomCategoryCard';
import CartSimilar from '../components/CartSimilar';
import { selectProductCategories, selectThemeData } from '../redux/selectors';

function Cart() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor } = themeContext;
  const { cartItems } = useAppSelector((state: RootState) => state.cart);
  const { themeId } = useAppSelector((selectThemeData))
  const { categories } = useAppSelector(selectProductCategories);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const { subtotal, total, itemCount } = useMemo(() => {
    if (!cartItems?.length) {
      return { subtotal: 0, total: 0, itemCount: 0 };
    }

    const sub = cartItems.reduce((sum, item) => {
      return sum + (item.final_price || 0) * Number(item.quantity || 0);
    }, 0);

    return {
      subtotal: sub,
      total: sub,
      itemCount: cartItems?.length,
    };
  }, [cartItems]);

  return (
    <div>
      {cartItems?.length === 0 && themeId === 2 ? (
        <div className='py-padding-70 px-container'>
          <div className='flex flex-col flex-wrap gap-2 justify-between items-center mb-5.5'>
            <h2 className='text-[1.5rem] lg:text-[2rem] font-bold'>
              Your cart is currently empty.
            </h2>
            <h6>Not sure where to start? Try these collections:</h6>
          </div>
          <div className='grid grid-cols-1 gap-[1.5rem]'>
            <div className='grid-responsive-shop word-break'>
              {categories?.length > 0 &&
                categories?.length > 0 &&
                categories?.slice(1, 5)?.map((category: any) => (
                  <CustomCategoryCard
                    key={category.sub_category_id}
                    item={category}
                  />
                ))}
            </div>
            <div className='mt-[20px] lg:mt-[3.125rem]'>
              <ButtonLink to='/shop'>Continue Shopping</ButtonLink>
            </div>
          </div>
        </div>
      ) : cartItems?.length === 0 && themeId === 6 ? (
        <div
          className='py-20 px-container'
          style={{
            backgroundColor: themeContext?.backgroundColor,
          }}
        >
          <div className='flex flex-col items-center justify-center text-center max-w-2xl mx-auto'>
            <NoImage className='mx-auto mb-6 w-48 h-48 opacity-50' />
            <h2 className='text-3xl md:text-4xl font-bold text-[#1e293b] mb-4'>
              Your Cart is Empty
            </h2>
            <p className='text-[#64748b] text-lg mb-8'>
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <div>
              <ButtonLink to='/shop'>Continue Shopping</ButtonLink>
            </div>
          </div>
        </div>
      ) : cartItems?.length === 0 && themeId === 3 ? (
        <div className='py-padding-70 px-container'>
          <div className='flex flex-col flex-wrap gap-2 justify-between items-center '>
            <NoImage className='mx-auto mb-3' />
            <h2 className='text-[1.5rem] lg:text-[2rem] font-bold'>
              Your Cart is empty
            </h2>
            <h6>Add something to make me happy :)</h6>
          </div>
          <div className=''>
            <div className='mt-[10px] lg:mt-[1.125rem]'>
              <ButtonLink to='/shop'>Continue Shopping</ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='mx-auto py-50-padding text-left px-4 sm:px-6 !lg:px-10 !xl:px-0 checkout-container px-container'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-7.5 card-border'>
                <h1 className='text-2xl font-bold mb-0 pb-5 custom-border-b text-left'>
                  Your Cart{' '}
                  <span>
                    {itemCount > 0 &&
                      `(${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
                  </span>
                </h1>
                {cartItems?.length > 0 ? (
                  <div className='space-y-7.5 max-h-[calc(100vh-20.8rem)] overflow-y-auto p-5 scroll-bar hr-line-between'>
                    {cartItems.map((item, index) => (
                      <div key={index}>
                        <CartList item={item} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center p-6'>
                    <NoImage
                      width={300}
                      height={300}
                      className='mx-auto mb-3'
                    />
                    <p className='mb-4'>Your cart is empty.</p>
                    <Link
                      className='inline-flex text-sm sm:text-lg gap-2 btn sm:px-16 px-10 py-4 rounded-lg w-max mx-auto focus:outline-none items-center'
                      href='/shop'
                      prefetch={false}
                    >
                      Continue shopping
                    </Link>
                  </div>
                )}
              </div>
              <aside
                className='bg-[#FFF7F2] border-radius-xl p-[1.875rem] h-fit custom-lg-mt-10'
                style={{
                  backgroundColor: themeContext?.bottomFooterBackgroundColor,
                  color: bottomFooterTextColor,
                  height: 'fit-content',
                }}
              >
                <h2 className='md:text-2xl text-lg font-semibold mb-6'>
                  Order Summary
                </h2>
                <div className='space-y-2'>
                  <div className='flex justify-between  checkout-price-details'>
                    <span className='text-lg'>Subtotal</span>
                    <span className='text-lg'>
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className='flex justify-between checkout-price-details'>
                    <span className='text-lg'>Shipping Cost</span>
                    <span className='text-lg'>Free</span>
                  </div>
                  <div className='border-t border-[#11111126] pt-5 my-4 flex justify-between font-medium checkout-price-details'>
                    <span className='text-lg'>Total</span>
                    <span className='text-lg font-bold'>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <LoadingButton
                  onClick={() => {
                    router.push('/checkout');
                  }}
                  className='border'
                  text={themeId === 4 ? 'Proceed to Checkout' : 'Checkout'}
                  disabled={!cartItems?.length}
                  backgroundColor={themeContext?.newsletterButtonColor}
                  textColor={themeContext?.newsletterButtonTextColor}
                  borderColor={themeContext?.newsletterButtonBorderColor}
                />
                <div className='text-center mt-6'>
                  <ContinueShoppingLink variant='text' />
                </div>
              </aside>
            </div>
          </div>
          {cartItems?.length > 0 && themeId === 2 && <CartSimilar />}
        </>
      )}
    </div>
  );
}

export default Cart;
