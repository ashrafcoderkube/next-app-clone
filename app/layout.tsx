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
