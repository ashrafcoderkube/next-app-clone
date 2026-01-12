/**
 * Cart Item Utilities
 * Functions for managing cart items, quantities, and matching logic
 */

// Type definitions
interface ProductSource {
  product_id?: number | string;
  productId?: number | string;
  id?: number | string;
  retailer_product_id?: number | string;
  retailerProductId?: number | string;
  product_slug?: string;
  slug?: string;
}

interface VariantLike {
  id?: number | string;
  variant_id?: number | string;
  product_variation?: string;
}

interface CartItem extends ProductSource {
  selected_variant?: VariantLike | null;
  selectedVariant?: VariantLike | null;
  quantity?: number | string;
}

interface ProductKeys {
  ids: (string | null)[];
  slugs: (string | null)[];
}

interface VariantDescriptor {
  ids: (string | null)[];
  names: (string | null)[];
  isEmpty: boolean;
}

// Helper functions
const normalizeId = (value: number | string | null | undefined): string | null =>
  value === undefined || value === null ? null : String(value);

const normalizeKey = (value: string | null | undefined): string | null =>
  value === undefined || value === null
    ? null
    : value.toString().toLowerCase();

const unique = (values: (string | null)[]): (string | null)[] =>
  Array.from(new Set(values.filter(Boolean)));

/**
 * Collect product keys (IDs and slugs) from a product source
 */
export const collectProductKeys = (source: ProductSource = {}): ProductKeys => {
  const ids = unique([
    source.product_id,
    source.productId,
    source.id,
    source.retailer_product_id,
    source.retailerProductId,
  ].map(normalizeId));

  const slugs = unique([
    source.product_slug,
    source.slug,
  ].map(normalizeKey));

  return { ids, slugs };
};

/**
 * Collect variant descriptor (IDs and names) from a variant-like object
 */
export const collectVariantDescriptor = (variantLike: VariantLike | null | undefined = {}): VariantDescriptor => {
  if (!variantLike) {
    return { ids: [], names: [], isEmpty: true };
  }

  const ids = unique([
    variantLike.id,
    variantLike.variant_id,
  ].map(normalizeId));

  const names = unique([
    variantLike.product_variation,
  ].map(normalizeKey));

  const isEmpty = ids.length === 0 && names.length === 0;

  return { ids, names, isEmpty };
};

/**
 * Get variant descriptor from a cart item
 */
export const getItemVariantDescriptor = (item: CartItem = {}): VariantDescriptor => {
  const variantLike = item.selected_variant || item.selectedVariant || null;
  return collectVariantDescriptor(variantLike);
};

/**
 * Check if product keys match between source and item
 */
export const hasProductMatch = (productKeys: ProductKeys, itemKeys: ProductKeys): boolean => {
  if (!productKeys.ids.length && !productKeys.slugs.length) {
    return false;
  }

  const idMatch = productKeys.ids.some((key) => itemKeys.ids.includes(key));
  const slugMatch = productKeys.slugs.some((key) => itemKeys.slugs.includes(key));

  return idMatch || slugMatch;
};

/**
 * Check if variant descriptors match
 */
export const hasVariantMatch = (targetVariant: VariantDescriptor, itemVariant: VariantDescriptor): boolean => {
  if (targetVariant.isEmpty) {
    return itemVariant.isEmpty;
  }

  const idMatch = targetVariant.ids.some((id) => itemVariant.ids.includes(id));
  const nameMatch = targetVariant.names.some((name) =>
    itemVariant.names.includes(name)
  );

  return idMatch || nameMatch;
};

/**
 * Find a matching cart item based on product and variant
 */
export const findMatchingCartItem = (
  cartItems: CartItem[],
  productSource: ProductSource,
  variantSource: VariantLike | null = null
): CartItem | undefined => {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return undefined;
  }

  const productKeys = collectProductKeys(productSource);
  const variantDescriptor = collectVariantDescriptor(variantSource);

  return cartItems.find((cartItem) => {
    if (!cartItem) return false;

    const itemProductKeys = collectProductKeys(cartItem);
    if (!hasProductMatch(productKeys, itemProductKeys)) {
      return false;
    }

    const itemVariantDescriptor = getItemVariantDescriptor(cartItem);
    return hasVariantMatch(variantDescriptor, itemVariantDescriptor);
  });
};

/**
 * Get total cart quantity for a product (across all variants)
 */
export const getCartQuantityForProduct = (
  cartItems: CartItem[],
  productSource: ProductSource
): number => {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return 0;
  }

  const productKeys = collectProductKeys(productSource);

  if (!productKeys.ids.length && !productKeys.slugs.length) {
    return 0;
  }

  return cartItems.reduce((total, cartItem) => {
    if (!cartItem) {
      return total;
    }

    const itemKeys = collectProductKeys(cartItem);
    if (!hasProductMatch(productKeys, itemKeys)) {
      return total;
    }

    const itemQuantity = parseInt(String(cartItem.quantity), 10);
    return total + (Number.isNaN(itemQuantity) ? 0 : itemQuantity);
  }, 0);
};

/**
 * Get cart quantity for a specific product variant
 */
export const getCartQuantityForVariant = (
  cartItems: CartItem[],
  productSource: ProductSource,
  variantSource: VariantLike | null = null
): number => {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return 0;
  }

  const productKeys = collectProductKeys(productSource);
  const variantDescriptor = collectVariantDescriptor(variantSource);

  return cartItems.reduce((total, cartItem) => {
    if (!cartItem) {
      return total;
    }

    const itemProductKeys = collectProductKeys(cartItem);
    if (!hasProductMatch(productKeys, itemProductKeys)) {
      return total;
    }

    const itemVariantDescriptor = getItemVariantDescriptor(cartItem);
    if (!hasVariantMatch(variantDescriptor, itemVariantDescriptor)) {
      return total;
    }

    const itemQuantity = parseInt(String(cartItem.quantity), 10);
    return total + (Number.isNaN(itemQuantity) ? 0 : itemQuantity);
  }, 0);
};

// Constants
export const MAX_GUEST_CART_VARIANT_QUANTITY = 5;
export const MAX_GUEST_CART_PRODUCT_QUANTITY = 5;

