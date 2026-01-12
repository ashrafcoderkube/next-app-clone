"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "../components/customcomponents/Icon";

interface SupportOption {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Support: React.FC = () => {
  const { storeInfo } = useAppSelector((state: RootState) => state.storeInfo);
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor } = themeContext;

  const supportOptions: SupportOption[] = [
    {
      icon: (
        <Icon
          name="chat"
          size={24}
          fill={bottomFooterTextColor}
          viewBox="0 0 24 24"
        />
      ),
      title: "Live Chat – Instant support",
      description: "Available 24/7",
    },
    {
      icon: (
        <Icon
          name="mail"
          stroke={bottomFooterTextColor}
          strokeWidth="2"
          fill="none"
        />
      ),
      title: "Email Support – Detailed assistance",
      description: "Response within 24 hours",
    },
    {
      icon: (
        <Icon
          name="call"
          stroke={bottomFooterTextColor}
          strokeWidth="2"
          fill="none"
        />
      ),
      title: "Phone Support – Speak to our team",
      description: `Mon-Fri, ${
        storeInfo?.data?.storeinfo?.store_time || "11:00 AM to 08:00 PM"
      }`,
    },
  ];

  const whyContactItems: string[] = [
    "Resolve account or billing issues",
    "Get help with product or service inquiries",
    "Technical support for platform usage",
    "Feedback or suggestions for improvement",
  ];

  const email = storeInfo?.data?.storeinfo?.email || "storename123@gmail.com";
  const phone = storeInfo?.data?.storeinfo?.mobile_no || "9876543210";
  const formattedPhone = phone.startsWith("+") ? phone : `+91 ${phone}`;

  return (
    <div className="px-container mx-auto py-padding-100 min-h-screen flex flex-col max-w-[90%]">
      <div className="mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-4 text-left">
            We're Here to Help
          </h1>
          <p className="text-xl text-left">
            Get assistance with your healthcare & e-commerce needs from our
            dedicated support team.
          </p>
        </div>

        {/* Why Contact Us Section */}
        <div
          className="rounded-xl p-8 mb-12"
          style={{
            backgroundColor: themeContext?.bottomFooterBackgroundColor || "#1f2937",
            color: bottomFooterTextColor || "#ffffff",
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-left">
            Why Contact Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whyContactItems.map((item, index) => (
              <div key={index} className="flex items-start">
                <div
                  className="p-1 rounded-full mr-3 mt-1"
                  style={{
                    backgroundColor: bottomFooterTextColor,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        themeContext?.bottomFooterBackgroundColor || "#1f2937",
                      color: bottomFooterTextColor || "#ffffff",
                    }}
                  ></div>
                </div>
                <p className="text-left">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Options */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-start">
            Support Options
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="rounded-xl p-6 transition-shadow"
                style={{
                  backgroundColor:
                    themeContext?.bottomFooterBackgroundColor || "#1f2937",
                  color: bottomFooterTextColor || "#ffffff",
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-start">
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-start">
                  {option.title}
                </h3>
                <p className="text-start">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-6 mb-12"
          style={{
            backgroundColor: themeContext?.bottomFooterBackgroundColor || "#1f2937",
            color: bottomFooterTextColor || "#ffffff",
          }}
        >
          <div className="flex items-start">
            <Icon
              name="chat"
              size={20}
              stroke={bottomFooterTextColor}
              className="mt-1 mr-3 shrink-0"
            />
            <p className="">
              <span className="font-medium">Need urgent help?</span> Try our
              live chat for the fastest response.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="w-full max-w-full">
          <div className="grid grid-cols-1 gap-6">
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-4">How to Reach Us</h2>
              <p className="mb-6">
                Email us at{" "}
                <a
                  href={`mailto:${email}`}
                  className="font-medium hover:underline"
                >
                  {email}
                </a>
                . Please include a brief description of your issue.
              </p>

              <h3 className="text-xl font-semibold mb-3">Additional Help</h3>
              <p className="">
                For immediate assistance, call us at{" "}
                <a
                  href={`tel:${phone}`}
                  className="font-medium hover:underline"
                >
                  {formattedPhone}
                </a>{" "}
                or visit our{" "}
                <Link href="/faq" className="font-medium hover:underline">
                  FAQ page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

