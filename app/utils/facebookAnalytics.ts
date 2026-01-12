import store from "../redux/store";
import { sendConversionEvent } from "../service/api";
// eslint-disable-next-line no-unused-vars
export const buildUserData = (user: any = null) => {
  const baseData = {
    // These are *always* safe to send (no PII)
    clientUserAgent: navigator.userAgent,
    fbp: getCookie("_fbp"), // Facebook browser pixel ID
    fbc: getCookie("_fbc"), // Click ID (if from ad)
    // clientIpAddress: undefined  ← let backend fill it
  };

  // If we have a logged-in user → enrich with known info
  if (user) {
    return {
      ...baseData,
      // email: user.email?.toLowerCase().trim(),
      phone: user.mobile_number?.replace(/\D/g, ""), // remove non-digits
      firstName: user.firstname?.trim(),
      lastName: user.lastname?.trim(),
      // city: user.city?.trim(),
      // state: user.state?.trim(),
      zipCode: user.pincode?.trim(),
      country: "India",
    };
  }

  // Anonymous → only send non-PII
  return baseData;
};

export const sendEvent = async (eventName, productData) => {
  try {
    const user = store.getState().auth.user;

    const userData = buildUserData(user?.customer);

    // Remove undefined values
    Object.keys(userData).forEach((key) => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });

    // Prepare custom data means product price and currency
    const customData = {
      value: productData?.final_price,
      currency: productData?.currency || "INR",
    };

    const eventData = {
      eventName: eventName,
      //   eventId: formData.eventId || undefined,
      userData,
      customData,
      eventSourceUrl: window.location.href,
      actionSource: "website",
      // apikey: import.meta.env.VITE_API_KEY,
    };
    await sendConversionEvent(eventData);
  } catch (error) {
    console.error("error", error);
  }
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return undefined;
}

/**
 *
 * @param {string} eventName
 * @returns {string}
 * @description This function returns the event name
 * @example
 * const eventName = "Purchase";
 * const eventName = "AddToCart";
 * const eventName = "InitiateCheckout";
 * const eventName = "Lead";
 */

// "Purchase"
// "AddToCart"
// "InitiateCheckout"
// "Lead"
// "CompleteRegistration"
// "ViewContent"
// "Search"
// "AddPaymentInfo"
