"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatStatus } from "../../utils/common";
import { useTheme } from "../../contexts/ThemeContext";
import CancelOrder from "./CancelOrder";
import Icon from "../customcomponents/Icon";
import { Copy, CopyCheck } from "lucide-react";
import { closeOrderPopup } from "@/app/redux/slices/trackOrderSlice";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";

interface OrderDetailsPopupProps {
  orderDetail?: any;
}

const OrderDetailsPopup = ({ orderDetail }: OrderDetailsPopupProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const { isWholesaler } = useAppSelector((state: RootState) => state.storeInfo);
  const { openOrderDetail, order } = useAppSelector((state: RootState) => state.trackOrder);
  const [isOpen, setIsOpen] = useState(false);
  const [openCancelModel, setOpenCancelModel] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = formatStatus(orderDetail?.status);

  useEffect(() => {
    if (openOrderDetail) {
      // Disable body scroll when modal opens
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => setIsOpen(true), 10);
      return () => {
        clearTimeout(timer);
        // Restore body scroll when modal closes
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setIsOpen(false);
      // Restore body scroll
      document.body.style.overflow = "";
      const timer = setTimeout(() => dispatch(closeOrderPopup()), 300);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [openOrderDetail, dispatch]);

  const handleOverlayClick = () => {
    setIsOpen(false);
    setTimeout(() => dispatch(closeOrderPopup()), 300);
  };

  if (!openOrderDetail) return null;

  const displayCancelButton = () => {
    const allowedStatuses = ["order has been placed"];
    return allowedStatuses.includes(orderDetail?.status);
  };

  const handleCopy = () => {
    const orderNumber = order?.order_number;
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div
        className={`overlay w-full h-full fixed top-0 left-0 bg-[rgba(0,0,0,.65)] z-99 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleOverlayClick}
      ></div>
      <div
        className={`fixed top-0 right-0 z-100 w-full max-w-[50rem] transition-transform duration-300 ease-in-out ${
          isOpen ? "" : "translate-x-full"
        }`}
      >
        <div
          className="relative border border-white/20 w-full max-w-[50rem] h-dvh overflow-y-auto sm:p-7.5 p-4 mx-auto"
          style={{ backgroundColor: themeContext?.backgroundColor }}
        >
          <div className="relative pb-6 mb-6 border-b border-[#111111]/15 ">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold ">Order Details</h1>
                <div className="flex items-center gap-2">
                  <span className=" font-mono text-lg">
                    #{order?.id || ""}
                  </span>

                  {copied ? (
                    <CopyCheck
                      className="cursor-pointer w-4 h-4 text-green-500"
                      onClick={handleCopy}
                    />
                  ) : (
                    <Copy
                      className="cursor-pointer w-4 h-4 text-gray-600 transition-colors"
                      onClick={handleCopy}
                    />
                  )}
                  {copied && <span className="text-sm">Copied!</span>}
                </div>
              </div>
              <div onClick={handleOverlayClick}>
                <Icon
                  name={"close"}
                  stroke={textColor}
                  className="cursor-pointer w-6 h-6 mt-1.5"
                />
              </div>
            </div>
          </div>
          <div
            className="relative flex sm:flex-row flex-col sm:items-center justify-between gap-4 p-6  rounded-[0.625rem]"
            style={{
              backgroundColor: themeContext?.bottomFooterBackgroundColor,
              color: bottomFooterTextColor,
            }}
          >
            <div className="">
              <div className=" text-sm mb-1 uppercase">Order Date:</div>
              <div className=" text-sm font-bold">
                {order?.order_date || ""}
              </div>
            </div>
            <div className="">
              <div className=" text-sm mb-1 uppercase">TOTAL:</div>
              <div className=" text-sm font-bold">
                ₹{order?.final_amount || ""}
              </div>
            </div>
            <div className="">
              <div className=" text-sm mb-1 uppercase">STATUS:</div>
              <div className=" text-sm font-bold">{status || ""}</div>
            </div>
          </div>

          {!isWholesaler && (
            <div className="relative pt-6 ">
              <div className="border  rounded-[1.125rem] p-6 border-[#111111]/15">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className=" font-bold text-base mb-1">SHIP TO:</h3>
                    <div className="space-y-1 ">
                      <div className="">
                        {order?.firstname} {order?.lastname}
                      </div>
                      <div>{order?.email}</div>
                      <div>
                        {order?.alt_phone_number}
                      </div>
                      <div className="leading-relaxed">
                        {order?.address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative pt-6">
            <div className="border  rounded-[1.125rem] p-6 border-[#111111]/15">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className=" font-bold">PAYMENT:</h3>
                  <div className="">
                    {order?.payment_method === "cod"
                      ? "Cash on Delivery (COD)"
                      : "Prepaid"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-6">
            <div className="border  rounded-[1.125rem] p-6 border-[#111111]/15">
              <div className="flex items-start gap-3 mb-2">
                <h3 className=" font-bold">ORDER SUMMARY:</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="">Amount:</span>
                  <span className="">
                    ₹
                    {order?.quantity
                      ? Math.round(
                          order?.final_amount / order?.quantity
                        )
                      : order?.final_amount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Quantity:</span>
                  <span className="">{order?.quantity}</span>
                </div>
                {order?.product_variation && (
                  <div className="flex justify-between items-center">
                    <span className="">Variation:</span>
                    <span className="uppercase">
                      {order?.product_variation}
                    </span>
                  </div>
                )}
                {order?.discount_amount && (
                  <div className="flex justify-between items-center">
                    <span className="">Discount:</span>
                    <span className="">
                      -{order?.discount_amount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="">Subtotal:</span>
                  <span className="">
                    ₹
                    {order?.discount_amount
                      ? order?.final_amount -
                        order?.discount_amount
                      : order?.final_amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="">Shipping Cost:</span>
                  <span className="">Free</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className=" font-bold">Total</span>
                  <span className=" font-bold">
                    ₹
                    {order?.discount_amount
                      ? order?.final_amount -
                        order?.discount_amount
                      : order?.final_amount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t flex flex-col sm:flex-row gap-4 border-[#111111]/15">
            <button
              onClick={(e) => {
                e.preventDefault();
                dispatch(closeOrderPopup());
                router.push(`/product/${order?.product_id}`);
              }}
              className="flex-1 btn py-4 px-6 rounded-2xl border"
              style={{
                backgroundColor: themeContext?.buttonBackgroundColor,
                color: themeContext?.buttonTextColor,
                borderColor: themeContext?.buttonBorderColor,
              }}
            >
              <span className="text-lg">Buy It Again</span>
            </button>
            {displayCancelButton() && (
              <button
                className="flex-1 btn cursor-pointer py-4 px-6 rounded-2xl border !bg-red-500 !text-white hover:bg-red-700"
                onClick={() => {
                  setOpenCancelModel(true);
                  // dispatch(closeOrderPopup());
                }}
                style={{
                  borderColor: `${textColor}1A`,
                }}
              >
                <span className="text-lg">Cancel Order</span>
              </button>
            )}
          </div>
        </div>
        <CancelOrder
          open={openCancelModel}
          closeCancelModel={() => {
            setOpenCancelModel(false);
          }}
          onClose={() => {
            setOpenCancelModel(false);
            dispatch(closeOrderPopup());
          }}
          orderId={order?.order_id}
        />
      </div>
    </>
  );
};

export default OrderDetailsPopup;

