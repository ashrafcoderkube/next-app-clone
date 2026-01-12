import ReactGA from "react-ga4";

// Track if GA is initialized
export let isGAInitialized = false;

// Initialize Google Analytics
export const initGA = (measurementId) => {
  try {
    if (measurementId) {
      ReactGA.initialize(measurementId);
      isGAInitialized = true;
    } else {
      console.warn("Google Analytics Measurement ID is not provided");
    }
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
  }
};

// Helper function to safely send events
const safeEvent = (eventName, eventParams) => {
  if (!isGAInitialized) {
    console.warn(
      `Google Analytics not initialized. Event "${eventName}" not sent.`
    );
    return;
  }

  try {
    ReactGA.event(eventName, eventParams);
  } catch (error) {
    console.error(`Failed to send GA event "${eventName}":`, error);
  }
};

// Enhanced Ecommerce Tracking Functions

/**
 * Track product detail view
 * @param {Object} product - Product information
 * @param {string} product.id - Product ID
 * @param {string} product.name - Product name
 * @param {string} product.category - Product category
 * @param {string} product.brand - Product brand
 * @param {number} product.price - Product price
 * @param {string} product.currency - Currency code (default: USD)
 */
export const trackProductView = (product) => {
  if (!product || !product.id || !product.name) {
    console.warn("trackProductView: Invalid product data. Required: id, name");
    return;
  }

  safeEvent("view_item", {
    currency: product.currency || "USD",
    value: product.price || 0,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price || 0,
        quantity: 1,
      },
    ],
  });
};

/**
 * Track when a product is added to cart
 * @param {Object} product - Product information
 * @param {number} quantity - Quantity added
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product || !product.id || !product.name) {
    console.warn("trackAddToCart: Invalid product data. Required: id, name");
    return;
  }

  const qty = Math.max(1, Math.floor(quantity || 1));

  safeEvent("add_to_cart", {
    currency: product.currency || "USD",
    value: (product.price || 0) * qty,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price || 0,
        quantity: qty,
      },
    ],
  });
};

/**
 * Track when a product is removed from cart
 * @param {Object} product - Product information
 * @param {number} quantity - Quantity removed
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!product || !product.id || !product.name) {
    console.warn(
      "trackRemoveFromCart: Invalid product data. Required: id, name"
    );
    return;
  }

  const qty = Math.max(1, Math.floor(quantity || 1));

  safeEvent("remove_from_cart", {
    currency: product.currency || "USD",
    value: (product.price || 0) * qty,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price || 0,
        quantity: qty,
      },
    ],
  });
};

/**
 * Track when user begins checkout
 * @param {Array} items - Array of cart items
 * @param {string} currency - Currency code (default: USD)
 */
