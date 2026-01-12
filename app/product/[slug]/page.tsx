import { Suspense } from "react";
import ProductDetailClient from "./ProductDetailClient";
import Loader from "../../components/customcomponents/Loader";
import { getProductDetails } from "@/ServerSideAPI/productDetails";
import { Metadata } from "next";

interface ProductDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const productData = await getProductDetails(slug);
  const baseUrl =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://assets.jdwebnship.com/";

  let productImage = "";
  if (productData?.data?.cover_image) {
    productImage = `${baseUrl}${productData.data.cover_image}`;
  } else if (
    Array.isArray(productData?.data?.images) &&
    productData.data.images.length > 0
  ) {
    productImage = `${baseUrl}${productData.data.images[0]?.image}`;
  }

  const stripHtml = (html: string) => {
    return (
      html
        ?.replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim() || ""
    );
  };

  const description = stripHtml(productData?.data?.description || "");

  return {
    title:
      productData?.data?.alternate_name || productData?.data?.name || "Product",
    description: description || "Product details",
    openGraph: {
      title: productData?.data?.alternate_name || productData?.data?.name,
      description: description,
      images: productImage
        ? [
            {
              url: productImage,
              width: 1200,
              height: 630,
              alt: productData?.data?.alternate_name || "Product image",
            },
          ]
        : [],
      type: "website",
    },
  };
}

export default async function ProductDetail({ params }: ProductDetailProps) {
  const { slug } = await params;

  // Fetch product details server-side
  const productData = await getProductDetails(slug);
  return (
    <Suspense fallback={<Loader height="h-[80vh]" />}>
      <ProductDetailClient initialProductData={productData} slug={slug} />
    </Suspense>
  );
}
