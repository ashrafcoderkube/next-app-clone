'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  clearOrders,
  fetchCustomerOrders,
} from '../../redux/slices/customerOrdersSlice';
import { formatStatus, formatDate } from '../../utils/common';
import Loader from '../customcomponents/Loader';
import Icon from '../customcomponents/Icon';
import OutlineButton from '../customcomponents/OutlineButton';
import CancelOrder from '../model/CancelOrder';
import { useTheme } from '../../contexts/ThemeContext';
import {
  closeOrderPopup,
  openOrderPopup,
} from '../../redux/slices/trackOrderSlice';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { RootState } from '@/app/redux/store';
import SafeImage from '../SafeImage';

const Orders = () => {
  const dispatch = useAppDispatch();
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const navigate = (path: string) => {
    window.location.href = path; // Simple navigation for Next.js
  };
  const { orders, loading } = useAppSelector(
    (state: RootState) => state.customerOrders
  );

  const [openCancelModel, setOpenCancelModel] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const ordersList = orders?.orders || [];
  const totalItems = ordersList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = ordersList.slice(startIndex, endIndex);

  const { themeId, isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );

  useEffect(() => {
    dispatch(fetchCustomerOrders());
    return () => {
      dispatch(clearOrders());
    };
  }, [dispatch]);

  const handleViewOrderDetails = (order: any) => {
    dispatch(openOrderPopup(order));
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Order has been placed':
        return {
          background: '#FFF8DD',
          color: '#F6C000',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // yellow

      case 'Order is confirmed':
        return {
          background: '#D4EDDA',
          color: '#155724',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // green

      case 'Order is shipped':
        return {
          background: '#e9f3ff',
          color: '#007bff',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // blue

      case 'Order is delivered':
        return {
          background: '#E8F5E8',
          color: '#2E7D32',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // darker green

      case 'Order has been cancelled':
        return {
          background: '#FFCDD2',
          color: '#E53935',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // red

      default:
        return {
          background: '#E2E3E5',
          color: '#383D41',
          padding: '0.25rem 0.5rem',
          borderRadius: themeId === 5 ? '' : 'border-radius-xl',
        }; // gray
    }
  };

  const displayCancelButton = (rawStatus: string) => {
    if (!rawStatus) return false;
    const allowedStatuses = ['order has been placed'];
    return allowedStatuses.includes(String(rawStatus).toLowerCase().trim());
  };

  return (
    <>
      <div className='w-full account-box'>
        <div className='my-account-container flex justify-between w-full items-center'>
          <h3 className='text-2xl font-bold'>Orders</h3>
        </div>
        {themeId !== 4 && themeId !== 5 && themeId !== 6 && (
          <hr className='my-account-container-hr' />
        )}

        {loading ? (
          <Loader />
        ) : totalItems > 0 ? (
          <>
            <div className='custom-grid word-break'>
              {currentOrders?.map((val: any) => {
                const status = formatStatus(val?.status);
                const statusStyle = getStatusStyles(status);
                const orderId = val?.order_id;
                return (
                  <div key={val?.order_id}>
                    {themeId === 1 && (
                      <div className='flex flex-col mt-[1.5rem] text-start'>
                        <div className='rounded-[0.625rem] border border-[#AAAAAA]/15 overflow-auto'>
                          <div
                            className='top-card px-[0.938rem] py-3 ! '
                            style={{
                              backgroundColor:
                                themeContext?.bottomFooterBackgroundColor,
                              color: bottomFooterTextColor,
                            }}
                          >
                            <div className='flex flex-wrap sm:gap-[1.5rem] gap-[1rem] justify-between ! '>
                              <div className='flex flex-wrap sm:gap-[2rem] gap-[1rem]'>
                                <div>
                                  <span className='text-sm uppercase'>
                                    Order Date:
                                  </span>
                                  <p className='text-sm font-bold'>
                                    {val?.order_date}
                                  </p>
                                </div>
                                <div>
                                  <span className='text-sm uppercase'>
                                    Total:
                                  </span>
                                  <p className='text-sm font-bold'>
                                    ₹{val?.final_amount}
                                  </p>
                                </div>
                                <div>
                                  <span className='text-sm uppercase'>
                                    Status:
                                  </span>
                                  <p className='text-sm font-bold border border-[#111111]/30 px-[0.5rem] py-[0.25rem] rounded-[8px]'>
                                    {status}
                                  </p>
                                </div>
                              </div>

                              <div className='flex flex-wrap sm:gap-[2rem] gap-[1rem]'>
                                <div>
                                  <span className='text-sm uppercase'>
                                    Order Id:
                                  </span>
                                  <p className='text-sm font-bold'>
                                    {val?.id}
                                  </p>
                                </div>
                                {val?.awb_number && (
                                  <div>
                                    <span className='text-sm uppercase'>
                                      Tracking Id:
                                    </span>
                                    <p className='text-sm font-bold'>
                                      {val?.awb_number}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex justify-between bottom-card p-[0.938rem] flex-col sm:flex-row '>
                            <div className='flex flex-wrap gap-[0.938rem]'>
                              <div className='w-[8rem] h-[8rem] rounded-[0.625rem] overflow-hidden border border-[#AAAAAA]/15'>
                                <SafeImage
                                  width={128}
                                  height={128}
                                  src={val?.cover_image}
                                  alt={val?.alternate_name || val?.name}
                                  className='w-full h-full object-cover'
                                />
                              </div>
                              <div>
                                <h6 className='sm:text-lg font-bold'>
                                  {val?.alternate_name || val?.name}
                                </h6>
                                <div className='flex mb-2'>
                                  <span className='leading-none inline-block font-bold text-base opacity-[0.5] mr-2'>
                                    Quantity:
                                    <strong className='font-bold ml-2 '>
                                      {val?.quantity}
                                    </strong>
                                  </span>
                                  {val?.product_variation && (
                                    <span className='leading-none border-l border-[#AAAAAA] inline-block font-bold text-base opacity-[0.5]  pl-2 mr-2'>
                                      Size:
                                      <strong className='font-bold ml-2 '>
                                        {val?.product_variation}
                                      </strong>
                                    </span>
                                  )}
                                </div>
                                <div className='flex flex-wrap gap-[0.938rem] items-center mt-[0.5rem]'>
                                  <Link
                                    href={`/product/${val?.product_id}`}
                                    className='inline-flex text-sm gap-2 btn px-[0.9375rem] py-[0.5rem] rounded-lg font-medium focus:outline-none items-center border'
                                    style={{
                                      backgroundColor:
                                        themeContext?.buttonBackgroundColor,
                                      color: themeContext?.buttonTextColor,
                                      //   borderColor: buttonBorderColor,
                                    }}
                                  >
                                    Buy it Again
                                  </Link>
                                  {displayCancelButton(val?.status) && (
                                    <button
                                      className='inline-flex text-sm gap-2 btn px-[0.9375rem] py-[0.5rem] rounded-lg font-medium focus:outline-none items-center !bg-red-500 !text-white hover:bg-red-700'
                                      onClick={() => {
                                        setSelectedOrderId(orderId);
                                        setOpenCancelModel(true);
                                        // dispatch(closeOrderPopup());
                                      }}
                                      style={{
                                        borderColor: `${textColor}1A`,
                                      }}
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className='flex sm:flex-col gap-[0.938rem] items-center mt-[0.5rem] sm:max-w-[10rem]'>
                                {!isWholesaler && val?.awb_number && (
                                  <Link
                                    href={`/track-order/${val?.awb_number}`}
                                    className='inline-flex text-sm gap-2 btn px-[2rem] py-[0.5rem] rounded-lg border font-medium focus:outline-none items-center'
                                    style={{
                                      backgroundColor:
                                        themeContext?.buttonBackgroundColor,
                                      color: themeContext?.buttonTextColor,
                                      //   borderColor: buttonBorderColor,
                                    }}
                                  >
                                    Track Order
                                  </Link>
                                )}
                                <Link
                                  href='#'
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleViewOrderDetails(val);
                                  }}
                                  className='underline uppercase text-sm'
                                  style={{
                                    color: themeContext?.buttonTextColor,
                                    // borderColor: buttonBorderColor,
                                  }}
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {themeId === 2 && (
                      <div>
                        <div
                          className='rounded-[0.625rem] border overflow-hidden p-4 flex flex-col h-full'
                          style={{
                            borderColor: `${textColor}2A`,
                          }}
                        >
                          <div className='top-card'>
                            <div className='flex flex-wrap  gap-[0.5rem] justify-between w-full items-center text-sm'>
                              <div>
                                <p className='text-sm font-semibold'>
                                  {val?.order_number}
                                </p>
                              </div>
                              <div>
                                <p className='text-sm font-semibold bg-[var(--bg-color-gray-100)] px-[0.5rem] py-[0.25rem] rounded-[var(--radius-full)]'>
                                  {status}
                                </p>
                              </div>
                            </div>
                          </div>
                          <hr
                            className='my-[0.9375rem]'
                            style={{
                              borderColor: `${textColor}2A`,
                            }}
                          />
                          <div className='flex flex-col justify-between bottom-card gap-[0.9375rem] h-full'>
                            <div className='flex gap-[0.938rem]'>
                              <div
                                className='w-[6rem] h-[6rem] rounded-[0.625rem] overflow-hidden shrink-0 border'
                                style={{
                                  borderColor: `${textColor}2A`,
                                }}
                              >
                                <SafeImage
                                  src={val?.cover_image}
                                  alt={val?.product_name}
                                  width={96}
                                  height={96}
                                  className='w-full h-full object-cover'
                                />
                              </div>
                              <div className='text-start text-base'>
                                <h6 className='font-semibold line-clamp-1'>
                                  {val?.product_name}
                                </h6>
                                <div className='flex mb-2'>
                                  <span className='leading-none inline-block font-bold text-base opacity-[0.5] mr-2'>
                                    Quantity:
                                    <strong className='font-bold ml-2'>
                                      {val?.quantity}
                                    </strong>
                                  </span>
                                  {val?.product_variation && (
                                    <span className='leading-none border-l border-[#AAAAAA] inline-block font-bold text-base opacity-[0.5]  pl-2 mr-2'>
                                      Size:
                                      <strong className='font-bold ml-2'>
                                        {val?.product_variation}
                                      </strong>
                                    </span>
                                  )}
                                </div>
                                <div className='flex flex-wrap sm:gap-[2rem] gap-[1rem]'>
                                  {val?.awb_number && (
                                    <div className='text-start flex mt-2'>
                                      <span className='opacity-[0.5] font-normal text-sm'>
                                        AWB:
                                      </span>
                                      <p className='text-sm font-semibold ms-1'>
                                        {val?.awb_number}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className='flex gap-4 text-sm text-start'>
                                <div>
                                  <span className=' font-normal'>Total:</span>
                                  <p className='font-semibold'>
                                    ₹{val?.final_amount}
                                  </p>
                                </div>
                                <div>
                                  <span className='font-normal'>Date:</span>
                                  <p className='font-semibold '>
                                    {val?.order_date}
                                  </p>
                                </div>
                              </div>

                              <div className='text-base my-2'>
                                <div className='flex flex-col gap-[0.3rem] items-center'>
                                  <div className='flex gap-2 w-full'>
                                    <Link
                                      href={`/product/${val?.product_id}`}
                                      className='inline-block w-full text-center border gap-2 btn px-[0.9375rem] py-[0.5rem] rounded-[var(--radius-full)] font-medium focus:outline-none items-center'
                                      style={{
                                        backgroundColor:
                                          themeContext?.buttonBackgroundColor,
                                        color: themeContext?.buttonTextColor,
                                        // borderColor: buttonBorderColor,
                                      }}
                                    >
                                      Buy it Again
                                    </Link>
                                    {displayCancelButton(val?.status) && (
                                      <button
                                        className='inline-block w-full text-center border gap-2 btn px-[0.9375rem] py-[0.5rem] rounded-[var(--radius-full)] font-medium focus:outline-none items-center !bg-red-500 !text-white hover:bg-red-700'
                                        onClick={() => {
                                          setSelectedOrderId(orderId);
                                          setOpenCancelModel(true);
                                          // dispatch(closeOrderPopup());
                                        }}
                                        style={{
                                          borderColor: `${textColor}1A`,
                                        }}
                                      >
                                        Cancel Order
                                      </button>
                                    )}
                                  </div>
                                  <div className='flex items-center gap-10 mt-2'>
                                    <Link
                                      href='#'
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleViewOrderDetails(val);
                                      }}
                                    >
                                      View details
                                    </Link>

                                    {!isWholesaler && val?.awb_number && (
                                      <Link
                                        href={`/track-order/${val?.awb_number}`}
                                        className='inline-flex  underline gap-2 font-medium focus:outline-none items-center'
                                      >
                                        Track Order
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {(themeId === 3 ||
                      themeId === 4 ||
                      themeId === 5 ||
                      themeId === 6) && (
                        <div>
                          <div
                            className={`border border-[#E5E5E5] overflow-hidden p-4 flex flex-col h-full gap-2 ${themeId === 5
                              ? 'border-radius-xl'
                              : themeId === 6
                                ? 'rounded-xl'
                                : 'rounded-[0.625rem]'
                              }`}
                          >
                            <div className='top-card mb-5'>
                              <div className='flex gap-[0.5rem] justify-between w-full items-center text-sm'>
                                <div className='flex flex-col text-start gap-[0.3rem]'>
                                  <h3 className='text-xl font-semibold'>
                                    {val?.order_number}
                                  </h3>
                                  <p className='font-semibold text-[#6b7280]'>
                                    Placed on {formatDate(val?.order_date)}
                                  </p>
                                </div>
                                <div className='flex flex-col text-center sm:text-end gap-[0.3rem]'>
                                  <p
                                    style={statusStyle}
                                    className='text-sm  font-semibold bg-[var(--bg-color-gray-100)] py-[0.25rem] rounded-[var(--radius-full)]'
                                  >
                                    {status}
                                  </p>
                                  <p
                                    className='font-semibold'
                                    style={{
                                      color: themeContext?.buttonBackgroundColor,
                                    }}
                                  >
                                    ₹{val?.final_amount}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className='flex flex-col justify-between bottom-card gap-[0.9375rem] h-full'>
                              <div className='flex gap-[0.938rem]'>
                                <div
                                  className='w-[6rem] h-[6rem] rounded-[0.625rem] overflow-hidden shrink-0 border'
                                  style={{
                                    borderColor: `${textColor}2A`,
                                  }}
                                >
                                  <SafeImage
                                    width={96}
                                    height={96}
                                    src={val?.cover_image}
                                    alt={val?.product_name}
                                    className='w-full h-full object-cover'
                                  />
                                </div>
                                <div className='text-start text-base'>
                                  <h6 className='font-semibold line-clamp-1'>
                                    {val?.product_name}
                                  </h6>
                                  <div className='flex mb-2'>
                                    <span className='leading-none inline-block font-bold text-base opacity-[0.5] mr-2'>
                                      Quantity:
                                      <strong className='font-bold ml-2'>
                                        {val?.quantity}
                                      </strong>
                                    </span>
                                    {val?.product_variation && (
                                      <span className='leading-none border-l border-[#AAAAAA] inline-block font-bold text-base opacity-[0.5]  pl-2 mr-2'>
                                        Size:
                                        <strong className='font-bold ml-2'>
                                          {val?.product_variation}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                  <p>
                                    Qty: {val?.quantity} x ₹{val?.final_amount}
                                  </p>
                                  <div className='flex flex-wrap sm:gap-[2rem] gap-[1rem]'>
                                    {val?.awb_number && (
                                      <div className='text-start flex mt-2'>
                                        <span className='opacity-[0.5] font-normal text-sm'>
                                          AWB:
                                        </span>
                                        <p className='text-sm font-semibold ms-1'>
                                          {val?.awb_number}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <hr className='border-[#E5E5E5]' />
                              <div className='text-base'>
                                <div className='flex flex-wrap flex-row gap-[1rem] items-center'>
                                  <OutlineButton
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleViewOrderDetails(val);
                                    }}
                                    outline={false}
                                  >
                                    View Details
                                  </OutlineButton>
                                  <OutlineButton
                                    onClick={(e) => {
                                      navigate(`/product/${val?.product_id}`);
                                    }}
                                    outline={false}
                                    style={{
                                      backgroundColor:
                                        themeContext?.buttonBackgroundColor,
                                      color: themeContext?.buttonTextColor,
                                      // borderColor: buttonBorderColor,
                                    }}
                                  >
                                    Buy it Again
                                  </OutlineButton>
                                  {displayCancelButton(val?.status) && (
                                    <OutlineButton
                                      className='!bg-red-500 !text-white hover:bg-red-700 border-none'
                                      onClick={() => {
                                        setSelectedOrderId(orderId);
                                        setOpenCancelModel(true);
                                        // dispatch(closeOrderPopup());
                                      }}
                                      outline={false}
                                    >
                                      Cancel Order
                                    </OutlineButton>
                                  )}
                                  {!isWholesaler && val?.awb_number && (
                                    <OutlineButton
                                      onClick={(e) => {
                                        navigate(
                                          `/track-order/${val?.awb_number}`
                                        );
                                      }}
                                      outline={false}
                                    >
                                      Track Order
                                    </OutlineButton>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className='flex justify-center items-center gap-4 mt-8 mb-8'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'
                  style={{
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    color: textColor,
                    borderColor: `${textColor}2A`,
                  }}
                >
                  Previous
                </button>
                
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium' style={{ color: textColor }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'
                  style={{
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    color: textColor,
                    borderColor: `${textColor}2A`,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col justify-center mx-auto gap-[0.9375rem] mt-6'>
            <Icon
              name='empty'
              className='w-[6.25rem] h-[6.25rem] mx-auto'
              viewBox='0 0 100 100'
            />
            <p>Your order history is waiting to be filled.</p>
            <Link
              href='/shop'
              className='inline-flex text-sm sm:text-lg gap-2 btn px-16 py-4 rounded-lg w-max mx-auto focus:outline-none items-center'
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
      <CancelOrder
        open={openCancelModel}
        closeCancelModel={() => {
          setOpenCancelModel(false);
          setSelectedOrderId(null);
        }}
        onClose={() => {
          setOpenCancelModel(false);
          setSelectedOrderId(null);
          dispatch(closeOrderPopup());
        }}
        orderId={selectedOrderId}
      />
    </>
  );
};

export default Orders;