export const trackBeginCheckout = (items, currency = "USD") => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("trackBeginCheckout: Invalid items array");
    return;
  }

  const value = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  safeEvent("begin_checkout", {
    currency: currency || "USD",
    value: value,
    items: items.map((item) => ({
      item_id: item.id || "",
      item_name: item.name || "",
      item_category: item.category || "",
      item_brand: item.brand || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track checkout progress
 * @param {number} step - Checkout step number
 * @param {string} option - Checkout option/description
 * @param {Array} items - Array of cart items
 * @param {string} currency - Currency code (default: USD)
 */
export const trackCheckoutProgress = (
  step,
  option,
  items,
  currency = "USD"
) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("trackCheckoutProgress: Invalid items array");
    return;
  }

  if (typeof step !== "number" || step < 1) {
    console.warn("trackCheckoutProgress: Invalid step number");
    return;
  }

  const value = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  safeEvent("checkout_progress", {
    currency: currency || "USD",
    value: value,
    checkout_step: step,
    checkout_option: option || "",
    items: items.map((item) => ({
      item_id: item.id || "",
      item_name: item.name || "",
      item_category: item.category || "",
      item_brand: item.brand || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track purchase completion
 * @param {Object} transaction - Transaction information
 * @param {string} transaction.transaction_id - Unique transaction ID
 * @param {string} transaction.affiliation - Store/affiliation name
 * @param {number} transaction.value - Total transaction value
 * @param {number} transaction.tax - Tax amount
 * @param {number} transaction.shipping - Shipping cost
 * @param {string} transaction.currency - Currency code (default: USD)
 * @param {Array} transaction.items - Array of purchased items
 */
export const trackPurchase = (transaction) => {
  if (!transaction || !transaction.transaction_id) {
    console.warn(
      "trackPurchase: Invalid transaction data. Required: transaction_id"
    );
    return;
  }

  if (
    !transaction.items ||
    !Array.isArray(transaction.items) ||
    transaction.items.length === 0
  ) {
    console.warn("trackPurchase: Invalid items array");
    return;
  }

  safeEvent("purchase", {
    transaction_id: transaction.transaction_id,
    affiliation: transaction.affiliation || "Online Store",
    value: transaction.value || 0,
    tax: transaction.tax || 0,
    shipping: transaction.shipping || 0,
    currency: transaction.currency || "USD",
    items: transaction.items.map((item) => ({
      item_id: item.id || "",
      item_name: item.name || "",
      item_category: item.category || "",
      item_brand: item.brand || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Track product list view (impressions)
 * @param {string} listName - Name of the product list
 * @param {Array} items - Array of products in the list
 */
export const trackProductList = (listName, items) => {
  if (!listName) {
    console.warn("trackProductList: listName is required");
    return;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("trackProductList: Invalid items array");
    return;
  }

  safeEvent("view_item_list", {
    item_list_name: listName,
    items: items.map((item, index) => ({
      item_id: item.id || "",
      item_name: item.name || "",
      item_category: item.category || "",
      item_brand: item.brand || "",
      price: item.price || 0,
      position: item.position || index + 1,
    })),
  });
};

/**
 * Track when user clicks on a product in a list
 * @param {string} listName - Name of the product list
 * @param {Object} product - Product information
 * @param {number} position - Position in the list
 */
export const trackProductClick = (listName, product, position = 1) => {
  if (!listName) {
    console.warn("trackProductClick: listName is required");
    return;
  }

  if (!product || !product.id || !product.name) {
    console.warn("trackProductClick: Invalid product data. Required: id, name");
    return;
  }

  safeEvent("select_item", {
    item_list_name: listName,
    item_list_id: listName,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price || 0,
        position: Math.max(1, Math.floor(position || 1)),
      },
    ],
  });
};

/**
 * Track promotion views
 * @param {Array} promotions - Array of promotion objects
 */
export const trackPromotionView = (promotions) => {
  if (!promotions || !Array.isArray(promotions) || promotions.length === 0) {
    console.warn("trackPromotionView: Invalid promotions array");
    return;
  }

  safeEvent("view_promotion", {
    promotions: promotions.map((promo) => ({
      promotion_id: promo.id || "",
      promotion_name: promo.name || "",
      creative_name: promo.creative_name || "",
      creative_slot: promo.creative_slot || "",
    })),
  });
};

/**
 * Track promotion clicks
 * @param {Object} promotion - Promotion information
 */
export const trackPromotionClick = (promotion) => {
  if (!promotion || !promotion.id) {
    console.warn("trackPromotionClick: Invalid promotion data. Required: id");
    return;
  }

  safeEvent("select_promotion", {
    promotions: [
      {
        promotion_id: promotion.id,
        promotion_name: promotion.name || "",
        creative_name: promotion.creative_name || "",
        creative_slot: promotion.creative_slot || "",
      },
    ],
  });
};

interface RefundData {
  transaction_id: string;
  value?: number;
  currency?: string;
  items?: Array<{
    id?: string;
    name?: string;
    category?: string;
    brand?: string;
    price?: number;
    quantity?: number;
  }>;
}

/**
 * Track refund
 * @param {Object} refund - Refund information
 * @param {string} refund.transaction_id - Transaction ID being refunded
 * @param {number} refund.value - Refund value
 * @param {string} refund.currency - Currency code (default: USD)
 * @param {Array} refund.items - Array of refunded items (optional)
 */
export const trackRefund = (refund: RefundData) => {
  if (!refund || !refund.transaction_id) {
    console.warn("trackRefund: Invalid refund data. Required: transaction_id");
    return;
  }

  const eventData: {
    transaction_id: string;
    value: number;
    currency: string;
    items?: Array<{
      item_id: string;
      item_name: string;
      item_category: string;
      item_brand: string;
      price: number;
      quantity: number;
    }>;
  } = {
    transaction_id: refund.transaction_id,
    value: refund.value || 0,
    currency: refund.currency || "USD",
  };

  if (refund.items && Array.isArray(refund.items) && refund.items.length > 0) {
    eventData.items = refund.items.map((item: any) => ({
      item_id: item.id || "",
      item_name: item.name || "",
      item_category: item.category || "",
      item_brand: item.brand || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
    }));
  }

  safeEvent("refund", eventData);
};
