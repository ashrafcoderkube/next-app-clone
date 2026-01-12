'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import * as Yup from 'yup';
import {
  clearBuyNowProduct,
  performWholesalerCheckout,
} from '../redux/slices/checkoutSlice';
import { useEffect } from 'react';
import LoadingButton from '../components/customcomponents/LoadingButton';
import CustomInput from '../components/customcomponents/CustomInput';
import ModalComponent from '../components/model/modal';
import Link from 'next/link';
import ContinueShoppingLink from '../components/ContinueShoppingLink';
import { useTheme } from '../contexts/ThemeContext';
import SafeImage from '../components/SafeImage';
import { getProductImage, truncateWords } from '../utils/common';
import { selectCart, selectStoreInfo } from '../redux/selectors';

function WholesalerCheckout() {
  const navigate = useRouter();
  const dispatch = useAppDispatch();
  const themeContext = useTheme() || {};
  const { buttonBackgroundColor, buttonTextColor, buttonBorderColor } = themeContext;
  const { cartItems } = useAppSelector((selectCart));
  const { isWholesaler } = useAppSelector((selectStoreInfo));
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );
  const { checkoutLoading, buyNowProduct, buyNowQuantity, isBuyNowMode } =
    useAppSelector((state: RootState) => state.checkout);
  const userData = user?.customer || {};

  const itemsToShow =
    isBuyNowMode && buyNowProduct
      ? [
        {
          ...buyNowProduct,
          quantity: buyNowQuantity || 1,
        },
      ]
      : cartItems;

  const updatedCartItems = itemsToShow.map((item) => ({
    ...item,
    finalPrice: parseFloat(
      item?.selected_variant?.final_price || item.final_price || 0
    ),
  }));

  const subtotal = updatedCartItems.reduce(
    (acc, item) => acc + item.finalPrice * (item.quantity || 1),
    0
  );
  const total = subtotal;

  const formik = useFormik({
    initialValues: {
      firstname: user?.existing_retailer?.firstname || userData.firstname || '',
      lastname: user?.existing_retailer?.lastname || userData.lastname || '',
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required('First name is required'),
      lastname: Yup.string().required('Last name is required'),
    }),
    onSubmit: (values) => {
      const products = updatedCartItems.map((item) => {
        const base = { quantity: item.quantity || 1 };
        return isWholesaler
          ? {
            ...base,
            product_id: item.id || item.product_id,
            product_variation: item.selected_variant?.variation || null,
          }
          : {
            ...base,
            retailer_id: item.retailer_id,
            retailer_product_id:
              item.product_id || item.retailer_product_id || item?.id,
            final_amount: Math.round(item.finalPrice * item.quantity),
            product_variation: item.selected_variant?.variation || null,
          };
      });

      const payload = {
        ...values,
        products,
        phone_number: userData.mobile_number || '',
      };

      dispatch(performWholesalerCheckout({ payload, navigate, isBuyNowMode }));
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    return () => {
      dispatch(clearBuyNowProduct());
    };
  }, [dispatch]);

  return (
    <div>
      <section className='w-full max-w-auto 2xl:max-w-[100rem] mx-auto py-10 lg:py-[6.25rem] px-container 2xl:px-[0.9375rem]'>
        <div className='grid md:grid-cols-2 gap-8 text-start xl:gap-8 mx-auto'>
          <div className='w-full'>
            {isAuthenticated ? (
              userData?.firstname && userData?.lastname ? (
                <form
                  id='checkout-form'
                  onSubmit={formik.handleSubmit}
                >
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-[12px] sm:text-sm mb-[4px] sm:mb-2.5 font-bold uppercase'>
                        Phone Number
                      </label>
                      <p className='border border-[#AAAAAA] rounded-lg px-2 xs:px-3 sm:px-4 py-3.5 sm:py-[0.82rem] text-sm xs:text-base bg-gray-100'>
                        {userData.mobile_number || ''}
                      </p>
                    </div>

                    <LoadingButton
                      type='submit'
                      // form="checkout-form"
                      disabled={checkoutLoading}
                      loading={checkoutLoading}
                      text='Place Order'
                      backgroundColor={buttonBackgroundColor}
                      textColor={buttonTextColor}
                      borderColor={buttonBorderColor}
                    />
                  </div>
                </form>
              ) : (
                <form
                  id='checkout-form'
                  onSubmit={formik.handleSubmit}
                >
                  <div className='mb-7 xs:mb-3 sm:mb-7'>
                    <CustomInput
                      id='phone-number'
                      label='PHONE NUMBER'
                      type='tel'
                      value={userData.mobile_number}
                      disabled={true}
                      placeholder='Enter your phone number'
                      inputClassName='bg-gray-100'
                      variant={1}
                    />
                  </div>
                  <div className='mb-3 flex flex-col sm:flex-row space-x-4 space-y-4 sm:space-y-4'>
                    <div className='sm:w-1/2 w-full relative'>
                      <CustomInput
                        id='firstname'
                        name='firstname'
                        label='FIRST NAME'
                        type='text'
                        placeholder='Enter your first name'
                        value={formik.values.firstname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.firstname && formik.errors.firstname
                            ? (formik.errors.firstname as string)
                            : ''
                        }
                        variant={1}
                      />
                    </div>
                    <div className='sm:w-1/2 w-full relative'>
                      <CustomInput
                        id='lastname'
                        name='lastname'
                        label='LAST NAME'
                        type='text'
                        placeholder='Enter your last name'
                        value={formik.values.lastname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.lastname && formik.errors.lastname
                            ? (formik.errors.lastname as string)
                            : ''
                        }
                        variant={1}
                      />
                    </div>
                  </div>

                  <LoadingButton
                    type='submit'
                    // form="checkout-form"
                    disabled={checkoutLoading}
                    loading={checkoutLoading}
                    text='Place Order'
                    backgroundColor={buttonBackgroundColor}
                    textColor={buttonTextColor}
                    borderColor={buttonBorderColor}
                  />
                </form>
              )
            ) : (
              <ModalComponent />
            )}
          </div>
          <div
            className='p-4 md:p-[1.875rem] rounded-[2.125rem]'
            style={{
              backgroundColor: themeContext.bottomFooterBackgroundColor,
              height: 'fit-content',
            }}
          >
            <div className='flex flex-col gap-6'>
              {!isBuyNowMode && (
                <div className='flex justify-between items-center'>
                  <h3 className='text-2xl font-bold'>Your Orders</h3>
                  <Link
                    href='/cart'
                    className='text-sm uppercase underline'
                  >
                    Edit Cart
                  </Link>
                </div>
              )}

              {updatedCartItems.map((item, index) => (
                <div
                  key={index}
                  className='bottom-card'
                >
                  <div className='flex sm:gap-[0.82rem] justify-between'>
                    <div className='flex gap-[0.5rem] sm:gap-[1.5rem]'>
                      <div className='w-[4rem] md:w-[5rem] h-[4rem] md:h-[5rem] rounded-[0.625rem] overflow-hidden shrink-0'>
                        <SafeImage
                          src={getProductImage(item)}
                          alt={item.alternate_name}
                          className='w-full h-full object-cover shrink-0'
                          width={200}
                          height={200}
                        />
                      </div>
                      <div>
                        <h3 className='font-bold line-clamp-2 text-sm sm:text-base'>
                          {truncateWords(item.alternate_name)}
                        </h3>
                        <div className='flex items-center gap-2 text-[#5C5F6A] mt-1'>
                          {item.selected_variant && (
                            <span className='text-base border-r pr-2 border-[#1111111f]'>
                              <span className='font-bold opacity-[0.5]'>
                                Size:{' '}
                              </span>
                              <span className='font-bold uppercase'>
                                {item.selected_variant.variation}
                              </span>
                            </span>
                          )}
                          <span className='text-base font-bold pr-2'>
                            ₹
                            {item.finalPrice ||
                              item?.selected_variant?.final_price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className='font-bold text-sm sm:text-base'>
                      × {item.quantity || 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-[0.9375rem] text-sm'>
              <div className='border-t border-[#11111126] pt-6 my-6 flex justify-between font-medium'>
                <span className='md:text-2xl text-lg font-medium'>Total</span>
                <span className='md:text-2xl text-lg font-medium'>
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className='text-center mt-6'>
              <ContinueShoppingLink variant='text' />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WholesalerCheckout;
