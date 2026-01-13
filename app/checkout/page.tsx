"use client";

import { useAppSelector } from "../redux/hooks";
import WholesalerCheckout from "./WholesalerCheckout";
import RetailerCheckout from "./RetailerCheckout";
import { selectThemeData } from "../redux/selectors";

const Checkout = () => {
  const { isWholesaler } = useAppSelector((selectThemeData))
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
