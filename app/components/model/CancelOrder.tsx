import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { cancelOrder } from "../../redux/slices/customerOrdersSlice";
import { CancelOrderSchema } from "../../utils/validation";
import LoadingButton from "../customcomponents/LoadingButton";
import { useTheme } from "../../contexts/ThemeContext";

const cancelReasons = [
  { value: "", label: "Select Reason" },
  { value: "Ordered by Mistake", label: "Ordered by Mistake" },
  { value: "Found Cheaper Elsewhere", label: "Found Cheaper Elsewhere" },
  { value: "Delivery Time is Too Long", label: "Delivery Time is Too Long" },
  { value: "Changed My Mind", label: "Changed My Mind" },
  {
    value: "Product Details Are Incorrect",
    label: "Product Details Are Incorrect",
  },
  { value: "Payment Issue", label: "Payment Issue" },
  { value: "Quantity Issue", label: "Quantity Issue" },
  { value: "Not Needed Anymore", label: "Not Needed Anymore" },
  { value: "Other", label: "Other" },
];

interface CancelOrderProps {
  open: boolean;
  onClose: () => void;
  orderId: string | number | null;
  closeCancelModel: () => void;
}

const CancelOrder = ({ open, onClose, orderId, closeCancelModel }: CancelOrderProps) => {
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.customerOrders);
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;

  const formik = useFormik({
    initialValues: {
      reject_reason_select: "",
      reject_reason_input: "",
    },
    validationSchema: CancelOrderSchema,
    onSubmit: (values: any) => {
      const payload = {
        order_id: orderId,
        cancelled_reason: values.reject_reason_select,
      };
      if (values.reject_reason_input?.trim()) {
        (payload as any).reject_reason_input = values.reject_reason_input.trim();
      }
      dispatch(cancelOrder(payload));
      onClose();
      formik.resetForm();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="p-6 rounded-lg shadow-lg w-[90%] sm:w-[600px] "
        style={{
          color: textColor,
          backgroundColor: themeContext?.backgroundColor,
          border: `1px solid ${textColor}`,
        }}
      >
        <h2 className="font-semibold mb-4 text-3xl">Cancel Order</h2>

        <form onSubmit={formik.handleSubmit}>
          <div className="relative mb-6">
            <label
              htmlFor="rejectReasonSelectNew"
              className="block text-sm font-medium mb-1 text-start"
            >
              Select a reason
            </label>
            <div className="relative">
              <select
                id="rejectReasonSelectNew"
                name="reject_reason_select"
                value={formik.values.reject_reason_select}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  formik.setFieldValue("reject_reason_select", e.target.value)
                }
                onBlur={formik.handleBlur}
                className={`w-full border p-[0.82rem] focus:outline-none border-[#AAAAAA] form-control appearance-none pr-10`}
                style={{
                  color: textColor,
                  backgroundColor: themeContext?.backgroundColor,
                  borderColor: "#AAAAAA",
                  backgroundImage: "none",
                }}
              >
                {cancelReasons.map((opt, index) => (
                  <option
                    key={index}
                    value={opt.value}
                    style={{
                      color: textColor,
                      backgroundColor: themeContext?.backgroundColor,
                    }}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5.75 8.75L10 13.25L14.25 8.75"
                    stroke={textColor || "#111"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            {formik.touched.reject_reason_select &&
              formik.errors.reject_reason_select && (
                <p className="text-red-500 text-sm mb-0 absolute">
                  {formik.errors.reject_reason_select as string}
                </p>
              )}
          </div>

          {formik.values.reject_reason_select === "Other" && (
            <div className="relative">
              <label
                htmlFor="reject_reason_input"
                className="block text-sm font-medium mb-1 text-start"
              >
                Please specify
              </label>
              <textarea
                id="reject_reason_input"
                name="reject_reason_input"
                rows={3}
                placeholder="Please specify your reason..."
                value={formik.values.reject_reason_input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  formik.setFieldValue("reject_reason_input", e.target.value)
                }
                onBlur={formik.handleBlur}
                className="w-full border px-3 py-2 rounded-md mb-0 focus:outline-none border-[#AAAAAA]"
                style={{
                  color: textColor,
                  backgroundColor: themeContext?.backgroundColor,
                  borderColor: "#AAAAAA",
                }}
              />
              {formik.touched.reject_reason_input &&
                formik.errors.reject_reason_input && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.reject_reason_input as string}
                  </p>
                )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                closeCancelModel();
                formik.resetForm();
              }}
              className="cursor-pointer inline-flex justify-center rounded-md border !px-4 !py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: themeContext?.buttonBackgroundColor,
                color: themeContext?.buttonTextColor,
                borderColor: themeContext?.buttonBorderColor,
              }}
            >
              Close
            </button>
            <div>
              <LoadingButton
                type="submit"
                loading={loading}
                text="Confirm"
                fullWidth={false}
                className="cursor-pointer inline-flex justify-center rounded-md !bg-red-500 !px-4 !py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrder;
