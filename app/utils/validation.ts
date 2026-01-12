import * as Yup from "yup";

export const emailSchema = Yup.string()
  .required("Email is required")
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
    "Must be a valid email address"
  );

const passwordSchema = Yup.string()
  .required("Password is required")
  .min(6, "Password must be at least 6 characters")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Must contain at least one special character"
  );

const nameSchema = Yup.string()
  .required("This field is required")
  .min(2, "Must be at least 2 characters")
  .max(50, "Cannot exceed 50 characters");

const phoneSchema = Yup.string()
  .matches(/^[1-9]\d{9}$/, "Must be a valid 10-digit number")
  .required("Phone number is required");

const pincodeSchema = Yup.string()
  .matches(/^[0-9]{6}$/, "Must be a valid 6-digit pincode")
  .required("Pincode is required");

export const LoginSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required("Password is required"),
});

export const SignupSchema = Yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  // password: passwordSchema,
  phone_number: phoneSchema,
  terms: Yup.boolean().oneOf([true], "Please accept the terms & conditions"),
});

export const ForgotPasswordSchema = Yup.object({
  email: emailSchema,
});

export const ResetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirm_password: passwordSchema.oneOf(
    [Yup.ref("password")],
    "Passwords must match"
  ),
});

export const ContactSchema = Yup.object({
  firstname: nameSchema,
  lastname: nameSchema,
  email: emailSchema,
  phone_number: phoneSchema,
  subject: Yup.string().required("Subject is required"),
  message: Yup.string().required("Message is required"),
  subscribe: Yup.boolean(),
});

export const CheckoutSchema = Yup.object({
  email: emailSchema,
  firstname: nameSchema,
  lastname: nameSchema,
  address: Yup.string().required("Address is required"),
  pincode: pincodeSchema,
  alt_phone_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number")
    .notRequired(),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
});

export const UpdateAddressSchema = Yup.object({
  firstname: nameSchema,
  lastname: nameSchema,
  // email: emailSchema,
  // phone_number: phoneSchema,
  alt_phone_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number")
    .notRequired(),
  address: Yup.string().required("Address is required"),
  pincode: pincodeSchema,
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
});

export const UpdatePasswordSchema = Yup.object({
  old_password: Yup.string().required("Old password is required"),
  new_password: passwordSchema,
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const AccountDetailsSchema = Yup.object({
  firstname: nameSchema,
  lastname: nameSchema,
});

export const SignUpModalSchema = Yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  terms: Yup.boolean().oneOf([true], "Please accept the terms & conditions"),
});

export const CancelOrderSchema = Yup.object({
  reject_reason_select: Yup.string()
    .required("Please select a reason")
    .test(
      "reason-not-empty",
      "Please select a valid reason",
      (value) => value && value.trim() !== ""
    ),
  reject_reason_input: Yup.string().when("reject_reason_select", {
    is: "Other",
    then: (schema) =>
      schema
        .trim()
        .required("Please specify your reason")
        .min(1, "Reason cannot be empty"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});
