import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  findMatchingCartItem,
  getCartQuantityForProduct,
  MAX_GUEST_CART_VARIANT_QUANTITY,
  MAX_GUEST_CART_PRODUCT_QUANTITY,
} from "../../utils/cartItemUtils";

interface CartItem {
  id?: string | number;
  product_id?: number | string;
  retailer_product_id?: number | string;
  product_slug?: string;
  slug?: string;
  selectedVariant?: any;
  selected_variant?: any;
  quantity?: number | string;
  product_name?: string;
  name?: string;
  images?: any;
  cover_image?: string;
  product_stock?: number;
  wishlist_id?: number | string | null;
  final_price?: number;
  retailer_id?: number | string;
  wholesaler_id?: number | string;
  sub_category_id?: number | string;
  category_id?: number | string;
  status?: string | number;
  message?: string;
  [key: string]: any;
}

interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  addLoading: boolean;
  error: string | null;
  isCartOpen: boolean;
}

const initialState: CartState = {
  cartItems: [],
  loading: false,
  addLoading: false,
  error: null,
  isCartOpen: false,
};

interface AddToCartPayload {
  item: CartItem;
  quantity?: number;
}

interface UpdateCartItemPayload {
  item: CartItem;
  qty: number;
}

interface RemoveFromCartPayload {
  id?: string | number;
  product_id?: string | number;
  retailer_product_id?: string | number;
  selected_variant?: any;
  selectedVariant?: any;
}

