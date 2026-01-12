'use client';
import { useState } from "react";
import DeliveryAddressCard from "../DeliveryAddressCard";

const UpdateAddressForm = () => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  return (
    <div className="w-full text-start account-box">
      <div className="mt-3">
        <DeliveryAddressCard
          selectedAddressId={selectedAddressId}
          onSelect={setSelectedAddressId}
          page="my_account"
        />
      </div>
    </div>
  );
};

export default UpdateAddressForm;
