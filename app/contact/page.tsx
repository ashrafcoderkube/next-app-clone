'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LoadingButton from '../components/customcomponents/LoadingButton';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/customcomponents/Icon';
import CustomInput from '../components/customcomponents/CustomInput';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { RootState } from '../redux/store';
import { useFormik } from 'formik';
import { ContactSchema } from '../utils/validation';
import { submitContactForm } from '../redux/slices/contactSlice';
import { selectContactData } from '../redux/selectors';
import whatsappIcon from '../assets/Whatsapp.svg';

function Contacts() {
  const themeContext = useTheme() || {};
  const { textColor, footerTextColor, bottomFooterTextColor } = themeContext;
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectContactData);

  // Formik form setup with validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone_number: '',
      subject: '',
      message: '',
      subscribe: false,
    },
    validationSchema: ContactSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const result = await dispatch(submitContactForm(values)).unwrap();
        // Reset form on successful submission
        resetForm();
      } catch (error: any) {
        // Error is already handled in the slice with toast
        console.error('Contact form submission error:', error);
      }
    },
  });

  const { storeInfo, themeId } = useAppSelector(
    (state: RootState) => state.storeInfo
  );

  // Extract store info data for easier access
  const storeInfoData = storeInfo?.data?.storeinfo;

  return (
    <div>
      {/* Page title replaced with metadata export (see layout.tsx) */}

      <div className='px-container mx-auto py-10 md:py-[6.5rem] px-4 sm:px-6 lg:px-[4.6875rem] 2xl:px-[0] text-left'>
        <div className='flex flex-col lg:flex-row gap-[1.5rem] xl:gap-y-[4.375rem]'>
          <div className='space-y-6 lg:w-2/6'>
            {(storeInfoData?.email ||
              storeInfoData?.mobile_no ||
              storeInfoData?.address ||
              storeInfoData?.enquiry_whatsapp) && (
              <div
                className='rounded-lg bg-[#fff7f2] p-5 flex flex-col gap-3'
                style={{
                  backgroundColor: themeContext?.bottomFooterBackgroundColor,
                  color: bottomFooterTextColor,
                }}
              >
                <h3 className='font-semibold text-lg lg:text-2xl pb-2 border-b border-[#f3f3f3]'>
                  Contact Information
                </h3>
                {storeInfoData?.email && (
                  <Link
                    className='flex gap-2 text-base items-center hover:brightness-80 transition-all duration-600 ease-in-out'
                    href={`mailto:${storeInfoData.email}`}
                  >
                    <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                      <Icon
                        name='mail2'
                        strokeWidth='2'
                        fill='none'
                        className='w-[1.125rem] h-[1.125rem]'
                      />
                    </span>
                    <span>{storeInfoData.email}</span>
                  </Link>
                )}
                {storeInfoData?.mobile_no && (
                  <Link
                    className='flex gap-2 text-base items-center hover:brightness-80 transition-all duration-600 ease-in-out'
                    href={`tel:${storeInfoData.mobile_no}`}
                  >
                    <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                      <Icon
                        name='call2'
                        strokeWidth='2'
                        fill='none'
                        className='w-[1.125rem] h-[1.125rem]'
                      />
                    </span>
                    <span>{storeInfoData.mobile_no}</span>
                  </Link>
                )}
                {storeInfoData?.address && (
                  <Link
                    className='flex gap-2 text-base hover:brightness-80 transition-all duration-600 ease-in-out'
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      storeInfoData.address || ''
                    )}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                      <Icon
                        name='map'
                        strokeWidth='2'
                        fill='none'
                        className='w-[1.125rem] h-[1.125rem]'
                        viewBox='0 0 18 18'
                      />
                    </span>
                    <span>{storeInfoData.address || ''}</span>
                  </Link>
                )}
              </div>
            )}

            {storeInfoData?.store_time && (
              <div
                className='rounded-lg bg-[#fff7f2] p-5 flex flex-col gap-3'
                style={{
                  backgroundColor: themeContext?.bottomFooterBackgroundColor,
                  color: bottomFooterTextColor,
                }}
              >
                <h3 className='font-semibold text-lg lg:text-2xl pb-2 border-b border-[#f3f3f3]'>
                  Business Hours
                </h3>
                <div className='flex flex-col gap-2 text-base'>
                  <span>{storeInfoData.store_time}</span>
                </div>
              </div>
            )}

            {(storeInfoData?.facebook_url ||
              storeInfoData?.instagram_url ||
              storeInfoData?.twitter_url) && (
              <div
                className='rounded-lg bg-[#fff7f2] p-5 flex items-center gap-4'
                style={{
                  backgroundColor: themeContext?.bottomFooterBackgroundColor,
                  color: bottomFooterTextColor,
                }}
              >
                <div className='w-full'>
                  <h3 className='font-semibold text-lg lg:text-2xl pb-2 border-b border-[#f3f3f3]'>
                    Follow Our Journey
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-3'>
                    {storeInfoData?.facebook_url && (
                      <Link
                        className='flex gap-2 text-base items-center hover:brightness-80 transition-all duration-600 ease-in-out'
                        href={storeInfoData.facebook_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                          <Icon
                            name='facebook'
                            strokeWidth='0'
                            fill='white'
                            className='w-[1.125rem] h-[1.125rem]'
                            viewBox='0 0 25 24'
                          />
                        </span>
                        <span>Facebook</span>
                      </Link>
                    )}
                    {storeInfoData?.instagram_url && (
                      <Link
                        className='flex gap-2 text-base items-center hover:brightness-80 transition-all duration-600 ease-in-out'
                        href={storeInfoData.instagram_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                          <Icon
                            name='instagram'
                            strokeWidth='0'
                            fill='white'
                            className='w-[1.125rem] h-[1.125rem]'
                            viewBox='0 0 25 24'
                          />
                        </span>
                        <span>Instagram</span>
                      </Link>
                    )}
                    {storeInfoData?.twitter_url && (
                      <Link
                        className='flex gap-2 text-base items-center hover:brightness-80 transition-all duration-600 ease-in-out'
                        href={storeInfoData.twitter_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <span className='flex items-center justify-center w-8 h-8 bg-[#111111] rounded-full p-1 shrink-0'>
                          <Icon
                            name='twitter'
                            size={18}
                            fill='#ffffff'
                            stroke={footerTextColor || '#ffffff'}
                            viewBox='0 0 24 24'
                            strokeWidth='0.2'
                            className='w-[1.125rem] h-[1.125rem]'
                          />
                        </span>
                        <span>X Corp.</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='rounded-2xl lg:w-8/12 lg:pl-5'>
            <div className='mb-6'>
              <h6
                className='sm:text-3xl text-2xl font-bold uppercase mb-3'
                style={{ color: themeContext?.bodyTextColor }}
              >
                How can we help?
              </h6>
              <p className='text-base'>
                We'd love to hear from you. Whether you have a question,
                feedback, or just want to connect — our team is here
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='mb-6 flex flex-col sm:flex-row'>
                <div className='w-full sm:w-1/2 mb-6 md:mb-0 sm:pr-3'>
                  <CustomInput
                    id='firstname'
                    label='First Name'
                    placeholder='Enter your First name'
                    value={values.firstname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstname && errors.firstname ? errors.firstname : ''}
                  />
                </div>
                <div className='w-full sm:w-1/2 sm:pl-3'>
                  <CustomInput
                    id='lastname'
                    label='Last Name'
                    placeholder='Enter your Last name'
                    value={values.lastname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastname && errors.lastname ? errors.lastname : ''}
                  />
                </div>
              </div>
              <div className='mb-6'>
                <CustomInput
                  id='email'
                  type='email'
                  label='Email'
                  placeholder='Enter your email'
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email ? errors.email : ''}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div className='mb-6'>
                <CustomInput
                  id='phone_number'
                  type='tel'
                  label='Phone Number'
                  placeholder='Enter mobile number'
                  value={values.phone_number}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'phone_number', value: numericValue } });
                  }}
                  onBlur={handleBlur}
                  error={touched.phone_number && errors.phone_number ? errors.phone_number : ''}
                />
              </div>
              <div className='mb-6 relative'>
                <label
                  className='block mb-2.5 font-bold form-lable'
                  htmlFor='subject'
                >
                  Subject
                </label>
                <select
                  id='subject'
                  name='subject'
                  className={`w-full border p-[0.82rem] focus:outline-none border-[#AAAAAA] form-control ${
                    touched.subject && errors.subject ? 'border-red-500' : ''
                  }`}
                  style={{
                    color: textColor,
                    backgroundColor: themeContext?.backgroundColor,
                    borderColor: `${textColor}1A`,
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.subject}
                >
                  <option
                    value=''
                    style={{
                      color: textColor,
                      backgroundColor: themeContext?.backgroundColor,
                      opacity: 0.5,
                    }}
                  >
                    Select a subject
                  </option>
                  <option
                    value='order'
                    style={{
                      color: textColor,
                      backgroundColor: themeContext?.backgroundColor,
                    }}
                  >
                    Order Inquiry
                  </option>
                  <option
                    value='returns'
                    style={{
                      color: textColor,
                      backgroundColor: themeContext?.backgroundColor,
                    }}
                  >
                    Returns & Refunds
                  </option>
                  <option
                    value='product'
                    style={{
                      color: textColor,
                      backgroundColor: themeContext?.backgroundColor,
                    }}
                  >
                    Product Question
                  </option>
                </select>
                {touched.subject && errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div className='mb-6 relative'>
                <label
                  className='block mb-2.5 font-bold form-lable'
                  htmlFor='message'
                >
                  Message
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows={4}
                  className={`w-full border ${
                    themeId === 5
                      ? 'rounded-none'
                      : themeId === 6
                      ? 'rounded-lg border-[#a7f3d0] focus:border-[#10b981]'
                      : '!rounded-xl'
                  } p-[0.82rem] border-gray-300 focus:outline-none ${
                    touched.message && errors.message ? 'border-red-500' : ''
                  }`}
                  placeholder='Enter your message'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.message}
                ></textarea>
                {touched.message && errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <div className='mb-6'>
                <label className='flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    name='subscribe'
                    className='form-checkbox h-5 w-5 text-blue-600 shrink-0 cursor-pointer'
                    onChange={(e) =>
                      handleChange({ target: { name: 'subscribe', value: e.target.checked } })
                    }
                    checked={values.subscribe}
                  />
                  <span className='ml-2'>
                    I would like to receive updates and promotions via email.
                  </span>
                </label>
              </div>
              <div>
                <LoadingButton
                  type='submit'
                  disabled={loading}
                  loading={loading}
                  text='Send Message'
                  backgroundColor={themeContext?.buttonBackgroundColor}
                  textColor={themeContext?.buttonTextColor}
                  borderColor={themeContext?.buttonBorderColor}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
