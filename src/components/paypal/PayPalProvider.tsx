"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "AQvQq8efilVw-b7yDpCxVfXS3vaITpFJaJwmjd2-7fi_W3g4x0AAVjnNWKD72XS3JVQdcEWCQY37ry_B";

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": PAYPAL_CLIENT_ID,
        "currency": "USD",
        "intent": "subscription",
        "vault": true,
        "data-page-type": "pricing",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
