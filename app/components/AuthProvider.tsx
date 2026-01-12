"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "../redux/hooks";

const routeConfig = {
  guestOnly: ["/signin", "/signup"],
  protected: ["/my-account", "/order-success", "/order-failure"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated || false
  );

  useEffect(() => {
    const isGuestOnly = routeConfig.guestOnly.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    const isProtected = routeConfig.protected.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isGuestOnly && isAuthenticated) {
      router.push("/");
    }

    if (isProtected && !isAuthenticated) {
      router.push("/signin");
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
}
