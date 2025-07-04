import React, { createContext, useContext, useState } from "react";

const CheckoutContext = createContext();

export function CheckoutProvider({ children }) {
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {},
    paymentMethod: "",
    order: null, // for confirmation
  });

  return (
    <CheckoutContext.Provider value={{ checkoutData, setCheckoutData }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  return useContext(CheckoutContext);
}
