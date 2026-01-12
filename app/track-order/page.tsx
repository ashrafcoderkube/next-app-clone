"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loader from "../components/customcomponents/Loader";
import LoadingButton from "../components/customcomponents/LoadingButton";
import { useTheme } from "../contexts/ThemeContext";
import CustomInput from "../components/customcomponents/CustomInput";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchTrackOrder,
  resetTrackOrderState,
} from "../redux/slices/trackOrderSlice";
import { parseDate } from "../utils/common";
import SafeImage from "../components/SafeImage";

function TrackOrderContent() {
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, data } = useAppSelector((state) => state.trackOrder);
  const [orderId, setOrderId] = useState("");

  // Get order ID from URL if present
  const idFromUrl = searchParams.get("id");

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetTrackOrderState());
    };
  }, [dispatch]);

  // Fetch order if ID is in URL
  useEffect(() => {
    if (idFromUrl && idFromUrl.trim()) {
      dispatch(fetchTrackOrder(idFromUrl.trim()));
    }
  }, [dispatch, idFromUrl]);

  // Form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    try {
      const response = await dispatch(fetchTrackOrder(orderId.trim())).unwrap();
      if (response?.success) {
        setOrderId("");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setOrderId("");
    }
  };

  const resetForm = () => {
    dispatch(resetTrackOrderState());
    setOrderId("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push("/track-order", { scroll: false });
    }
  };

  const trackingSummary = data?.data?.data?.summary || null;
  const trackingHistory = data?.data?.data?.trackingdata || [];
  const responseStatus = data?.status;
  const shippingDetails = data?.data?.shipping_details || null;
  const orderDetails = data?.data?.order_details || null;
  const productDetails = data?.data?.product_details || null;

  const safeDateFormat = (
    dateString: string | null | undefined,
    format: "date" | "time" | "datetime" = "date"
  ): string => {
    if (!dateString) return "N/A";

    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid Date";

    switch (format) {
      case "date":
        return date.toLocaleDateString();
      case "time":
        return date.toLocaleTimeString();
      case "datetime":
        return date.toLocaleString();
      default:
        return date.toString();
    }
  };

  const getSafeLocation = (
    location: string | null | undefined
  ): string | null => {
    if (!location || typeof location !== "string" || location.trim() === "") {
      return null;
    }
    return location.trim();
  };

  const sortedTrackingHistory = [...trackingHistory].sort((a, b) => {
    const dateA = a?.dateandTime ? parseDate(a.dateandTime) : null;
    const dateB = b?.dateandTime ? parseDate(b.dateandTime) : null;
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusBadgeClass = (status: string | null | undefined): string => {
    if (!status) return "bg-gray-100";
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Pickup Initiated":
        return "bg-yellow-100 text-yellow-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const formatToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderTrackingItem = (track: any, index: number) => {
    const safeDate = track?.dateandTime ? parseDate(track.dateandTime) : null;
    const isValidDate = safeDate instanceof Date && !isNaN(safeDate.getTime());

    return (
      <div
        className="flex flex-col gap-4 items-start mb-3"
        key={`${track?.statusCode || `track-${index}`}-${index}`}
      >
        <div className="flex relative w-full">
          <div className="space-x-3 min-w-[90px] max-w-[90px] w-full relative mr-[27px]">
            {/* DATE (DD/MM/YYYY) */}
            <div className="font-medium whitespace-nowrap m-0">
              {isValidDate ? formatToDDMMYYYY(safeDate) : "Unknown Date"}
            </div>

            {/* TIME */}
            <div className="font-bold m-0">
              {isValidDate
                ? safeDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "N/A"}
            </div>

            {/* TIMELINE DOT */}
            <div className="flex flex-col items-center absolute top-0 right-[-30px] z-1">
              <div
                className="w-[18px] h-[18px] rounded-full flex justify-center items-center shrink-0"
                style={{
                  backgroundColor: `${textColor}1A`,
                }}
              >
                <p className="bg-white h-[8px] w-[8px] rounded-full shrink-0"></p>
              </div>
            </div>
          </div>

          {/* STATUS + LOCATION */}
          <div className="ms-[27px] overflow-hidden">
            <div className="font-semibold line-clamp-1">
              {track?.remark || "Unknown Status"}
            </div>

            {(() => {
              const safeLocation = getSafeLocation(track?.location);
              return safeLocation ? (
                <div className="uppercase italic line-clamp-1">
                  {safeLocation}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  };

  const DateDisplay = ({ dateString }: { dateString: string }) => {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) {
      return <div className="text-red-500">Invalid date</div>;
    }
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate();
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();

    return (
      <>
        <div className="text-lg font-medium">
          {dayName} <span className="text-sm font-normal">(On time)</span>
        </div>
        <div className="text-6xl font-bold leading-none my-2">{day}</div>
        <div className="text-base mb-4">
          {monthName}, {year}
        </div>
      </>
    );
  };

  const formatToDDMMYYYYFromISO = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "Invalid Date";

    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className="xl:max-w-[80rem] mx-auto py-50-padding px-6 xl:px-0">
        <div className="space-y-5 flex flex-col items-center">
          {!data?.success && (
            <div className="w-full max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <CustomInput
                    label="Enter AWB Number"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 8034111122"
                    disabled={loading}
                    required
                  />
                </div>
                <LoadingButton
                  type="submit"
                  disabled={loading || orderId === ""}
                  loading={loading}
                  text="Track Order"
                />
              </form>
            </div>
          )}

          {data?.success && (
            <div className="w-full mt-8">
              {loading ? (
                <div className="text-center">
                  <Loader />
                  <p className="mt-4">Tracking your order...</p>
                </div>
              ) : (
                error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg
                          className="h-6 w-6 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-red-800 font-semibold mb-2">
                        Tracking Error
                      </h3>
                      <p className="text-red-600 mb-4">
                        {typeof error === "string"
                          ? error
                          : "An unexpected error occurred while tracking your order. Please try again."}
                      </p>
                      <button
                        onClick={resetForm}
                        className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <div
          className={`mx-auto space-y-6 w-full transition-all duration-1000 ease-in-out overflow-hidden ${responseStatus
            ? "h-full opacity-100 mt-4 md:pb-5"
            : "max-h-0 opacity-0 mt-0"
            }`}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div
              className="lg:w-1/3 p-6 rounded-xl"
              style={{
                backgroundColor: themeContext?.bottomFooterBackgroundColor,
                color: bottomFooterTextColor,
                fontFamily: themeContext?.fontFamily,
              }}
            >
              <div className="flex items-center text-xl font-semibold mb-[0.965rem] justify-between border-b border-[#111111]/15 pb-[0.965rem]">
                Estimated Delivery Time
              </div>
              <div className="text-start">
                <DateDisplay
                  dateString={safeDateFormat(
                    trackingSummary?.expectedDeliveryDate,
                    "date"
                  )}
                />

                <span className="inline-block px-4 py-1.5 border border-[#111111] rounded-lg">
                  Status:{" "}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-lg font-bold ${getStatusBadgeClass(
                      trackingSummary?.status
                    )}`}
                  >
                    {trackingSummary?.status || "Unknown"}
                  </span>
                </span>
              </div>
            </div>

            <div
              className="lg:w-2/3 border p-6 rounded-xl"
              style={{
                borderColor: `${textColor}1A`,
              }}
            >
              <div
                className="flex flex-wrap items-center justify-between mb-6 border-b pb-4 gap-2"
                style={{
                  borderColor: `${textColor}1A`,
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-20 w-20 border rounded-full flex flex-shrink-0 items-center justify-center text-white text-xs font-bold overflow-hidden"
                    style={{
                      borderColor: `${textColor}1A`,
                    }}
                  >
                    {shippingDetails?.logo && (
                      <SafeImage
                        src={shippingDetails?.logo}
                        alt={"Logo"}
                        width={80}
                        height={80}
                        className="w-full h-full rounded-[2.125rem] object-contain shrink-0"
                      />
                    )}
                  </div>
                  <div className="font-bold">
                    {trackingSummary?.fulfilledby || ""}
                  </div>
                </div>
                <div className="text-sm">
                  <span>TRACKING ID:</span> <br />
                  <span className="font-bold">
                    {trackingSummary?.waybill || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-left max-h-[140px] overflow-y-auto scroll-bar">
                <div className="relative space-y-6 text-left">
                  {sortedTrackingHistory.map((track, index) =>
                    renderTrackingItem(track, index)
                  )}
                  <div
                    className="w-px h-full border-1 border-dashed absolute top-0 left-[110px] abs-border"
                    style={{
                      borderColor: `${textColor}1A`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 text-start">
            <div
              className="lg:w-1/2 p-6 rounded-xl border"
              style={{
                borderColor: `${textColor}1A`,
              }}
            >
              <h2
                className="text-xl font-semibold mb-4 border-b pb-2"
                style={{
                  borderColor: `${textColor}1A`,
                }}
              >
                Order Details
              </h2>
              <div className="space-y-2 text-lg">
                <div className="flex flex-col sm:flex-row">
                  <div
                    className="sm:max-w-[18.125rem] sm:min-w-[18.125rem] w-full"
                    style={{
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    Order ID
                  </div>
                  <div className="font-medium">
                    {orderDetails?.order_id || "N/A"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row">
                  <div
                    className="sm:max-w-[18.125rem] sm:min-w-[18.125rem] w-full"
                    style={{
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    Order Placed On
                  </div>
                  <div className="font-medium">
                    {formatToDDMMYYYYFromISO(orderDetails?.order_date)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row">
                  <div
                    className="sm:max-w-[18.125rem] sm:min-w-[18.125rem] w-full"
                    style={{
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    Customer Name
                  </div>
                  <div className="font-medium">
                    {orderDetails?.customer_name || "N/A"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row">
                  <div
                    className="sm:max-w-[18.125rem] sm:min-w-[18.125rem] w-full"
                    style={{
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    Phone Number
                  </div>
                  <div className="font-medium">
                    {orderDetails?.phone_number || "N/A"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row">
                  <div
                    className="sm:max-w-[18.125rem] sm:min-w-[18.125rem] w-full"
                    style={{
                      color: textColor,
                      opacity: 0.8,
                    }}
                  >
                    Address
                  </div>
                  <div className="font-medium address-value">
                    {orderDetails
                      ? (() => {
                        const parts = [
                          orderDetails.address,
                          orderDetails.city,
                          orderDetails.state,
                        ].filter((v) => v && v !== "N/A");
                        const pin =
                          orderDetails.pincode &&
                            orderDetails.pincode !== "N/A"
                            ? orderDetails.pincode
                            : "";
                        const fullAddress =
                          parts.join(", ") + (pin ? ` - ${pin}` : "");
                        return fullAddress.trim() !== ""
                          ? fullAddress
                          : "N/A";
                      })()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="lg:w-1/2 p-6 rounded-xl border"
              style={{
                borderColor: `${textColor}1A`,
              }}
            >
              <h2
                className="text-xl font-semibold mb-4 border-b pb-2"
                style={{
                  borderColor: `${textColor}1A`,
                }}
              >
                Product Details
              </h2>
              <div className="flex space-x-4">
                <div className="lg:w-[6.25rem] lg:h-[6.25rem] w-20 h-20 shrink-0 overflow-hidden">
                  {productDetails?.image && (
                    <SafeImage
                      src={productDetails?.image}
                      alt={productDetails?.name || "N/A"}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                </div>

                <div>
                  <div className="sm:text-lg text-base font-bold mb-2 transition-colors duration-300 cursor-pointer">
                    {productDetails?.name || "N/A"}
                  </div>
                  <div className="text-lg font-bold">
                    {!isNaN(Number(productDetails?.price))
                      ? `₹ ${productDetails.price || 0}`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <button
              onClick={resetForm}
              className="btn bg-gray-500 text-white py-3.5 px-6 rounded-md hover:bg-gray-600 transition-colors border"
              style={{
                borderColor: `${textColor}1A`,
              }}
            >
              Track Another Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackOrder() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]"><Loader /></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

export default TrackOrder;
