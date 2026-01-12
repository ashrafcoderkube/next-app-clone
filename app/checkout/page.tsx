"use client";

import React from "react";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import WholesalerCheckout from "./WholesalerCheckout";
import RetailerCheckout from "./RetailerCheckout";

const Checkout = () => {
  const { isWholesaler } = useAppSelector((state: RootState) => state.storeInfo);

  return (
    <div>
      {isWholesaler ? (
        <WholesalerCheckout />
      ) : (
        <RetailerCheckout />
      )}
    </div>
  );
};

export default Checkout;
