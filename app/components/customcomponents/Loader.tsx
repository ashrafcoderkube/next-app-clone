interface LoaderProps {
  height?: string;
}

// Simple loading spinner component
export default function Loader({ height = "h-auto" }: LoaderProps) {
  return (
    <div
      className={`flex items-center justify-center p-4 ${height ? height : ""}`}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

