'use client';
import { MapPin, Edit2, PlusIcon, Trash2 } from "lucide-react";
import {
  getShippingAddress,
  setOpenAddressForm,
  setSelectedAddressForEdit,
} from "../redux/slices/shippingAddressSlice";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Loader from "./customcomponents/Loader";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import AddressForm from "./AddressForm";
import AddressDeleteModal from "./model/AddressDeleteModal";

export default function DeliveryAddressCard({
  selectedAddressId,
  onSelect,
  page,
}: {
  selectedAddressId?: number;
  onSelect?: (id: number) => void;
  page?: string;
}) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { openAddressForm, shippingAddress, loading } = useAppSelector(
    (state: RootState) => state.shippingAddress
  );

  const { themeId } = useAppSelector((state: RootState) => state.storeInfo);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const themeContext = useTheme() || {};
  const { textColor, bottomFooterTextColor } = themeContext;

  useEffect(() => {
    if (isAuthenticated) dispatch(getShippingAddress());
  }, [dispatch, isAuthenticated]);

  const addresses = useMemo(() => {
    return Array.isArray(shippingAddress) ? shippingAddress : [];
  }, [shippingAddress]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr: any) => addr.is_default);
      const addressToSelect = defaultAddress || addresses[0];

      if (addressToSelect && onSelect) {
        onSelect(addressToSelect.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length, selectedAddressId]);

  const formatAddress = (addressData: any) => {
    const {
      address = "",
      city = "",
      state = "",
      pincode = "",
    } = addressData || {};

    const addressLower = address?.toLowerCase();
    const parts = [address];

    if (city && !addressLower.includes(city?.toLowerCase())) {
      parts.push(city);
    }
    if (state && !addressLower.includes(state?.toLowerCase())) {
      parts.push(state);
    }
    if (pincode && !addressLower.includes(pincode?.toLowerCase())) {
      parts.push(pincode);
    }

    return parts.join(", ");
  };

  const handleEdit = (e: React.MouseEvent, addressData: any) => {
    e.stopPropagation();
    dispatch(setSelectedAddressForEdit(addressData));
    dispatch(setOpenAddressForm(true));
  };

  const handleAddNew = () => {
    dispatch(setSelectedAddressForEdit(null));
    dispatch(setOpenAddressForm(true));
  };

  return (
    <div
      className={`${
        themeId === 4 ? "custom-grid" : "flex flex-col justify-start gap-2 "
      } `}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Save Address</h2>
        <button
          name="Add New Address"
          type="button"
          className="text-sm px-5 pe-6 py-3 btn cursor-pointer border rounded-md p-2 transition-colors"
          onClick={handleAddNew}
          style={{
            backgroundColor: themeContext?.buttonBackgroundColor,
            color: themeContext?.buttonTextColor,
            borderColor: themeContext?.buttonBorderColor,
          }}
        >
          <div className="flex items-center gap-2">
            <PlusIcon className="w-6 h-6" />
            <span className="text-sm">Address</span>
          </div>
        </button>
      </div>
      {loading ? (
        <Loader height="min-h-[200px]" />
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pe-2">
          {addresses.map((addressData: any) => {
            const isSelected = addressData.id === selectedAddressId;
            const fullAddress = formatAddress(addressData);

            return (
              <div
                key={addressData.id}
                className={`border ${
                  themeId === 2 ? "rounded-xl" : "border-radius-xl"
                } p-4 mb-2 transition-all duration-300 cursor-pointer relative

                  `}
                style={{
                  backgroundColor: themeContext?.backgroundColor,
                  color: textColor,
                  border: isSelected
                    ? `1px solid ${themeContext?.bottomFooterBackgroundColor}`
                    : `1px solid ${themeContext?.bottomFooterBackgroundColor}2A`,
                }}
                onClick={() => onSelect && onSelect(addressData.id)}
              >
                {themeId !== 4 && (
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      name="Edit Address"
                      onClick={(e) => handleEdit(e, addressData)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Edit Address"
                      disabled={openDeleteModal}
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 hover:text-black" />
                    </button>
                    {page === "my_account" && addresses.length !== 1 && (
                      <button
                        name="Delete Address"
                        onClick={() => setOpenDeleteModal(true)}
                        className="p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Address"
                        disabled={openDeleteModal}
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </button>
                    )}
                  </div>
                )}

                <div
                  className={
                    themeId === 4
                      ? "delivery-address-content"
                      : "flex items-start gap-3 pr-2"
                  }
                >
                  <div className="flex-1">
                    <div className="flex flex-col items-start gap-2 mb-1">
                      <div className="flex flex-row items-end gap-2">
                        <MapPin
                          className={`w-6 h-6 min-w-6 mt-1 ${
                            isSelected ? "text-black" : "text-gray-500"
                          }`}
                          style={{
                            color: textColor,
                          }}
                        />
                        <h3
                          className={`font-semibold text-gray-900 line-clamp-2 pe-2 ${
                            isSelected ? "text-black" : ""
                          }`}
                          style={{
                            color: textColor,
                          }}
                        >
                          Deliver to {addressData.firstname || user?.firstname}{" "}
                          {addressData.lastname || user?.lastname}
                        </h3>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        {addressData.is_default === 1 && (
                          <span
                            style={{
                              backgroundColor:
                                themeContext?.bottomFooterBackgroundColor,
                              color: bottomFooterTextColor,
                              border: `1px solid ${themeContext?.bottomFooterBackgroundColor}1A`,
                            }}
                            className="px-2 py-0.5 text-xs font-semibold rounded-md border"
                          >
                            Primary
                          </span>
                        )}
                        {addressData?.address_type && (
                          <span
                            style={{
                              backgroundColor:
                                themeContext?.bottomFooterBackgroundColor,
                              color: bottomFooterTextColor,
                              border: `1px solid ${themeContext?.bottomFooterBackgroundColor}1A`,
                            }}
                            className="px-2 py-0.5 text-xs font-semibold rounded-md border"
                          >
                            {addressData?.address_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-gray-600 mt-1 text-base leading-relaxed line-clamp-2 ${
                        isSelected ? "text-black" : ""
                      }`}
                      style={{ color: textColor }}
                    >
                      {fullAddress}
                    </p>
                    <p
                      className="text-gray-700 text-base mt-1 font-medium"
                      style={{ color: textColor }}
                    >
                      +91{" "}
                      {addressData.phone_number ||
                        addressData.alt_phone_number ||
                        user?.phone_number ||
                        user?.alt_phone_number}
                    </p>
                  </div>
                  {themeId === 4 && (
                    <div className="flex gap-2">
                      <button
                        name="Edit Address"
                        onClick={(e) => handleEdit(e, addressData)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium text-gray-700 hover:text-black cursor-pointer border"
                        style={{
                          borderColor: `${textColor}2A`,
                          color: textColor,
                        }}
                        disabled={openDeleteModal}
                      >
                        <span>Edit</span>
                      </button>
                      {page === "my_account" && addresses.length !== 1 && (
                        <button
                          name="Delete Address"
                          onClick={() => setOpenDeleteModal(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-50 transition-colors text-sm font-medium text-gray-700 hover:text-red-600 cursor-pointer"
                          disabled={openDeleteModal}
                        >
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[100px] w-full">
          <div className="text-center text-gray-500 text-sm">
            No addresses found. Please add an address.
          </div>
        </div>
      )}
      {openAddressForm && <AddressForm />}
      {openDeleteModal && <AddressDeleteModal open={openDeleteModal} setOpen={setOpenDeleteModal} selectedAddressId={selectedAddressId} />}
    </div>
  );
}
