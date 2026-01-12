"use client";

import Image from "next/image";
import React from "react";
import maintenanceImage from "../assets/images/maintance.png";
import Icon from "../components/customcomponents/Icon";
import { useAppSelector } from "../redux/hooks";

function Maintenance() {
  const { storeInfo } = useAppSelector((state) => state.storeInfo);
  const storeEmail = storeInfo?.data?.storeinfo?.email || "";
  const storeMobile = storeInfo?.data?.storeinfo?.mobile_no || "";
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="mx-auto py-50-padding px-container 2xl:px-0 max-w-[90%] text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-[350px] mx-auto flex items-center justify-center">
              <Image
                src={maintenanceImage}
                alt="Maintenance"
                className="w-full h-full"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Site Under Maintenance
          </h1>

          <div className="text-gray-500 mb-4"></div>
          <div className="text-gray-600">
            {(storeEmail || storeMobile) && (
              <p className="text-base mb-2">
                Need assistance? Contact our support team:
              </p>
            )}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mt-4">
              {storeEmail && (
                <a
                  href={`mailto:${storeEmail}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-150"
                  style={{ wordBreak: "break-all" }}
                >
                  <Icon
                    name="mail"
                    size={16}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  {storeEmail}
                </a>
              )}

              {storeMobile && (
                <a
                  href={`tel:${storeMobile}`}
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold hover:underline transition-colors duration-150"
                  style={{ wordBreak: "break-all" }}
                >
                  <Icon
                    name="call"
                    size={16}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  {storeMobile}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
