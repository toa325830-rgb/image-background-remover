"use client";

import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  onSuccess?: (orderID: string) => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: "USD",
          intent: "capture",
        }}
      >
        <PayPalButtons
          fundingSource={FUNDING.PAYPAL}
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 50,
          }}
          createOrder={async (_data, actions) => {
            try {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
              });

              if (!response.ok) {
                throw new Error("Failed to create order");
              }

              const { orderID } = await response.json();
              return orderID;
            } catch (error) {
              console.error("Create order error:", error);
              setErrorMessage("创建订单失败，请重试");
              throw error;
            }
          }}
          onApprove={async (_data, actions) => {
            try {
              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: _data.orderID }),
              });

              if (!response.ok) {
                throw new Error("Failed to capture order");
              }

              const { capture } = await response.json();
              console.log("Payment captured:", capture);
              onSuccess?.(capture.id);
            } catch (error) {
              console.error("Capture error:", error);
              setErrorMessage("支付失败，请重试");
              onError?.("Payment capture failed");
            }
          }}
          onError={(error) => {
            console.error("PayPal button error:", error);
            setErrorMessage("支付过程中出错");
            onError?.(String(error));
          }}
        />
      </PayPalScriptProvider>

      {errorMessage && (
        <p className="mt-3 text-red-400 text-sm text-center">{errorMessage}</p>
      )}
    </div>
  );
}
