"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "./customcomponents/Icon";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import { useTheme } from "../contexts/ThemeContext";

interface CommonHeaderProps {
  className?: string;
  [key: string]: any; // Allow additional props
}

export default function CommonHeader({
  className = "",
  ...props
}: CommonHeaderProps) {
  const pathname = usePathname();
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor } = themeContext;
  const { themeId } = useAppSelector((state: RootState) => state.storeInfo);
  const { productDetails, productCategories } = useAppSelector(
    (state: RootState) => state.products
  );

  // Extract slug from pathname for product pages (e.g., /product/[slug])
  const productMatch = pathname.match(/^\/product\/([^/]+)$/);
  const slug = productMatch ? productMatch[1] : null;

  // Route configuration
  const routes: Record<
    string,
    {
      title?: string;
      subTitle?: string;
      icon?: string;
      content?: React.ReactNode;
      breadcrumb?: boolean;
    }
  > = {
    "/": {
      icon: "map",
      content: (
        <div className="py-[2.5rem] lg:py-15 -mt-[40px] z-10 relative rounded-b-none rounded-3xl">
          <div className="flex items-center md:justify-between justify-center md:max-w-[90rem] max-w-full ml-auto mr-auto">
            <div className="flex xxl:px-[248px] md:gap-6 gap-4 md:flex-row flex-col">
              {[
                [
                  "Free Shipping",
                  "Upgrade your style today and get FREE shipping on all orders! Don't miss out.",
                ],
                [
                  "Secure Payment",
                  "Your security is our priority. Your payments are secure with us.",
                ],
                [
                  "Satisfaction Guarantee",
                  "Shop confidently with our Satisfaction Guarantee: Love it or get a refund.",
                ],
              ].reduce((acc, [title, text], i) => {
                acc.push(
                  <div
                    key={i}
                    className="flex-1 md:px-[1.8rem] px-[1rem] lg:px-[3.75rem] md:py-6 py-[0] lg:py-7.5 max-sm:max-w-[18.75rem]"
                  >
                    <h1 className="mb-4 text-[1.125rem] lg:text-[1.5rem] font-bold">
                      {title}
                    </h1>
                    <p className="text-lg font-normal">{text}</p>
                  </div>
                );
                if (i < 2) {
                  acc.push(
                    <span
                      key={`sep${i}`}
                      className="separator md:border-r self-stretch"
                    />
                  );
                }
                return acc;
              }, [] as React.ReactNode[])}
            </div>
          </div>
        </div>
      ),
      breadcrumb: false,
    },
    "/shop": { title: "Shop", icon: "order" },
    "/cart": { title: "Cart", icon: "order" },
    "/checkout": { title: "Checkout", icon: "orders" },
    "/categories": { title: "Shop By Category", icon: "filter" },
    "/order-success": { title: "Successful Order", icon: "orders" },
    "/order-failure": { title: "Failed Order", icon: "orders" },
    "/my-account": { title: "My Account", icon: "account" },
    "/my-account/orders": { title: "My Orders", icon: "orders" },
    "/my-account/wishlist": { title: "My Wishlist", icon: "wishlist" },
    "/my-account/address": { title: "My Address", icon: "address" },
    "/my-account/password": { title: "My Password", icon: "password" },
    "/signin": { title: "Sign In", icon: "myProfile3" },
    "/signup": { title: "Sign Up", icon: "myProfile3" },
    "/forgot-password": { title: "Forgot Password", icon: "password" },
    "/reset-password": { title: "Reset Password", icon: "password" },
    "/faq": { title: "FAQ", icon: "chat" },
    "/terms-of-use": { title: "Terms & Conditions", icon: "collection" },
    "/privacy-policy": { title: "Privacy Policy", icon: "collection" },
    "/support": { title: "Support", icon: "chat" },
    "/about": { title: "About Us", icon: "myProfile" },
    "/contact": { title: "Contact Us", icon: "call" },
    "/track-order": { title: "Track Order", icon: "trackOrder" },
    "/maintenance": { title: "Maintenance", icon: "collection" },
    "*": { title: "Page Not Found", icon: "collection" },
  };

  // Ensure sub_category_list is an array before using .find()
  const subCategoryList = Array.isArray(productCategories?.sub_categories)
    ? productCategories?.sub_categories
    : [];

  const subCategory = subCategoryList.find(
    (item: any) => item.sub_category_id === productDetails?.sub_category_id
  );

  // Handle product pages with slug
  if (slug && pathname.startsWith("/product/")) {
    // productDetails structure: it IS the product object, or productDetails.product
    const productName =
      productDetails?.alternate_name || productDetails?.name || "Product";
    const subCategoryName = subCategory?.sub_category_name || "Category";

    routes[pathname] = {
      title: subCategoryName,
      subTitle: productName,
      icon: "cart",
    };
  }

  // Handle track-order with dynamic ID
  if (pathname.startsWith("/track-order/")) {
    routes[pathname] = { title: "Track Order", icon: "orders" };
  }

  const config = routes[pathname] || routes["*"];
  const iconName = config.icon || "cart";
  const showBreadcrumb = config.breadcrumb !== false;

  const Breadcrumb = ({
    currentPage,
    subTitle,
  }: {
    currentPage?: string;
    subTitle?: string;
  }) => {
    const categoryLink = currentPage
      ? `/shop?page=1&categories=${encodeURIComponent(
        currentPage
      ).toLowerCase()}`
      : `/shop?page=1`;

    // Theme 6: Emerald accent colors for breadcrumb
    const breadcrumbTextColor =
      themeId === 6 ? themeContext?.buttonBackgroundColor : undefined;
    const breadcrumbLinkColor =
      themeId === 6 ? themeContext?.buttonBackgroundColor : undefined;
    const breadcrumbBorderColor =
      themeId === 6 ? themeContext?.buttonBackgroundColor : undefined;

    return (
      <nav className="common-header" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center font-medium me-2">
            <Link
              href="/"
              className="inline-flex items-center hover:opacity-80 transition-opacity"
              style={{
                color: themeId === 6 ? breadcrumbLinkColor : undefined,
              }}
            >
              Home
            </Link>
          </li>
          {subTitle ? (
            <>
              <li
                className="flex items-center font-medium pl-2"
                style={{
                  borderLeft:
                    themeId === 6
                      ? `1px solid ${breadcrumbBorderColor}`
                      : "1px solid currentColor",
                }}
              >
                <Link
                  href={categoryLink}
                  className="inline-flex items-center pe-1 hover:opacity-80 transition-opacity"
                  style={{
                    color: themeId === 6 ? breadcrumbLinkColor : undefined,
                  }}
                >
                  {currentPage}
                </Link>
              </li>
            </>
          ) : (
            <li
              className="flex items-center font-medium pl-2 opacity-50"
              style={{
                borderLeft:
                  themeId === 6
                    ? `1px solid ${themeContext?.buttonBackgroundColor}`
                    : "1px solid currentColor",
                color: themeId === 6 ? breadcrumbTextColor : undefined,
              }}
            >
              {currentPage}
            </li>
          )}
        </ol>
      </nav>
    );
  };

  const innerContent = config.content || (
    <div
   className={`px-container  word-break border-b border-gray-200/10 !py-4 ${themeId === 6 ? "py-10" : ""
        } ${themeId === 4 || themeId === 5 ? "" : "common-banner"}`}
    >
      {showBreadcrumb && (
        <Breadcrumb currentPage={config.title} subTitle={config.subTitle} />
      )}
      <div className="common-header-title text-3xl lg:text-5xl font-bold mt-4 break-words main-title hidden items-center gap-4">
        {themeId === 6 && (
          <div
            className="flex w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl items-center justify-center flex-shrink-0 shadow-xl shadow-theme6-accent/30 transform hover:scale-105 transition-transform duration-300"
            style={{
              backgroundColor:
                `${themeContext?.buttonBackgroundColor}` || "#ffffff",
              color: themeContext?.buttonTextColor || "#ffffff",
            }}
          >
            <Icon
              name={iconName}
              stroke={themeContext?.buttonTextColor || "#111111"}
              size={30}
              className="w-8 h-8"
            />
          </div>
        )}
      </div>
      {themeId === 6 && (
        <div className="mt-2 flex items-center gap-1.5 md:gap-2">
          {/* Gradient line */}
          <div
            className="h-1 rounded-full flex-1 max-w-32 md:max-w-48 flex-shrink-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeContext?.buttonBackgroundColor}0D, ${themeContext?.buttonBackgroundColor})`,
            }}
          />

          {/* Main accent dot */}
          <div
            className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full shadow-lg shadow-current/50 flex-shrink-0"
            style={{
              background: themeContext?.buttonBackgroundColor,
            }}
          />

          {/* Secondary dot */}
          <div
            className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0"
            style={{
              background: themeContext?.buttonBackgroundColor,
            }}
          />
        </div>
      )}

      {themeId === 6 && (
        <>
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeContext?.buttonBackgroundColor}0D, ${themeContext?.buttonBackgroundColor})`,
            }}
          />
          <div
            className="absolute bottom-0 -left-40 w-80 h-80 blur-3xl rounded-full opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeContext?.buttonBackgroundColor}0D, ${themeContext?.buttonBackgroundColor},${themeContext?.buttonBackgroundColor}0D)`,
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeContext?.buttonBackgroundColor}0D, ${themeContext?.buttonBackgroundColor},${themeContext?.buttonBackgroundColor}0D)`,
            }}
          />
        </>
      )}
    </div>
  );

  // Home page special content
  if (pathname === "/" && config.content) {
    return (
      <section
        className={`relative common-section overflow-hidden ${className}`}
        style={{
          backgroundColor: themeContext?.bottomFooterBackgroundColor || "#ffffff",
          color: bottomFooterTextColor || "#111111",
        }}
        {...props}
      >
        {config.content}
      </section>
    );
  }

  // Theme 6: Light background with emerald accents
  if (themeId === 6) {
    return (
      <section
        className={`relative common-section overflow-hidden ${className}`}
        style={{
          backgroundColor: `${themeContext?.bottomFooterBackgroundColor}1A`,
          color: bottomFooterTextColor || "#ffffff",
        }}
        {...props}
      >
        {innerContent}
      </section>
    );
  }

  return (
    <section
      className={`relative common-section ${className}`}
      style={{
        backgroundColor: themeContext?.bottomFooterBackgroundColor || "#ffffff",
        color: bottomFooterTextColor || "#111111",
        fontFamily: themeContext?.fontFamily || "system-ui, -apple-system, sans-serif",
      }}
      {...props}
    >
      {innerContent}
    </section>
  );
}
