import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import LayoutWrapper from "./components/LayoutWrapper";
import ReduxProvider from "./redux/ReduxProvider";
import { Metadata } from "next";
import StoreInfoInitializer from "./components/StoreInfoInitializer";
import MetadataUpdater from "./components/MetadataUpdater";
import { AuthProvider } from "./components/AuthProvider";
import MaintenanceModeGuard from "./components/MaintenanceModeGuard";

import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
import DeferredStyles from "./components/DeferredStyles";

// Mark as dynamic because we use headers() for subdomain validation
// This is required for subdomain-based routing
// export const dynamic = "force-dynamic";

// const AppStyles = dynamic(() => import('@/app/App.css'), {
//   ssr: false,
// });

// const ToastStyles = dynamic(
//   () => import('@/app/react-toastify/dist/ReactToastify.css'),
//   { ssr: false }
// );

export async function generateMetadata(): Promise<Metadata> {
  // Return default metadata - will be updated client-side by MetadataUpdater
  return {
    title: {
      default: "JDWebnship | Home",
      template: "JDWebnship | %s",
    },
    description: "Welcome to JDWebnship - Shop the latest products",
    keywords: "",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className='antialiased'
        suppressHydrationWarning
      >
        <ReduxProvider>
          <DeferredStyles />
          <StoreInfoInitializer />
          {/* <MetadataUpdater /> */}
          <ThemeProvider>
            {/* <MaintenanceModeGuard> */}
            <LayoutWrapper>
              <AuthProvider>{children}</AuthProvider>
            </LayoutWrapper>
            {/* </MaintenanceModeGuard> */}
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              limit={1}
            />
            {/* <AppStyles /> */}
            {/* <ToastStyles /> */}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
