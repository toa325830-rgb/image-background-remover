"use client";

import { useState } from "react";
import PayPalButton from "@/components/PayPalButton";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    credits: 10,
    price: "4.99",
    description: "适合轻度使用",
    features: ["10 Credits", "单张处理", "支持 JPG/PNG/WebP", "下载高清图片"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 50,
    price: "19.99",
    description: "适合常规使用",
    features: ["50 Credits", "批量处理", "支持 JPG/PNG/WebP", "优先处理队列", "下载高清图片"],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    credits: 200,
    price: "49.99",
    description: "适合高频使用",
    features: ["200 Credits", "无限批量处理", "支持 JPG/PNG/WebP", "最高优先级", "下载高清图片"],
    popular: false,
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = (orderID: string) => {
    console.log("Payment successful, orderID:", orderID);
    setPaymentSuccess(true);
    setSelectedPlan(null);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">支付成功！</h1>
          <p className="text-slate-400 mb-8">Credits 已充值到您的账户</p>
          <a
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            开始使用
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="py-12 px-4 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          选择您的套餐
        </h1>
        <p className="mt-3 text-slate-400 text-lg">解锁更多 Credits，随时使用</p>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-8 transition-all duration-300
                ${plan.popular
                  ? "bg-gradient-to-b from-blue-500/20 to-purple-500/10 border-2 border-blue-500/50 scale-105"
                  : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-sm font-medium">
                  最受欢迎
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-4xl font-bold">${plan.price}</span>
                <p className="text-slate-400 mt-1">{plan.credits} Credits</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.id ? (
                <div className="space-y-4">
                  <PayPalButton
                    amount={plan.price}
                    onSuccess={handlePaymentSuccess}
                    onError={(err) => console.error(err)}
                  />
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`
                    w-full py-3 rounded-xl font-medium transition-all duration-200
                    ${plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                      : "bg-slate-700 hover:bg-slate-600"
                    }
                  `}
                >
                  选择套餐
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-sm mt-12">
          💳 支持 PayPal / 信用卡 支付 · 🔒 安全加密 · ⚡ 即时到账
        </p>
      </main>
    </div>
  );
}
