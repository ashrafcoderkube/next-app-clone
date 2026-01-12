export const metadata = {
  title: "Site Under Maintenance",
  description: "We're currently performing maintenance on our site. Please check back soon."
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
