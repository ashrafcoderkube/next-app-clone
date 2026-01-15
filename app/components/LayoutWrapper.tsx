"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import CommonHeader from "./CommonHeader";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { RootState } from "../redux/store";
import { refreshToken } from "../redux/slices/authSlice";
import dynamic from "next/dynamic";
import { TopHeaderSkeleton, HeaderSkeleton, HeaderWholesalerSkeleton, FooterSkeleton, WholesalerFooterSkeleton } from "./HeaderSkeletons";

// Lazy load heavy header/footer components to improve initial load
const TopHeader = dynamic(() => import("./headercomponents/TopHeader"), {
  ssr: false,
  loading: () => <TopHeaderSkeleton />,
});

const Header = dynamic(() => import("./headercomponents/Header"), {
  ssr: false,
  loading: () => <HeaderSkeleton />,
});

const HeaderWholesaler = dynamic(() => import("./headercomponents/HeaderWholesaler"), {
  ssr: false,
  loading: () => <HeaderWholesalerSkeleton />,
});

const Footer = dynamic(() => import("./footercomponents/Footer"), {
  ssr: false,
  loading: () => <FooterSkeleton />,
});

const WholesalerFooter = dynamic(() => import("./footercomponents/WholesalerFooter"), {
  ssr: false,
  loading: () => <WholesalerFooterSkeleton />,
});

const BackupPage = dynamic(() => import("./BackupPage"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const Maintenance = dynamic(() => import("../maintenance/page"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
// gsap.registerPlugin(ScrollTrigger);

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showTopHeader, setShowTopHeader] = useState(true);
  const [topHeaderHeight, setTopHeaderHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [hasShadow, setHasShadow] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const dispatch = useAppDispatch();
  const { loading, error, themeId, isWholesaler } = useAppSelector(
    (state: RootState) => state.storeInfo
  );
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.auth
  );
  const hideCommonHeader = pathname === "/";

  // If the pathname is "/maintenance", show page not found (BackupPage)
  if (pathname === "/maintenance") {

    return <Maintenance />;
  }

  // Reset initial mount flag and scroll to top when pathname changes (navigation)
  // useEffect(() => {
  //   isInitialMount.current = true;
  //   // Scroll to top when navigating to a new page
  //   if (typeof window !== "undefined") {
  //     window.scrollTo({ top: 0, behavior: "instant" });
  //   }
  // }, [pathname]);

  // Enable scroll hide/show for all themes
  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   // Initialize state based on current scroll position
  //   const initialY = window.scrollY;
  //   if (initialY > 0) {
  //     setShowTopHeader(false);
  //     setHasShadow(true);
  //   }

  //   let lastY = initialY;
  //   let ticking = false;
  //   const threshold = 12;

  //   const onScroll = () => {
  //     const currentY = window.scrollY;
  //     const delta = currentY - lastY;
  //     lastY = currentY;
  //     if (!ticking) {
  //       window.requestAnimationFrame(() => {
  //         if (currentY <= 0) {
  //           setShowTopHeader(true);
  //           setHasShadow(false);
  //         } else if (delta > threshold) {
  //           setShowTopHeader(false);
  //           setHasShadow(true);
  //         } else if (delta < -threshold) {
  //           setShowTopHeader(true);
  //           setHasShadow(true);
  //         }
  //         ticking = false;
  //       });
  //       ticking = true;
  //     }
  //   };

  //   window.addEventListener("scroll", onScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, [themeId]);

  useEffect(() => {
    if (!mainRef.current) return;

    let totalHeaderHeight = 0;
    if (isWholesaler) {
      totalHeaderHeight = headerHeight;
    } else {
      totalHeaderHeight = showTopHeader
        ? topHeaderHeight + headerHeight
        : headerHeight;
    }

    if (totalHeaderHeight === 0 || (headerHeight === 0 && !isWholesaler))
      return;

    // Set padding-top directly without GSAP
    mainRef.current.style.paddingTop = `${totalHeaderHeight}px`;
    isInitialMount.current = false;
  }, [headerHeight, topHeaderHeight, showTopHeader, isWholesaler]);

  // Refresh token when site loads if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      dispatch(refreshToken());
    }
  }, []); // Empty dependency array - runs only once on mount

  if (!loading && error) {
    return <BackupPage />;
  }

  return (
    <div>
      <div>
        {isWholesaler ? (
          <HeaderWholesaler
            offsetY={showTopHeader ? topHeaderHeight : 0}
            onHeightChange={setHeaderHeight}
          />
        ) : (
          <>
            {/* Hide TopHeader for theme 6 as it has its own inner top bar */}
            {themeId !== 6 && (

              <TopHeader
                visible={showTopHeader}
                onHeightChange={setTopHeaderHeight}
              />
            )}

            <Header
              offsetY={themeId === 6 ? 0 : showTopHeader ? topHeaderHeight : 0}
              onHeightChange={setHeaderHeight}
              hasShadow={hasShadow}
            />
          </>
        )}
      </div>

      <div>
        <div className={`App ${isWholesaler ? "wholesaler" : "retailer"}`}>
          <main
            ref={mainRef}
            className="main-content"
            data-store-type={isWholesaler ? "wholesaler" : "retailer"}
          >
            {!hideCommonHeader && <CommonHeader />}
            {children}
          </main>
          {/* {!isWholesaler && <BottomFooter />} */}
          {isWholesaler ? <WholesalerFooter /> : <Footer />}
        </div>
      </div>
    </div>
  );
}
