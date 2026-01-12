import { useTheme } from "@/app/contexts/ThemeContext";
import { useAppSelector } from "@/app/redux/hooks";
import { selectStoreInfo } from "@/app/redux/selectors";
import Link from "next/link";
import { useEffect } from "react";
import SafeImage from "../SafeImage";


function WholesalerFooter() {
  const { theme, footerTextColor, headerTextColor } = useTheme();
  const { storeInfo } = useAppSelector((selectStoreInfo));

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return (
    <footer
      className="pt-[30px] pb-[10px] lg:pt-[50px] rounded-t-2xl"
      style={{
        backgroundColor: theme?.footerBackgroundColor || "#1f2937",
        color: footerTextColor || "#ffffff",
        fontFamily: theme?.fontFamily || "system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="px-container">
        <div className="flex flex-wrap flex-col md:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="lg:text-left w-full sm:max-w-[17.5rem] text-center mb-3 mb-lg-0"
          >
            {storeInfo?.data?.storeinfo?.logo?.trim() ? (
              <SafeImage
                width={60}
                height={60}
                className="sm:h-[3.5rem] h-20 transition-all duration-300 ease-out text-center mx-auto lg:text-left lg:mx-0"
                src={storeInfo?.data?.storeinfo?.logo || ""}
                alt={storeInfo?.data?.storeinfo?.store_name || "Store logo"}
              />
            ) : (
              <h2
                className="uppercase text-sm font-semibold text-[1.5rem]"
                style={{ color: headerTextColor || "#111111" }}
              >
                {storeInfo?.data?.storeinfo?.store_name || "Store name"}
              </h2>
            )}
          </Link>
          <p>
            © {new Date().getFullYear()} {storeInfo?.data?.storeinfo?.store_name}. All
            rights reserved.
          </p>
          <div className="flex">
            <ul className="font-regular flex gap-4">
              <li className="mb-1">
                <Link
                  href="/faq"
                  className="hover:brightness-80 transition-all duration-600 ease-in-out "
                >
                  FAQ
                </Link>
              </li>
              <span className="separator md:border-r"></span>
              <li className="mb-1">
                <Link
                  href="/terms-of-use"
                  className="hover:brightness-80 transition-all duration-600 ease-in-out"
                >
                  Terms of use
                </Link>
              </li>
              <span className="separator md:border-r"></span>
              <li className="mb-1">
                <Link
                  href="privacy-policy"
                  className="hover:brightness-80 transition-all duration-600 ease-in-out"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default WholesalerFooter;
