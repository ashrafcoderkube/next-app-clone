"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  postShippingAddress,
  getShippingAddress,
  setOpenAddressForm,
  setSelectedAddressForEdit,
  getstateandcity,
  clearStateAndCity,
} from "../redux/slices/shippingAddressSlice";
import { UpdateAddressSchema } from "../utils/validation";
import LoadingButton from "./customcomponents/LoadingButton";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { fetchCities, fetchStates } from "../redux/slices/addressSlice";
import { X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import CustomInput from "./customcomponents/CustomInput";
import { RootState } from "../redux/store";

const AddressForm = () => {
  const dispatch = useAppDispatch();
  const [selectedState, setSelectedState] = useState(null);
  const [initialStateSet, setInitialStateSet] = useState(false);
  const { states, cities } = useAppSelector((state: RootState) => state.address);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { selectedAddressForEdit, stateandcity, shippingAddress } = useAppSelector((state: RootState) => state.shippingAddress);
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor, textColor } = themeContext;
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);

  const addresses = useMemo(() => {
    return Array.isArray(shippingAddress) ? shippingAddress : [];
  }, [shippingAddress]);

  useEffect(() => {
    dispatch(getShippingAddress());
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (selectedState?.value) {
      dispatch(fetchCities({ state_id: selectedState.value }));
    }
  }, [dispatch, selectedState]);

  const stateOptions = (states || []).map((state: any) => ({
    value: state.id,
    label: state.name,
  }));

  const cityOptions =
    selectedState?.label && Array.isArray(cities[selectedState.label])
      ? cities[selectedState.label].map((city: any) => ({
        value: city,
        label: city,
      }))
      : [];

  const formik = useFormik({
    initialValues: {
      firstname: selectedAddressForEdit?.firstname || "",
      lastname: selectedAddressForEdit?.lastname || "",
      email: selectedAddressForEdit?.email || "",
      phone_number: selectedAddressForEdit?.phone_number || "",
      alt_phone_number: selectedAddressForEdit?.alt_phone_number || "",
      address: selectedAddressForEdit?.address || "",
      pincode: selectedAddressForEdit?.pincode || "",
      city: selectedAddressForEdit?.city || "",
      state: selectedAddressForEdit?.state || "",
      address_type: selectedAddressForEdit?.address_type || "home",
      is_default:
        selectedAddressForEdit?.is_default === 1 || addresses.length === 0
          ? 1
          : 0,
    },
    validationSchema: UpdateAddressSchema,
    enableReinitialize: true,

    onSubmit: async (values) => {
      try {
        await dispatch(
          postShippingAddress({
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            phone_number: user?.customer && user?.customer?.mobile_number
              ? user?.customer?.mobile_number
              : values.phone_number,
            alt_phone_number: values.alt_phone_number,
            address: values.address,
            pincode: values.pincode,
            city: values.city,
            state: values.state,
            address_type: values.address_type.toLowerCase(),
            is_default: values.is_default ===1 ? true : false,
            id: selectedAddressForEdit?.id,
          })
        ).unwrap();
        // Close dialog on successful submission
        formik.resetForm();
        dispatch(setOpenAddressForm(false));
        dispatch(setSelectedAddressForEdit(null));
        dispatch(clearStateAndCity());
        setInitialStateSet(false);
        setSelectedState(null);
      } catch (error) {
        // Error is already handled by the thunk with toast
        console.error("Failed to save address:", error);
      }
    },
  });

  // Handle pincode input and fetch state/city
  useEffect(() => {
    const pincode = formik.values.pincode;
    // Only call API if pincode is exactly 6 digits and not in edit mode (or if it changed)
    if (pincode && pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      // Don't call if we're editing and the pincode hasn't changed
      const shouldFetch =
        !selectedAddressForEdit || selectedAddressForEdit.pincode !== pincode;

      if (shouldFetch) {
        dispatch(getstateandcity(pincode));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.pincode, dispatch]);

  // Auto-fill state and city when API returns data
  useEffect(() => {
    if (stateandcity && stateOptions.length > 0) {
      const { state, city } = stateandcity;

      if (state?.name) {
        // Find matching state in stateOptions by state.id or state.name
        const matchedState = stateOptions.find(
          (opt: any) =>
            opt.value === state.id ||
            opt.label.toLowerCase() === state.name.toLowerCase()
        );

        if (
          matchedState &&
          (!selectedState || selectedState.value !== matchedState.value)
        ) {
          setSelectedState(matchedState);
          formik.setFieldValue("state", matchedState.label);

          // Fetch cities for the matched state
          dispatch(fetchCities({ state_id: matchedState.value }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateandcity, stateOptions, dispatch]);

  // Set city after cities are loaded for the selected state
  useEffect(() => {
    if (
      stateandcity?.city?.name &&
      selectedState?.label &&
      cities[selectedState.label]
    ) {
      const cityList = cities[selectedState.label];
      const apiCity = stateandcity.city.name;

      // Check if the city from API exists in the cities list
      const cityExists = cityList.some(
        (city: any) => city.toLowerCase() === apiCity.toLowerCase()
      );

      if (cityExists && formik.values.city !== apiCity) {
        formik.setFieldValue("city", apiCity);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, selectedState, stateandcity]);

  // Initialize state when editing an address
  useEffect(() => {
    if (
      !initialStateSet &&
      selectedAddressForEdit?.state &&
      stateOptions.length > 0
    ) {
      const selected = stateOptions.find(
        (opt: any) =>
          opt.label === selectedAddressForEdit.state ||
          opt.value === selectedAddressForEdit.state
      );
      if (selected) {
        setSelectedState(selected);
        dispatch(fetchCities({ state_id: selected.value }));
        formik.setFieldValue("state", selected.label);
        setInitialStateSet(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateOptions, initialStateSet, selectedAddressForEdit]);

  const handleClose = () => {
    dispatch(setOpenAddressForm(false));
    dispatch(setSelectedAddressForEdit(null));
    dispatch(clearStateAndCity());
    setInitialStateSet(false);
    setSelectedState(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      style={{ zIndex: 1000 }}
      onClick={handleOverlayClick}
    >
      <div
        className={`address-form-container shadow-xl max-w-2xl w-full sm:max-h-[90dvh] max-h-[100dvh] overflow-y-auto scroll-bar ${themeId === 5 ? "border-radius-xl" : "rounded-lg"
          }`}
        style={{
          backgroundColor: themeContext?.bottomFooterBackgroundColor || "#ffffff",
          color: bottomFooterTextColor,
          border: `1px solid ${bottomFooterTextColor}`,
        }}
      >
        <div
          className="sticky top-0 border-b border-gray-200/40 px-6 py-4 flex justify-between items-center z-10"
          style={{
            backgroundColor: themeContext?.bottomFooterBackgroundColor || "#ffffff",
            color: bottomFooterTextColor,
          }}
        >
          <h3 className="text-2xl font-bold">
            {selectedAddressForEdit ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            name="Close Address Form"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            type="button"
            style={{ color: themeContext?.buttonBackgroundColor || "#111111" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={formik.handleSubmit}>
            <>
              {/* First Name and Last Name */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <CustomInput
                    id="firstname"
                    label="First Name"
                    placeholder="Enter your first name"
                    value={formik.values.firstname}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "firstname",
                        e.target.value.trimStart()
                      );
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.firstname && formik.errors.firstname
                        ? formik.errors.firstname as string
                        : undefined
                    }
                    inputClassName="border-[#AAAAAA] form-control"
                  />
                </div>

                <div className="w-full sm:w-1/2 sm:pl-3">
                  <CustomInput
                    id="lastname"
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={formik.values.lastname}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "lastname",
                        e.target.value.trimStart()
                      );
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.lastname && formik.errors.lastname
                        ? formik.errors.lastname as string
                        : undefined
                    }
                    inputClassName="border-[#AAAAAA] form-control"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <CustomInput
                  id="email"
                  label="Email Address (Optional)"
                  placeholder="Enter your email address"
                  value={formik.values.email || ""}
                  onChange={(e) => {
                    formik.setFieldValue("email", e.target.value.trimStart());
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email && formik.errors.email
                      ? formik.errors.email as string
                      : undefined
                  }
                  inputClassName="border-[#AAAAAA] form-control"
                />
              </div>

              {/* Phone Number and Alt Phone Number */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <CustomInput
                    id="phone_number"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={
                      user?.customer?.mobile_number
                        ? user?.customer?.mobile_number
                        : formik.values.phone_number
                    }
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue(
                        "phone_number",
                        numericValue.trimStart()
                      );
                    }}
                    onBlur={formik.handleBlur}
                    disabled={user?.customer && user?.customer?.mobile_number}
                    error={
                      formik.touched.phone_number && formik.errors.phone_number
                        ? formik.errors.phone_number as string
                        : undefined
                    }
                    inputClassName={`border-[#AAAAAA] form-control ${user?.customer && user?.customer?.mobile_number
                        ? "!bg-${themeContext?.bottomFooterBackgroundColor}"
                        : ""
                      }`}
                  />
                </div>

                <div className="w-full sm:w-1/2 sm:pl-3">
                  <CustomInput
                    id="alt_phone_number"
                    label="Alt Phone Number (Optional)"
                    placeholder="Enter alternate phone number"
                    value={formik.values.alt_phone_number}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue(
                        "alt_phone_number",
                        numericValue.trimStart()
                      );
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.alt_phone_number &&
                        formik.errors.alt_phone_number
                        ? formik.errors.alt_phone_number as string
                        : undefined
                    }
                    inputClassName="border-[#AAAAAA] form-control"
                  />
                </div>
              </div>

              <div className="mb-6">
                <CustomInput
                  id="address"
                  label="Address"
                  placeholder="Enter your address"
                  value={formik.values.address}
                  onChange={(e) => {
                    formik.setFieldValue("address", e.target.value.trimStart());
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address && formik.errors.address
                      ? formik.errors.address as string
                      : undefined
                  }
                  inputClassName="border-[#AAAAAA] form-control"
                />
              </div>

              <div className="mb-6">
                <CustomInput
                  id="pincode"
                  label="Zip Code"
                  placeholder="Enter your zipcode"
                  value={formik.values.pincode}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    formik.setFieldValue("pincode", numericValue.trimStart());
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.pincode && formik.errors.pincode
                      ? formik.errors.pincode as string
                      : undefined
                  }
                  inputClassName="border-[#AAAAAA] form-control"
                />
              </div>

              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* State Select */}
                <div className="w-full sm:w-1/2 relative">
                  <label
                    className="block mb-2.5 font-bold form-lable"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <Select
                    id="state"
                    name="state"
                    className="w-full"
                    classNamePrefix="react-select"
                    options={stateOptions}
                    value={
                      stateOptions.find(
                        (option: any) => option.label === formik.values.state
                      ) || null
                    }
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                    menuPosition="fixed"
                    placeholder="Select State"
                    isDisabled={formik.values.pincode}
                    onChange={(selectedOption: any) => {
                      formik.setFieldValue(
                        "state",
                        selectedOption?.label || ""
                      );
                      setSelectedState(selectedOption);
                    }}
                    classNames={{
                      menuList: () => "scroll-bar",
                    }}
                    styles={{
                      control: (provided: any, state: any) => ({
                        ...provided,
                        borderRadius: "0.5rem",
                        borderColor: "#AAAAAA",
                        padding: "0.24rem",
                        paddingLeft: "11.152px",
                        boxShadow: "none",
                        minHeight: "auto",
                        "&:hover": {
                          borderColor: "#AAAAAA",
                        },
                        ...(state.isFocused && {
                          borderColor: "#AAAAAA",
                          outline: "none",
                        }),
                        color: textColor,
                        backgroundColor: themeContext?.backgroundColor,
                      }),
                      singleValue: (provided: any) => ({
                        ...provided,
                        color: textColor,
                      }),
                      valueContainer: (provided: any) => ({
                        ...provided,
                        padding: 0,
                      }),
                      input: (provided: any) => ({
                        ...provided,
                        margin: 0,
                        padding: 0,
                        color: textColor,
                      }),
                      placeholder: (provided: any) => ({
                        ...provided,
                        color: textColor,
                        opacity: 0.5,
                      }),
                      menuPortal: (provided: any) => ({
                        ...provided,
                        zIndex: 10000,
                      }),
                      menu: (provided: any) => ({
                        ...provided,
                        zIndex: 10000,
                        backgroundColor: themeContext?.backgroundColor,
                      }),
                      option: (provided: any, state: any) => ({
                        ...provided,
                        padding: 10,
                        color: state.isSelected
                          ? themeContext?.backgroundColor
                          : textColor,
                        backgroundColor: state.isSelected
                          ? textColor
                          : state.isFocused
                            ? `${textColor}20`
                            : themeContext?.backgroundColor,
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? textColor
                            : `${textColor}30`,
                        },
                      }),
                    }}
                  />
                  {formik.submitCount > 0 && formik.errors.state && (
                    <div className="text-red-500 text-sm absolute">
                      {formik.errors.state as string}
                    </div>
                  )}
                </div>

                {/* City Select */}
                <div className="w-full sm:w-1/2 sm:pl-3 relative">
                  <label
                    className="block mb-2.5 font-bold form-lable"
                    htmlFor="city"
                  >
                    City
                  </label>
                  <CreatableSelect
                    id="city"
                    name="city"
                    className="w-full"
                    classNamePrefix="react-select"
                    options={cityOptions}
                    value={
                      cityOptions.find(
                        (option: any) => option.value === formik.values.city
                      ) ||
                      (formik.values.city
                        ? {
                          value: formik.values.city,
                          label: formik.values.city,
                        }
                        : null)
                    }
                    isDisabled={!formik.values.state}
                    isSearchable={true}
                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                    menuPosition="fixed"
                    placeholder="Select or type city name"
                    onChange={(selectedOption: any) =>
                      formik.setFieldValue("city", selectedOption?.value || "")
                    }
                    onCreateOption={(inputValue: string) => {
                      formik.setFieldValue("city", inputValue);
                    }}
                    classNames={{
                      menuList: () => "scroll-bar",
                    }}
                    styles={{
                      control: (provided: any, state: any) => ({
                        ...provided,
                        borderRadius: "0.5rem",
                        borderColor: "#AAAAAA",
                        padding: "0.24rem",
                        paddingLeft: "11.152px",
                        boxShadow: "none",
                        minHeight: "auto",
                        "&:hover": { borderColor: "#AAAAAA" },
                        ...(state.isFocused && {
                          borderColor: "#AAAAAA",
                          outline: "none",
                        }),
                        color: textColor,
                        backgroundColor: themeContext?.backgroundColor,
                      }),
                      singleValue: (provided: any) => ({
                        ...provided,
                        color: textColor,
                      }),
                      valueContainer: (provided: any) => ({
                        ...provided,
                        padding: 0,
                      }),
                      input: (provided: any) => ({
                        ...provided,
                        margin: 0,
                        padding: 0,
                        color: textColor,
                      }),
                      placeholder: (provided: any) => ({
                        ...provided,
                        color: textColor,
                        opacity: 0.5,
                      }),
                      menuPortal: (provided: any) => ({
                        ...provided,
                        zIndex: 10000,
                      }),
                      menu: (provided: any) => ({
                        ...provided,
                        zIndex: 10000,
                        backgroundColor: themeContext?.backgroundColor,
                      }),
                      option: (provided: any, state: any) => ({
                        ...provided,
                        padding: 10,
                        color: state.isSelected
                          ? themeContext?.backgroundColor
                          : textColor,
                        backgroundColor: state.isSelected
                          ? textColor
                          : state.isFocused
                            ? `${textColor}20`
                            : themeContext?.backgroundColor,
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? textColor
                            : `${textColor}30`,
                        },
                      }),
                    }}
                  />
                  {formik.submitCount > 0 && formik.errors.city && (
                    <div className="text-red-500 text-sm absolute">
                      {formik.errors.city as string}
                    </div>
                  )}
                </div>
              </div>

              {/* Address Type */}
              <div className="mb-6 relative">
                <label
                  className="block mb-2.5 font-bold form-lable"
                  htmlFor="addressType"
                >
                  Address Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="address_type"
                      value="home"
                      checked={formik.values.address_type === "home"}
                      onChange={() =>
                        formik.setFieldValue("address_type", "home")
                      }
                      className="mr-2 w-4 h-4"
                    />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="address_type"
                      value="work"
                      checked={formik.values.address_type === "work"}
                      onChange={() =>
                        formik.setFieldValue("address_type", "work")
                      }
                      className="mr-2 w-4 h-4"
                    />
                    <span>Work</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="address_type"
                      value="other"
                      checked={formik.values.address_type === "other"}
                      onChange={() =>
                        formik.setFieldValue("address_type", "other")
                      }
                      className="mr-2 w-4 h-4"
                    />
                    <span>Other</span>
                  </label>
                </div>
                {formik.touched.address_type && formik.errors.address_type && (
                  <div className="text-red-500 text-sm absolute">
                    {formik.errors.address_type as string}
                  </div>
                )}
              </div>

              {/* Set as Default Address */}
              {!selectedAddressForEdit?.is_default && (
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <label className="font-bold form-lable" htmlFor="isDefault">
                      Set as Default Address
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Make this your primary delivery address
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="is_default"
                      name="is_default"
                      checked={formik.values.is_default === 1 ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue("is_default", e.target.checked ? 1 : 0)
                      }
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[none] peer-focus:ring-offset-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor: formik.values.is_default === 1
                          ? themeContext?.buttonBackgroundColor || "#111111"
                          : `${themeContext?.buttonBackgroundColor || "#111111"}80`,
                      }}
                    ></div>
                  </label>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <LoadingButton
                  type="submit"
                  text="Save Address"
                  fullWidth={false}
                  className="w-1/2 max-md:w-full"
                  disabled={!formik.dirty || formik.isSubmitting}
                  backgroundColor={themeContext?.buttonBackgroundColor}
                  textColor={themeContext?.buttonTextColor}
                  borderColor={themeContext?.buttonBorderColor}
                />
                <button
                  name="Cancel Address Form"
                  type="button"
                  onClick={handleClose}
                  className="w-1/2 max-md:w-full btn bg-transparent px-6 py-2 border border-[#E53935] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                    color: "#E53935",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
