"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { useAppDispatch } from "@/app/redux/hooks";
import { deleteShippingAddress } from "@/app/redux/slices/shippingAddressSlice";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function AddressDeleteModal({ open, setOpen, selectedAddressId }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedAddressId: number;
}) {
  const dispatch = useAppDispatch();
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;

  const handleConfirm = () => {
    try {
      setOpen(false);
      dispatch(deleteShippingAddress(selectedAddressId));
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
        />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl text-left shadow-xl transition-all sm:w-full sm:max-w-md data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
            style={{
              color: textColor,
              backgroundColor: themeContext?.backgroundColor,
              border: `1px solid ${textColor}`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="text-red-500" size={28} />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold"
                  style={{
                    color: textColor,
                  }}
                >
                  Confirm Delete
                </DialogTitle>
              </div>

              <div className="mt-4">
                <p
                  className="text-sm"
                  style={{
                    color: textColor,
                  }}
                >
                  Are you sure you want to delete this address?
                </p>
              </div>
            </div>

            <div className="px-6 py-3 flex justify-end gap-3">
              <button
                onClick={handleConfirm}
                className="cursor-pointer inline-flex justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
