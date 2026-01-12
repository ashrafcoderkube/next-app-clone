import { headers } from "next/headers";

export interface ProductDetailsResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: any;
}

export async function getProductDetails(
  slug: string
): Promise<ProductDetailsResponse> {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://nodeapi.jdwebnship.com/api/";

  const apiUrl = `${baseURL}products/details/${slug}`;

  try {
    // Get headers for server-side request
    const headersList = await headers();

    // Extract origin from headers - try multiple sources
    let host =
      headersList.get("x-forwarded-host") ||
      headersList.get("host") ||
      headersList.get("x-vercel-deployment-url") ||
      "localhost:3000";

    // Get protocol (https or http)
    const protocol =
      headersList.get("x-forwarded-proto") ||
      headersList.get("x-forwarded-scheme") ||
      (process.env.NODE_ENV === "production" ? "https" : "http");

    // Construct full origin/domain
    const origin = `${protocol}://${host}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
        "X-REQUEST-HOST": origin,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Failed to fetch product information",
      };
    }

    // Process product media URLs
    const processedData = data.data;
    return { success: true, status: response.status, data: processedData };
  } catch (error: any) {
    return { success: false, status: 500, message: error.message || "Failed to fetch product information" };
  }
}

