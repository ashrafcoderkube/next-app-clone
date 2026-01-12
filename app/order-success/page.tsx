"use client";

import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "../components/customcomponents/Icon";
import ContinueShoppingLink from "../components/ContinueShoppingLink";
import order2 from "../assets/order-succ.svg";
import order3 from "../assets/SvgjsG1062.svg";
import ButtonLink from "../components/customcomponents/ButtonLink";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";

function OrderSuccess() {
  const { order_id } = useAppSelector((state: RootState) => state.checkout);
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor } = themeContext;
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);

  const SharedLayout = () => (
    <>
      <div className="px-container py-[4.375rem] text-center">
        <div className="mx-auto max-w-xl custom-dashed-box">
          <div className="text-3xl mb-[0.9375rem]">
            {(themeId === 2 || themeId === 3) && (
              <img
                className="mx-auto"
                src={themeId === 3 ? order3 : order2}
                alt=""
              />
            )}
          </div>
          <h1 className="text-[2rem] font-bold mb-[0.5rem]">
            Your order is placed successfully
          </h1>
          <p className="mb-4">
            Thank you for your purchase! Stay updated with our latest <br />{" "}
            products and exclusive promotions.
          </p>
          <div className="font-medium flex gap-2 justify-center items-center  ">
            <div className="flex flex-col gap-2 justify-center md:max-w-[26.875rem] mb-8">
              <div className="whitespace-nowrap font-semibold">
                Your order ID :
              </div>
              <div className="flex flex-wrap gap-2 md:max-w-[26.875rem]">
                <div className="flex gap-2 md:max-w-[26.875rem]">
                  {Array.isArray(order_id) &&
                    order_id.length > 0 &&
                    order_id.map((id, index) => (
                      <div
                        key={index}
                        className="px-[0.9375rem] py-[0.5rem] rounded-full"
                        style={{
                          backgroundColor: themeContext?.bottomFooterBackgroundColor,
                          color: bottomFooterTextColor,
                          height: "fit-content",
                        }}
                      >
                        {id}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/shop"
            className="font-semibold btn  rounded-full px-9.5 py-[1rem] border disabled:opacity-60 cursor-pointer inline-block"
            style={{
              color: themeContext?.buttonTextColor,
              backgroundColor: themeContext?.buttonBackgroundColor,
              borderColor: themeContext?.buttonBorderColor,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
  const themeLayout = {
    1: (
      <>
        <div className="px-container py-12 text-center">
          <div className="mx-auto max-w-xl">
            <div className="text-3xl mb-[0.9375rem]">
              <Icon
                name="orderSuccess"
                size={160}
                strokeWidth="0"
                className="mx-auto "
                viewBox="0 0 162 160"
              />
            </div>
            <h1 className="text-2xl font-semibold mb-[0.9375rem]  ">
              Order Placed Successfully
            </h1>
            <div className="text-sm font-medium py-6 flex gap-2 justify-center items-center  ">
              <div className="flex gap-2 flex-wrap justify-center md:max-w-[26.875rem]">
                <div className="py-[0.5rem] whitespace-nowrap">
                  Your order ID :
                </div>
                <div className="flex gap-2 flex-wrap  md:max-w-[26.875rem]">
                  {Array.isArray(order_id) &&
                    order_id.length > 0 &&
                    order_id.map((id, index) => (
                      <div
                        key={index}
                        className="px-[0.9375rem] py-[0.5rem] rounded-lg text-sm"
                        style={{
                          backgroundColor: themeContext?.bottomFooterBackgroundColor,
                          color: bottomFooterTextColor,
                          height: "fit-content",
                        }}
                      >
                        {id}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div
              className="flex flex-col justify-center gap-[0.9375rem] p-6 rounded-2xl max-w-[26.875rem] mx-auto  "
              style={{
                backgroundColor: themeContext?.bottomFooterBackgroundColor,
                color: bottomFooterTextColor,
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
      </>
    ),
    2: <SharedLayout />,
    3: <SharedLayout />,
    6: (
      <>
        <div className="px-container py-16 md:py-24 text-center bg-white">
          <div className="mx-auto max-w-2xl">
            <div className="text-6xl mb-6">
              <div className="w-24 h-24 mx-auto bg-[#10b981] rounded-full flex items-center justify-center">
                <Icon
                  name="orderSuccess"
                  size={64}
                  strokeWidth="0"
                  className="text-white"
                  viewBox="0 0 162 160"
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-lg text-[#64748b] mb-8">
              Thank you for your purchase! Stay updated with our latest products
              and exclusive promotions.
            </p>
            <div className="flex flex-col gap-4 mb-8">
              <div className="text-sm font-semibold text-[#1e293b]">
                Your Order ID:
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.isArray(order_id) &&
                  order_id.length > 0 &&
                  order_id.map((id, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium"
                    >
                      {id}
                    </div>
                  ))}
              </div>
            </div>
            <ButtonLink to="/shop">Continue Shopping</ButtonLink>
          </div>
        </div>
      </>
    ),
  };

  return themeLayout[themeId] || themeLayout[1];
}

export default OrderSuccess;
