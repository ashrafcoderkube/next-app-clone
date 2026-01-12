// TypeScript types for Store Info based on API response

export interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  sub_category_image: string;
}

export interface StoreInfoData {
  subdomain: string;
  retailer_id: number;
  theme_id: number;
  theme: string;
  logo: string;
  store_name: string;
  store_time: string;
  mobile_no: string;
  email: string;
  address: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  enquiry_whatsapp: number;
  sms_service: number;
  prepaid_option?: number;
  favicon: string;
  banner: string | null;
  fontFamily: string;
  backgroundColor: string;
  buttonBackgroundColor: string;
  topHeaderBackgroundColor: string;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  textColor: string;
  bodyTextColor: string;
  buttonTextColor: string;
  bottomFooterBackgroundColor: string;
  bannerButtonColor: string;
  bannerButtonTextColor: string;
  bannerButtonBorderColor: string;
  collectionButtonColor: string;
  collectionButtonTextColor: string;
  collectionButtonBorderColor: string;
  newsletterButtonColor: string;
  newsletterButtonTextColor: string;
  newsletterButtonBorderColor: string;
  addToCartButtonBackgroundColor: string;
  addToCartButtonTextColor: string;
  addToCartButtonBorderColor: string;
  buyNowButtonBackgroundColor: string;
  buyNowButtonTextColor: string;
  buyNowButtonBorderColor: string;
  footerLogo: string | null;
  offer_text?: string;
  is_coupon_enabled?: boolean;
  MaintenanceMode?: boolean;
}

export interface StoreInfoResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    storeinfo: StoreInfoData;
  };
}

export interface ProductCategoriesResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: SubCategory[];
}

export interface StoreMetadataData {
  favicon: string | null;
  logo: string;
  store_name: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
}

export interface StoreMetadataResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    storeinfo: StoreMetadataData;
  };
}
