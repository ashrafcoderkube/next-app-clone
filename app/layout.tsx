import "./globals.css";
import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import LayoutWrapper from "./components/LayoutWrapper";
import ReduxProvider from "./redux/ReduxProvider";
import { Metadata } from "next";
import StoreInfoInitializer from "./components/StoreInfoInitializer";
import MetadataUpdater from "./components/MetadataUpdater";
import { AuthProvider } from "./components/AuthProvider";
import MaintenanceModeGuard from "./components/MaintenanceModeGuard";
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from "react-toastify";

// Mark as dynamic because we use headers() for subdomain validation
// This is required for subdomain-based routing
// export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  // Return default metadata - will be updated client-side by MetadataUpdater
  return {
    title: {
      default: "JDWebnship | Home",
      template: "JDWebnship | %s",
    },
    description: "Welcome to JDWebnship - Shop the latest products",
    keywords: "",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>

        <ReduxProvider>
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
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
