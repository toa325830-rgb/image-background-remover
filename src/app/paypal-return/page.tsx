"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

export default function PayPalReturnPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const handlePaymentReturn = async () => {
      const success = searchParams.get("success");
      const subscriptionId = searchParams.get("subscription_id");
      const plan = searchParams.get("plan");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Payment error: ${error}`);
        return;
      }

      if (success === "true" && subscriptionId) {
        // In a real implementation, you would:
        // 1. Call your backend to verify the payment with PayPal API
        // 2. Update the user's subscription in your database
        // 3. Grant the appropriate credits
        
        setStatus("success");
        setMessage(`Payment successful! Subscription ID: ${subscriptionId}. Your credits have been updated.`);
      } else {
        setStatus("error");
        setMessage("Invalid payment response");
      }
    };

    handlePaymentReturn();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
            <p className="text-slate-400">Please wait while we confirm your payment with PayPal.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            <a
              href="/profile"
              className="inline-block px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors"
            >
              View My Account
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            <a
              href="/pricing"
              className="inline-block px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
            >
              Try Again
            </a>
          </>
        )}
      </main>
    </div>
  );
}