interface SyncGuestCartPayload {
  token: string;
  cartItems: CartItem[];
}

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as any;
    const { auth } = state;
    if (!auth?.isAuthenticated) {
      return rejectWithValue("User not authenticated");
    }
    try {
      if (auth?.isAuthenticated) {
        const response = await axiosInstance.get("/customer/cart");
        return response.data.data?.cart || [];
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch cart items";

      return rejectWithValue(message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { item, quantity = 1 }: AddToCartPayload,
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const state = getState() as any;
      const { auth, cart } = state;
      if (!auth?.isAuthenticated) {
        const productSource = {
          product_id: item?.product_id ?? item?.id ?? null,
          id: item?.id ?? item?.product_id ?? null,
          retailer_product_id: item?.retailer_product_id ?? null,
          product_slug: item?.slug ?? item?.product_slug ?? null,
        };

        const variantSource =
          item?.selectedVariant || item?.selected_variant || null;

        const existingGuestItem = findMatchingCartItem(
          cart?.cartItems,
          productSource,
          variantSource
        );

        const existingQuantity = existingGuestItem
          ? parseInt(String(existingGuestItem.quantity), 10) || 0
          : 0;

        const maxVariantAllowed = MAX_GUEST_CART_VARIANT_QUANTITY;
        const maxProductAllowed = MAX_GUEST_CART_PRODUCT_QUANTITY;
        const variantLimitMessage = `You can add up to ${maxVariantAllowed} units of this variant.`;
        const productLimitMessage = `You can add up to ${maxProductAllowed} units of this product.`;

        if (existingQuantity > maxVariantAllowed) {
          toast.error(variantLimitMessage);
          // dispatch(openCartPopup());
          return;
        }
        const totalQuantityForProduct = getCartQuantityForProduct(
          cart?.cartItems,
          productSource
        );

        if (totalQuantityForProduct >= maxProductAllowed) {
          toast.error(productLimitMessage);
          // dispatch(openCartPopup());
          return;
        }

        const availableForVariant = Math.max(
          maxVariantAllowed - existingQuantity,
          0
        );
        const availableForProduct = Math.max(
          maxProductAllowed - totalQuantityForProduct,
          0
        );

        const quantityToAdd = Math.min(
          quantity,
          availableForVariant,
          availableForProduct
        );

        if (quantityToAdd <= 0) {
          const limitingMessage =
            availableForProduct <= availableForVariant
              ? productLimitMessage
              : variantLimitMessage;
          toast.error(limitingMessage);
          // dispatch(openCartPopup());
          return;
        }

        if (quantityToAdd < quantity) {
          const limitingMessage =
            availableForProduct <= availableForVariant
              ? productLimitMessage
              : variantLimitMessage;
          toast.error(limitingMessage);
          return;
        }

        const guestCartItem: CartItem = {
          quantity: quantityToAdd,
          alternate_name: item?.alternate_name || item?.name,
          images: item?.images,
          cover_image: item?.cover_image,
          product_stock: item?.selectedVariant?.stock ?? item?.quantity ?? 0,
          wishlist_id: item?.wishlist_id ?? null,
          final_price: (
            item?.selectedVariant?.final_price ?? item?.final_price ?? 0
          ),
          retailer_id: item?.retailer_id,
          wholesaler_id: item?.wholesaler_id,
          product_id: item?.id || item?.product_id,
          sub_category_id: item?.sub_category_id,
          category_id: item?.sub_category?.category_id,
          // product_id: item?.id || item?.product_id,
          product_slug: item?.slug,
          selected_variant: item?.selectedVariant
            ? {
                id: item.selectedVariant.id,
                variation: item.selectedVariant.variation,
                final_price: item.selectedVariant.final_price,
                stock: item.selectedVariant.stock,
              }
            : null,
        };

        dispatch(addToCartGuest(guestCartItem));
        dispatch(openCartPopup());
        // toast.success("Item added successfully in cart.");
      } else {
        const data = {
          // retailer_id: item?.retailer_id,
          // wholesaler_id: item?.wholesaler_id,
          id: item?.selectedVariant?.id,
          quantity: quantity,
          product_id: item?.id || item?.product_id,
        };
        const response = await axiosInstance.post("/customer/cart",data);

        if (response?.data?.success) {
          const apiResult = response.data.data;
          const productObj = apiResult;
          const cartItem: CartItem = {
            product_id: productObj.product_id || item?.selectedVariant?.id,
            quantity: productObj.quantity,
            product_stock: productObj.product_stock,
            alternate_name: item?.alternate_name || item?.name,
            images: item?.images,
            cover_image: item?.cover_image,
            status: productObj.status,
            message: productObj.message,
            wishlist_id: productObj.wishlist_id,
            sub_category_id: item?.sub_category_id,
            category_id: item?.sub_category?.category_id,
            final_price: (
              productObj.final_price ||
                item?.selectedVariant?.final_price ||
                item?.final_price ||
                0
            ),
            retailer_id: item?.retailer_id,
            wholesaler_id: item?.wholesaler_id,
            product_slug: item?.slug,
            product_variations_id: item?.selectedVariant?.id,
            selected_variant: item?.selectedVariant
              ? {
                  id: item.selectedVariant.id,
                  variation: item.selectedVariant.variation,
                  final_price: item.selectedVariant.final_price,
                  stock: item.selectedVariant.stock,
                }
              : null,
          };

          dispatch(addToCartUser(cartItem));
          dispatch(openCartPopup());
          // toast.success(response.data.message || "Item added to cart.");
        } else {
          toast.error(response.data.message || "Failed to add item to cart");
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add item to cart";
      if (Array.isArray(message)) {
        message.forEach((err: string) => toast.error(err));
      } else {
        toast.error(message);
      }
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { item, qty }: UpdateCartItemPayload,
    { dispatch, rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as any;
      const { auth, cart } = state;

      if (!auth?.isAuthenticated) {
        const productSource = {
          product_id: item?.product_id ?? item?.id ?? null,
          id: item?.id ?? item?.product_id ?? null,
          retailer_product_id: item?.retailer_product_id ?? null,
          product_slug: item?.slug ?? item?.product_slug ?? null,
        };

        const variantSource =
          item?.selectedVariant || item?.selected_variant || null;

        const existingGuestItem = findMatchingCartItem(
          cart?.cartItems,
          productSource,
          variantSource
        );

        const existingQuantity = existingGuestItem
          ? parseInt(String(existingGuestItem.quantity), 10) || 0
          : 0;

        const maxVariantAllowed = MAX_GUEST_CART_VARIANT_QUANTITY;
        const maxProductAllowed = MAX_GUEST_CART_PRODUCT_QUANTITY;
        const variantLimitMessage = `You can add up to ${maxVariantAllowed} units of this variant.`;
        const productLimitMessage = `You can add up to ${maxProductAllowed} units of this product.`;

        const totalQuantityForProduct = getCartQuantityForProduct(
          cart?.cartItems,
          productSource
        );

        if (qty > 0) {
          const availableForVariant = Math.max(
            maxVariantAllowed - existingQuantity,
            0
          );
          const availableForProduct = Math.max(
            maxProductAllowed - totalQuantityForProduct,
            0
          );

          const quantityToAdd = Math.min(
            qty,
            availableForVariant,
            availableForProduct
          );

          if (quantityToAdd <= 0) {
            const limitingMessage =
              availableForProduct <= availableForVariant
                ? productLimitMessage
                : variantLimitMessage;
            toast.error(limitingMessage);
            return;
          }

          if (quantityToAdd < qty) {
            const limitingMessage =
              availableForProduct <= availableForVariant
                ? productLimitMessage
                : variantLimitMessage;
            toast.error(limitingMessage);
            return;
          }

          dispatch(
            updateQuantityGuest({
              ...item,
              quantity: quantityToAdd,
            })
          );
          // toast.success("Cart quantity updated");
          return;
        }

        dispatch(
          updateQuantityGuest({
            ...item,
            quantity: qty,
          })
        );
        // toast.success("Cart quantity updated");
      } else {
        const data = {
          // retailer_id: item.retailer_id,
          // wholesaler_id: item?.wholesaler_id ?? null,
          quantity: qty,
          id: item?.selected_variant?.id,
          product_id: item?.retailer_product_id || item?.product_id || item?.id,
        };
        const response = await axiosInstance.post(
          "/customer/cart",
          data
        );
        if (response?.data?.success) {
          const apiResult = response?.data?.data;
          const productObj = apiResult;
          const cartItem: CartItem = {
            ...item,
            id: productObj.product_id,
            quantity: productObj.quantity,
          };
          dispatch(updateQuantityUser(cartItem));
          // toast.success(response?.data?.message || "Cart updated successfully");
        } else {
          const msg =
            Array.isArray(response?.data?.message) &&
            response?.data?.message?.length
              ? response.data.message.join(", ")
              : response?.data?.message || "Failed to update cart";

          toast.error(msg);
          return rejectWithValue(msg);
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update cart item";

      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCartApi = createAsyncThunk(
  "cart/removeFromCartApi",
  async (item: CartItem, { rejectWithValue, dispatch, getState }) => {
    const state = getState() as any;
    const { auth } = state;
    const keyPayload: RemoveFromCartPayload = {
      id: item?.id || item?.product_id,
      selected_variant: item?.selected_variant || item?.selectedVariant?.variation || null,
    };
    try {
      if (auth?.isAuthenticated) {
        const data = {
          product_id: item?.id || item?.product_id || "",
          id: item?.product_variations_id || null,
        };
        dispatch(removeFromCart(keyPayload));
        const response = await axiosInstance.post(
          "/customer/cart/remove",
          data
        );
        toast.success(response.data.message);
        return response.data;
      } else {
        dispatch(removeFromCart(keyPayload));
        toast.success("Item removed from cart");
      }
    } catch (error: any) {
      if (auth?.isAuthenticated) {
        dispatch(addToCartUser(item));
      } else {
        dispatch(addToCartGuest(item));
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove item from cart";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const syncGuestCartItems = createAsyncThunk(
  "cart/syncGuestCartItems",
  async (
    { token, cartItems }: SyncGuestCartPayload,
    { rejectWithValue, dispatch }
  ) => {
    if (!token || !cartItems?.length) {
      return { success: false, message: "No token or cart items found" };
    }

    const cart_items = cartItems.map((item) => ({
      product_id: item?.id || item?.product_id,
      quantity: item.quantity || 1,
      retailer_id: item.retailer_id || null,
      wholesaler_id: item.wholesaler_id || null,
      variant_id: item?.selected_variant?.id && item?.selected_variant?.id || null,
    }));
    try {
      const response = await axiosInstance.post(
        "/customer/cart/sync-guest",
        { cart_items },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        dispatch(fetchCart());
      } else {
        toast.error(response?.data?.errors);
      }
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to sync cart items";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cartItems = [];
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cartItems = action.payload;
    },
    addToCartGuest: (state, action: PayloadAction<CartItem>) => {
      if (!state.cartItems) state.cartItems = [];
      const existingItem = state.cartItems.find((item) => {
        if (!item) return false;
        const itemId = item.id ?? item.product_id ?? item.retailer_product_id;
        return (
          (itemId === action.payload.product_id ||
            itemId === action.payload.id) &&
          ((!item.selected_variant && !action.payload.selected_variant) ||
            item.selected_variant?.variation ===
              action.payload.selected_variant?.variation)
        );
      });
      if (existingItem) {
        const currentQty = parseInt(String(existingItem.quantity), 10) || 0;
        const incomingQty = parseInt(String(action.payload.quantity), 10) || 0;
        const totalForProduct = getCartQuantityForProduct(
          state.cartItems,
          action.payload
        );
        const otherVariantsTotal = Math.max(totalForProduct - currentQty, 0);
        const maxVariantCap = Math.max(
          Math.min(
            MAX_GUEST_CART_VARIANT_QUANTITY,
            MAX_GUEST_CART_PRODUCT_QUANTITY - otherVariantsTotal
          ),
          0
        );
        const desiredQty = currentQty + incomingQty;
        const updatedQty =
          incomingQty >= 0 ? Math.min(desiredQty, maxVariantCap) : desiredQty;
        existingItem.quantity = Math.max(updatedQty, 1);
      } else {
        state.cartItems = state.cartItems.filter(Boolean);
        const totalForProduct = getCartQuantityForProduct(
          state.cartItems,
          action.payload
        );
        const availableForProduct = Math.max(
          MAX_GUEST_CART_PRODUCT_QUANTITY - totalForProduct,
          0
        );
        const sanitizedQty = Math.min(
          Math.max(parseInt(String(action.payload.quantity), 10) || 1, 1),
          MAX_GUEST_CART_VARIANT_QUANTITY,
          availableForProduct
        );
        if (sanitizedQty > 0) {
          state.cartItems.push({
            ...action.payload,
            quantity: sanitizedQty,
          });
        }
      }
    },
    addToCartUser: (state, action: PayloadAction<CartItem>) => {
      if (!state.cartItems) state.cartItems = [];
      const existingItem = state.cartItems.find((item) => {
        if (!item) return false;
        const itemId = item.id || item.product_id || item?.retailer_product_id;
        return (
          (itemId === action.payload.product_id ||
            itemId === action.payload.id) &&
          ((!item.selected_variant && !action.payload.selected_variant) ||
            item.selected_variant?.variation ===
              action.payload.selected_variant?.variation)
        );
      });

      if (existingItem) {
        existingItem.quantity = action.payload.quantity;
      } else {
        state.cartItems = state.cartItems.filter(Boolean);
        state.cartItems.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<RemoveFromCartPayload>) => {
      const targetId =
        action.payload?.id ??
        action.payload?.product_id ??
        action.payload?.retailer_product_id;
      const targetVar =
        action.payload?.selected_variant ||
        action.payload?.selectedVariant ||
        null;

      state.cartItems = state.cartItems.filter((item) => {
        const itemId = item.id ?? item.product_id ?? item.retailer_product_id;
        const itemVar = item.selected_variant || item.selectedVariant || null;

        const sameId = itemId === targetId;
        const sameVariant =
          (!itemVar && !targetVar) ||
          itemVar?.variation === targetVar?.variation;

        return !(sameId && sameVariant);
      });
    },
    updateQuantityUser: (state, action: PayloadAction<CartItem>) => {
      const {
        id,
        product_id,
        retailer_product_id,
        selected_variant,
        selectedVariant,
        quantity,
      } = action.payload;

      const payloadId = id ?? product_id ?? retailer_product_id;
      const payloadVar = selected_variant || selectedVariant || null;

      const itemIndex = state.cartItems.findIndex((item) => {
        const itemId = item.id ?? item.product_id ?? item.retailer_product_id;

        const itemVar = item.selected_variant || item.selectedVariant || null;

        const sameVariant =
          (!itemVar && !payloadVar) ||
          itemVar?.variation === payloadVar?.variation;

        return itemId === payloadId && sameVariant;
      });

      if (itemIndex > -1) {
        state.cartItems[itemIndex].quantity = Math.max(Number(quantity), 1);
      } else if (quantity && Number(quantity) > 0) {
        state.cartItems.push({
          ...action.payload,
          quantity: Math.max(Number(quantity), 1),
        });
      }
    },

    updateQuantityGuest: (state, action: PayloadAction<CartItem>) => {
      const {
        id,
        product_id,
        retailer_product_id,
        selected_variant,
        selectedVariant,
        quantity,
      } = action.payload;

      const payloadId = id ?? product_id ?? retailer_product_id;
      const payloadVar = selected_variant || selectedVariant || null;

      const existingItem = state.cartItems.find((item) => {
        const itemId = item.id ?? item.product_id ?? item.retailer_product_id;

        const itemVar = item.selected_variant || item.selectedVariant || null;

        const sameVariant =
          (!itemVar && !payloadVar) ||
          itemVar?.variation === payloadVar?.variation;

        return itemId === payloadId && sameVariant;
      });

      if (existingItem) {
        const currentQty = parseInt(String(existingItem.quantity), 10) || 0;
        const delta = parseInt(String(quantity), 10) || 0;
        const totalForProduct = getCartQuantityForProduct(
          state.cartItems,
          action.payload
        );
        const otherVariantsTotal = Math.max(totalForProduct - currentQty, 0);
        const maxVariantCap = Math.max(
          Math.min(
            MAX_GUEST_CART_VARIANT_QUANTITY,
            MAX_GUEST_CART_PRODUCT_QUANTITY - otherVariantsTotal
          ),
          0
        );
        let desiredQty = currentQty + delta;

        if (delta > 0) {
          desiredQty = Math.min(desiredQty, maxVariantCap);
        }

        existingItem.quantity = Math.max(desiredQty, 1);
      } else if (quantity && Number(quantity) > 0) {
        const totalForProduct = getCartQuantityForProduct(
          state.cartItems,
          action.payload
        );
        const availableForProduct = Math.max(
          MAX_GUEST_CART_PRODUCT_QUANTITY - totalForProduct,
          0
        );
        const sanitizedQty = Math.min(
          Math.max(parseInt(String(quantity), 10) || 1, 1),
          MAX_GUEST_CART_VARIANT_QUANTITY,
          availableForProduct
        );
        if (sanitizedQty > 0) {
          state.cartItems.push({
            ...action.payload,
            quantity: sanitizedQty,
          });
        }
      }
    },

    openCartPopup: (state) => {
      state.isCartOpen = true;
    },
    closeCartPopup: (state) => {
      state.isCartOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload || [];
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.addLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(addToCart.pending, (state) => {
      state.addLoading = true;
      state.error = null;
    });
    builder.addCase(addToCart.fulfilled, (state) => {
      state.addLoading = false;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.addLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCartItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearCart,
  setCart,
  addToCartGuest,
  addToCartUser,
  removeFromCart,
  openCartPopup,
  closeCartPopup,
  updateQuantityGuest,
  updateQuantityUser,
} = cartSlice.actions;

export default cartSlice.reducer;
