

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "../redux/hooks";

interface MaintenanceModeGuardProps {
  children: React.ReactNode;
}

const MaintenanceModeGuard: React.FC<MaintenanceModeGuardProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Get store info from Redux
  const { storeInfo } = useAppSelector((state) => state.storeInfo);

  // Check if maintenance mode is active
  // Only check if storeInfo is loaded - don't block rendering while loading
  const isMaintenanceMode =
    storeInfo?.data?.storeinfo?.MaintenanceMode === true;

  useEffect(() => {
    // Only redirect if storeInfo is loaded and maintenance mode is confirmed
    // Don't block on initial render while storeInfo is being fetched
    if (!storeInfo) return;

    // If maintenance mode is active and we're not already on the maintenance page
    if (isMaintenanceMode && pathname !== "/maintenance") {
      router.replace("/maintenance");
    }
    // If maintenance mode is not active and we're on the maintenance page, redirect to home
    else if (!isMaintenanceMode && pathname === "/maintenance") {
      router.replace("/");
    }
  }, [isMaintenanceMode, pathname, router, storeInfo]);

  // If maintenance mode is active and we're not on the maintenance page, don't render anything
  // But only if storeInfo is loaded - otherwise render children to avoid blocking
  if (storeInfo && isMaintenanceMode && pathname !== "/maintenance") {
    return null;
  }

  // Otherwise, render the children (even if storeInfo is still loading)
  return <>{children}</>;
};

export default MaintenanceModeGuard;
