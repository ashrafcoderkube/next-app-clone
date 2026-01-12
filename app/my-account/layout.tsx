'use client';

import { useState, useMemo, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "../components/customcomponents/Icon";
import ConfirmLogoutModal from "../components/model/ConfirmLogoutModal";

interface MyAccountLayoutProps {
  children: ReactNode;
}

export default function MyAccountLayout({ children }: MyAccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;
  const [open, setOpen] = useState(false);
  const { themeId, isWholesaler } = useSelector((state: any) => state.storeInfo);

  const menuItems = useMemo(
    () => [
      {
        key: "account",
        label: "Account Details",
        path: "/my-account",
        icon: "account",
      },
      {
        key: "orders",
        label: "Orders",
        path: "/my-account/orders",
        icon: "orders",
      },
      {
        key: "wishlist",
        label: "Wishlist",
        path: "/my-account/wishlist",
        icon: "wishlist",
      },
      ...(!isWholesaler
        ? [
            {
              key: "address",
              label: "Address",
              path: "/my-account/address",
              icon: "address",
            },
          ]
        : []),
      { key: "logout", label: "Logout", icon: "logout" },
    ],
    [isWholesaler]
  );

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    setOpen(true);
  };

  return (
    <div className="my-account-wrapper">
      <div className="account-container">
        <nav
          className="account-nav account-box "
          style={
            themeId !== 2
              ? {
                  backgroundColor: themeContext?.bottomFooterBackgroundColor,
                  color: bottomFooterTextColor,
                  border: `1px solid ${textColor}1A`,
                }
              : undefined
          }
        >
          <ul>
            {menuItems.map((item) => {
              const isSelected = pathname === item.path;
              return themeId === 1 ? (
                <li className="account-nav-item" key={item.key}>
                  <button
                    onClick={() => {
                      if (item.key === "logout") return handleLogout();
                      if (item.path && pathname !== item.path)
                        handleNavigation(item.path);
                    }}
                    className="account-nav-button "
                    style={{
                      borderLeft: isSelected
                        ? `2.8px solid ${bottomFooterTextColor}`
                        : "2.8px solid transparent",
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected
                        ? bottomFooterTextColor
                        : `${bottomFooterTextColor}90`,
                    }}
                  >
                    <span className="mr-[0.93rem]">
                      <Icon
                        name={item.icon}
                        stroke={
                          isSelected
                            ? bottomFooterTextColor
                            : `${bottomFooterTextColor}90`
                        }
                        strokeWidth="2"
                      />
                    </span>
                    {item.label}
                  </button>
                </li>
              ) : (
                <li
                  className="account-nav-item"
                  style={
                    themeId === 2
                      ? {
                          borderBottom: isSelected
                            ? `2px solid ${textColor}`
                            : "2px solid transparent",
                        }
                      : {}
                  }
                  key={item.key}
                >
                  <button
                    onClick={() => {
                      if (item.key === "logout") return handleLogout();
                      if (item.path && pathname !== item.path)
                        handleNavigation(item.path);
                    }}
                    className={`
                      account-nav-button
                      ${
                        themeId === 3 ||
                        themeId === 4 ||
                        themeId === 5 ||
                        themeId === 6
                          ? `rounded-2xl py-4 px-7.5 bg-transparent  transition-all duration-300 ${
                              themeId === 2
                                ? "rounded-2xl"
                                : "border-radius-xl"
                            }`
                          : ""
                      }
                    `}
                    style={
                      (themeId === 3 ||
                        themeId === 4 ||
                        themeId === 5 ||
                        themeId === 6) &&
                      isSelected
                        ? {
                            backgroundColor:
                              themeContext?.bottomFooterBackgroundColor,
                            color: isSelected
                              ? bottomFooterTextColor
                              : "#808080",
                            border: `1px solid ${bottomFooterTextColor}`,
                          }
                        : {
                            // color: "#101010",
                            border: `1px solid transparent`,
                            color:
                              themeId === 2 || themeId === 3
                                ? textColor
                                : bottomFooterTextColor,
                          }
                    }
                  >
                    <span className="mr-2">
                      <Icon
                        name={item.icon}
                        stroke={
                          (themeId === 3 ||
                            themeId === 4 ||
                            themeId === 5 ||
                            themeId === 6) &&
                          isSelected
                            ? bottomFooterTextColor
                            : themeId === 2 || themeId === 3
                            ? textColor
                            : bottomFooterTextColor
                        }
                        strokeWidth="2"
                      />
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="account-content">
          {children}
        </div>
      </div>
      <ConfirmLogoutModal open={open} setOpen={setOpen} />
    </div>
  );
}
