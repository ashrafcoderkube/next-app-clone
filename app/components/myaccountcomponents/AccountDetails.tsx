"use client";
import React from "react";
import { useFormik } from "formik";
import LoadingButton from "../customcomponents/LoadingButton";
import CustomInput from "../customcomponents/CustomInput";
import { useTheme } from "../../contexts/ThemeContext";
import { AccountDetailsSchema } from "../../utils/validation";
import { updateCustomerDetails } from "@/app/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";
import { toast } from "react-toastify";

const AccountDetails = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state: RootState) => state.auth);
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);
  const themeContext = useTheme() || {};

  const formik = useFormik({
    initialValues: {
      firstname: user?.customer?.firstname || "",
      lastname: user?.customer?.lastname || "",
    },
    validationSchema: AccountDetailsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
     try {
      const result = await dispatch(updateCustomerDetails(values)).unwrap();
      toast.success( result?.message || "Account details updated successfully");
     } catch (error: any) {
      toast.error(error?.message || "Failed to update account details");
     }
    },
  });

  return (
    <div className="w-full text-start mt21">
      {themeId !== 3 && themeId !== 4 && themeId !== 5 && (
        <>
          <div
            className="my-account-container flex justify-between w-full items-center "
            style={themeId === 2 ? { marginBottom: 20 } : {}}
          >
            <h3 className="text-2xl font-bold">Update Account Details</h3>
          </div>
          <hr className="my-account-container-hr" />
        </>
      )}
      <form onSubmit={formik.handleSubmit} className="account-box">
        <>
          {(themeId === 3 || themeId === 4 || themeId === 5) && (
            <>
              <div className="my-account-container flex justify-between w-full items-center mb-5">
                <h3 className="text-2xl font-bold">Update Account Details</h3>
              </div>
              {/* <hr className="my-account-container-hr" /> */}
            </>
          )}
          <div className="mb-6">
            <CustomInput
              id="firstname"
              label="First Name"
              placeholder="Enter your first name"
              value={formik.values.firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue("firstname", e.target.value.trimStart());
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.firstname && formik.errors.firstname}
            />
          </div>

          <div className="mb-6">
            <CustomInput
              id="lastname"
              label="Last Name"
              placeholder="Enter your last name"
              value={formik.values.lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue("lastname", e.target.value.trimStart());
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.lastname && formik.errors.lastname}
            />
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            text="Update Details"
            fullWidth={themeId === 2 ? true : false}
            disabled={!formik.dirty || loading}
            backgroundColor={themeContext?.buttonBackgroundColor}
            textColor={themeContext?.buttonTextColor}
            borderColor={themeContext?.buttonBorderColor}
          />
        </>
      </form>
    </div>
  );
};

export default AccountDetails;
