"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalButtonProps {
  plan: "personal" | "pro" | "team";
  type: "subscription";
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

interface OneTimeButtonProps {
  amount: string;
  credits: number;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

const PLAN_CONFIG = {
  personal: {
    name: "个人版",
    price: "9.90",
    monthlyCredits: 100,
    paypalPlanId: "P-P2DCJ3K7KNFML-4KQ9Q6TK5K3E", // Replace with actual PayPal plan ID
  },
  pro: {
    name: "专业版",
    price: "39.00",
    monthlyCredits: 300,
    paypalPlanId: "P-P2DCJ3K7KNFML-4KQ9Q6TK5K3E", // Replace with actual PayPal plan ID
  },
  team: {
    name: "团队版",
    price: "99.00",
    monthlyCredits: 500,
    paypalPlanId: "P-P2DCJ3K7KNFML-4KQ9Q6TK5K3E", // Replace with actual PayPal plan ID
  },
};

export function SubscriptionButton({ plan, onSuccess, onError }: PayPalButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false);
  const config = PLAN_CONFIG[plan];

  if (isPending) {
    return <div className="w-full py-3 bg-slate-700 rounded-xl animate-pulse h-12" />;
  }

  if (isRejected) {
    return (
      <div className="text-red-400 text-sm text-center py-2">
        PayPal 加载失败，请刷新页面重试
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "subscribe",
        }}
        disabled={loading}
        createSubscription={async (data, actions) => {
          setLoading(true);
          try {
            const subscription = await actions.subscription.create({
              plan_id: config.paypalPlanId,
              application_context: {
                brand_name: "Image Background Remover",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
              },
            });
            return subscription.subscriptionId;
          } catch (error: any) {
            console.error("Subscription error:", error);
            onError?.(error.message || "订阅创建失败");
            throw error;
          } finally {
            setLoading(false);
          }
        }}
        onApprove={async (data, actions) => {
          // Subscription approved
          console.log("Subscription approved:", data.subscriptionID);
          onSuccess?.();
          alert(`订阅成功！您的 ${config.name} 已开通，额度已刷新。`);
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          onError?.("支付失败，请重试");
        }}
        onCancel={() => {
          console.log("Subscription cancelled");
        }}
      />
    </div>
  );
}

export function OneTimePaymentButton({ amount, credits, onSuccess, onError }: OneTimeButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return <div className="w-full py-3 bg-slate-700 rounded-xl animate-pulse h-12" />;
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        }}
        createOrder={async (data, actions) => {
          try {
            const order = await actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: `${credits} Credits - Image Background Remover`,
                  amount: {
                    currency_code: "USD",
                    value: amount,
                  },
                },
              ],
            });
            return order;
          } catch (error: any) {
            console.error("Order creation error:", error);
            onError?.(error.message || "订单创建失败");
            throw error;
          }
        }}
        onApprove={async (data, actions) => {
          try {
            await actions.order?.capture();
            console.log("Order captured:", data.orderID);
            onSuccess?.();
            alert(`支付成功！${credits} 积分已添加到您的账户。`);
          } catch (error: any) {
            console.error("Capture error:", error);
            onError?.("支付确认失败");
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          onError?.("支付失败，请重试");
        }}
        onCancel={() => {
          console.log("Order cancelled");
        }}
      />
    </div>
  );
}

// Credit packages for one-time purchase
export const CREDIT_PACKAGES = [
  { credits: 10, price: "5.00", label: "10 Credits" },
  { credits: 50, price: "20.00", label: "50 Credits" },
  { credits: 100, price: "35.00", label: "100 Credits" },
];
