"use client"

import { useState, useCallback, useEffect } from "react";

export default function useCartQuantity({
  initial = 1,
  availableStock = Infinity,
  resetKey = null,
  onChange = null,
  currentVariantQuantity = 0,
  totalProductQuantity = 0,
  variantLimit = 5,
  productLimit = 5,
} = {}) {
  const [quantity, setQuantity] = useState(initial);

  useEffect(() => {
    setQuantity(initial);
  }, [resetKey, initial]);

  const updateQuantity = useCallback(
    (newQty, action = null) => {
      setQuantity(newQty);
      if (onChange) onChange(newQty, action);
    },
    [onChange]
  );

  const otherVariantQuantity = Math.max(totalProductQuantity - currentVariantQuantity, 0);
  const otherProductQuantity = Math.max(totalProductQuantity - currentVariantQuantity, 0);
  const variantCapacityForItem = Math.max(variantLimit - otherVariantQuantity, 0);
  const productCapacityForItem = Math.max(productLimit - otherProductQuantity, 0);
  const effectiveMaxLimit = Math.min(variantCapacityForItem, productCapacityForItem);

  const maxAllowedQuantity = Math.min(availableStock, effectiveMaxLimit);

  const increase = useCallback(() => {
    if (quantity >= maxAllowedQuantity) return;
    const newQuantity = Math.min(quantity + 1, maxAllowedQuantity);
    updateQuantity(newQuantity, "increase");
  }, [quantity, maxAllowedQuantity, updateQuantity]);

  const decrease = useCallback(() => {
    const newQuantity = quantity > 1 ? quantity - 1 : 1;
    updateQuantity(newQuantity, "decrease");
  }, [quantity, updateQuantity]);

  const reset = useCallback(() => {
    updateQuantity(initial);
  }, [initial, updateQuantity]);

  return {
    quantity,
    setQuantity: updateQuantity,
    increase,
    decrease,
    reset,
    canIncrease: quantity < maxAllowedQuantity,
    canDecrease: quantity > 0,
  };
}
