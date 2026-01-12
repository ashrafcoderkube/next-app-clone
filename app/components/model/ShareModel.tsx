"use client";

import { useState, useEffect } from "react";
import { Copy, CopyCheck, Link as LinkIcon, Send } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import whatsapp from "../../assets/whatsapp-og.svg";
import facebook from "../../assets/facebookShare.svg";
import instagram from "../../assets/instagram-icon.svg";
import twitter from "../../assets/twitter-icon.svg";
import Icon from "../../components/customcomponents/Icon";
import CustomInput from "../../components/customcomponents/CustomInput";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import Image from "next/image";

// Helper function to get image source from SVG imports
const getImageSrc = (img: string | { src?: string } | any): string => {
  if (typeof img === "string") return img;
  if (img && typeof img === "object" && "src" in img) return img.src;
  return img;
};

interface ShareDialogProps {
  url?: string;
  product?: {
    name?: string;
  };
  variant?: {
    product_variation?: string;
    variation?: string;
  };
}

export default function ShareDialog({
  url: urlProp,
  product,
  variant,
}: ShareDialogProps) {
  const themeContext = useTheme() || {};
  const { textColor, headerTextColor } = themeContext;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState<string>("");
  const storeInfo = useAppSelector(
    (state: RootState) => state.storeInfo.storeInfo
  );

  // Get URL from prop or window.location (client-side only)
  useEffect(() => {
    if (urlProp) {
      setUrl(urlProp);
    } else if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, [urlProp]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareMessages = `I ♥ this product on ${storeInfo?.data?.storeinfo?.store_name}! ${product?.name} and variant is ${variant?.variation}`;

  const [showInstagramModal, setShowInstagramModal] = useState(false);

  const shareTo = (
    platform: "facebook" | "twitter" | "whatsapp" | "instagram"
  ) => {
    if (typeof window === "undefined") return;

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareMessages);

    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    };

    if (platform === "instagram") {
      const fullText = `${shareMessages} ${url}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
          setOpen(false);
          setShowInstagramModal(true);
        });
      }
      return;
    }
    if (links[platform]) {
      window.open(links[platform], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {showInstagramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Share on Instagram</h3>
              <p className="text-gray-600 mb-4">
                Product details copied to clipboard!
              </p>

              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm font-medium mb-2">Follow these steps:</p>
                <ol className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      1
                    </span>
                    Open Instagram app
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      2
                    </span>
                    Create new post/story
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      3
                    </span>
                    Paste & share with followers
                  </li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstagramModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.open("https://www.instagram.com/", "_blank");
                    setShowInstagramModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded font-medium hover:opacity-90 transition-opacity"
                >
                  Open Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(true)}
        className="btn border share-btn sm:min-w-[55px] py-2.5 px-3.5 rounded-[0.625rem] text-base focus:outline-none flex items-center justify-center flex-wrap"
        style={{
          borderColor: `${themeContext?.buttonTextColor}2A`,
        }}
      >
        {/* <Send /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20.0396 2.32344C21.0556 1.96844 22.0316 2.94444 21.6766 3.96044L15.7516 20.8904C15.3666 21.9884 13.8366 22.0504 13.3646 20.9874L10.5056 14.5554L14.5296 10.5304C14.6621 10.3883 14.7342 10.2002 14.7308 10.0059C14.7274 9.81162 14.6486 9.62623 14.5112 9.48882C14.3738 9.35141 14.1884 9.27269 13.9941 9.26927C13.7998 9.26584 13.6118 9.33796 13.4696 9.47044L9.44461 13.4944L3.01261 10.6354C1.94961 10.1624 2.01261 8.63344 3.10961 8.24844L20.0396 2.32344Z"
            fill={themeContext?.buttonTextColor}
          />
        </svg>
        <span
          style={{
            color: textColor,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.96889 13.359L15.04 16.941M15.0311 7.059L8.96889 10.641M20 5.7C20 7.19117 18.8061 8.4 17.3333 8.4C15.8606 8.4 14.6667 7.19117 14.6667 5.7C14.6667 4.20883 15.8606 3 17.3333 3C18.8061 3 20 4.20883 20 5.7ZM9.33333 12C9.33333 13.4912 8.13943 14.7 6.66667 14.7C5.19391 14.7 4 13.4912 4 12C4 10.5088 5.19391 9.3 6.66667 9.3C8.13943 9.3 9.33333 10.5088 9.33333 12ZM20 18.3C20 19.7912 18.8061 21 17.3333 21C15.8606 21 14.6667 19.7912 14.6667 18.3C14.6667 16.8088 15.8606 15.6 17.3333 15.6C18.8061 15.6 20 16.8088 20 18.3Z"
              stroke={textColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className=" ml-1">Share</span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/40 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
          />

          <DialogPanel
            transition
            className="relative z-10 transform overflow-hidden rounded-xl bg-white border text-left shadow-xl transition-all sm:w-full sm:max-w-md data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
            style={{
              backgroundColor: themeContext?.backgroundColor,
              color: textColor,
              borderColor: "#e8f1ff",
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center gap-3">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold text-gray-900"
                  style={{
                    color: textColor,
                  }}
                >
                  Share
                </DialogTitle>
                <div onClick={() => setOpen(false)} className="cursor-pointer">
                  <Icon name={"close"} stroke={headerTextColor || "#111111"} />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3 justify-center flex-wrap">
                  {/* Facebook */}
                  <button
                    onClick={() => shareTo("facebook")}
                    className="p-1 rounded-full bg-[#E8F1FF] hover:bg-[#dce9ff] cursor-pointer transition-colors duration-300 ease-in-out"
                  >
                    <Image
                      src={getImageSrc(facebook)}
                      alt="facebook"
                      width={32}
                      height={32}
                    />
                  </button>

                  {/* Twitter */}
                  <button
                    onClick={() => shareTo("twitter")}
                    className="p-1 rounded-full bg-[#E7F7FF] hover:bg-[#d8f2ff] cursor-pointer transition-colors duration-300 ease-in-out"
                  >
                    <Image
                      src={getImageSrc(twitter)}
                      alt="twitter"
                      width={32}
                      height={32}
                    />
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={() => shareTo("instagram")}
                    className="p-1 rounded-full bg-[#FFEFF6] hover:bg-[#ffe0f0] cursor-pointer transition-colors duration-300 ease-in-out"
                  >
                    <Image
                      src={getImageSrc(instagram)}
                      alt="instagram"
                      width={32}
                      height={32}
                    />
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => shareTo("whatsapp")}
                    className="p-1 rounded-full bg-[#E9FFEF] hover:bg-[#ddffe6] cursor-pointer transition-colors duration-300 ease-in-out"
                  >
                    <Image
                      src={getImageSrc(whatsapp)}
                      alt="whatsapp"
                      width={32}
                      height={32}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <CustomInput
                  type="text"
                  readOnly
                  value={url}
                  leftIcon={() => <LinkIcon size={18} />}
                  rightIcon={() => (
                    <button
                      onClick={handleCopy}
                      className="cursor-pointer pointer-events-auto"
                      style={{ pointerEvents: "auto" }}
                    >
                      {copied ? (
                        <CopyCheck
                          className="w-4 h-4 text-green-500"
                          style={{ color: textColor }}
                        />
                      ) : (
                        <Copy
                          className="w-4 h-4 text-gray-600 transition-colors"
                          style={{ color: textColor }}
                        />
                      )}
                    </button>
                  )}
                  noDefaultPadding={true}
                  inputClassName="text-sm px-10 py-2"
                />
              </div>

              {copied && (
                <p className="text-green-600 text-sm mt-1 text-center">
                  Copied to clipboard!
                </p>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
