"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "../components/customcomponents/Icon";
import ContinueShoppingLink from "../components/ContinueShoppingLink";
import ButtonLink from "../components/customcomponents/ButtonLink";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import order from "../assets/order-fail.svg";

function OrderFailure() {
  const themeContext = useTheme() || {};
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);
  const themeLayout = {
    1: (
      <div>
        <div className="px-container py-12 text-center">
          <div className="mx-auto max-w-xl">
            <div className="text-3xl mb-2">
              <Icon
                name="orderFail"
                size={160}
                strokeWidth="0"
                className="mx-auto "
                viewBox="0 0 162 160"
              />
            </div>

            <h1 className="text-2xl font-semibold mb-6">
              ⚠️ Oops! Something went wrong.
            </h1>

            <div
              className="flex flex-col justify-center gap-[0.9375rem] p-6 rounded-2xl max-w-[26.875rem] mx-auto"
              style={{
                backgroundColor: themeContext?.bottomFooterBackgroundColor,
                height: "fit-content",
              }}
            >
              <p>
                Thank you for your purchase! 🎉 Stay updated with our latest
                products and exclusive promotions.
              </p>
              <ContinueShoppingLink variant="button" />
            </div>
          </div>
        </div>
      </div>
    ),
    2: (
      <>
        <div className="px-container py-[4.375rem] text-center">
          <div className="mx-auto max-w-xl border border-dashed border-[#E5E5E5] rounded-3xl p-8 ">
            <div className="text-3xl mb-[0.9375rem]">
              <img className="mx-auto" src={order} alt="" />
            </div>
            <h1 className="text-[2rem] font-bold mb-[0.5rem]">
              Oops! Something went wrong.
            </h1>
            <p className="mb-8">
              There was a problem processing your order. <br /> Please double-check the
              details and try again.
            </p>

            <Link
              href="/shop"
              className="font-semibold btn bg-black text-white rounded-full px-9.5 py-[1rem] disabled:opacity-60 cursor-pointer inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    ),
    6: (
      <>
        <div className="px-container py-16 md:py-24 text-center bg-white">
          <div className="mx-auto max-w-2xl">
            <div className="text-6xl mb-6">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Icon
                  name="orderFail"
                  size={64}
                  strokeWidth="0"
                  className="text-red-600"
                  viewBox="0 0 162 160"
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              ⚠️ Oops! Something went wrong.
            </h1>
            <p className="text-lg text-[#64748b] mb-8">
              There was a problem processing your order. Please double-check the details and try again.
            </p>
            <div className="flex flex-col gap-4">
              <ButtonLink to="/shop">Continue Shopping</ButtonLink>
              <Link
                href="/cart"
                className="text-[#10b981] hover:text-[#059669] underline transition-colors"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </>
    ),
  };

  return themeLayout[themeId] || themeLayout[1];
}

export default OrderFailure;
