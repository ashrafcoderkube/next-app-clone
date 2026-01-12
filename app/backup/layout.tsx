import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Not Found",
  description: "The store information could not be loaded.",
};

export default function BackupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

