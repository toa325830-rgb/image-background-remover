"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import { SubscriptionButton, OneTimePaymentButton, CREDIT_PACKAGES } from "@/components/paypal/PayPalButton";
import Link from "next/link";

const plans = [
  {
    id: "personal" as const,
    name: "个人版",
    price: "9.90",
    unit: "USD/月",
    description: "适合个人日常使用",
    features: [
      "每月 100 张额度",
      "注册送 3 张体验额度",
      "支持 JPG/PNG/WebP",
      "下载高清无水印",
      "Email 支持",
    ],
    notIncluded: [
      "优先队列",
      "批量处理",
    ],
    popular: false,
  },
  {
    id: "pro" as const,
    name: "专业版",
    price: "39.00",
    unit: "USD/月",
    description: "适合专业用户和小型工作室",
    features: [
      "每月 300 张额度",
      "注册送 3 张体验额度",
      "支持 JPG/PNG/WebP",
      "下载高清无水印",
      "优先队列处理",
      "Email 支持",
    ],
    notIncluded: [
      "批量处理",
    ],
    popular: true,
  },
  {
    id: "team" as const,
    name: "团队版",
    price: "99.00",
    unit: "USD/月",
    description: "适合团队和企业用户",
    features: [
      "每月 500 张额度",
      "注册送 3 张体验额度",
      "支持 JPG/PNG/WebP",
      "下载高清无水印",
      "优先队列处理",
      "批量处理支持",
      "专属客服支持",
    ],
    notIncluded: [],
    popular: false,
  },
];

const faqs = [
  {
    q: "额度用完了可以升级吗？",
    a: "可以随时升级，升级后立即生效。当月已使用的额度会按比例计算。",
  },
  {
    q: "额度会过期吗？",
    a: "月度订阅的额度不会累计到下个月，建议在每月月底前使用完。",
  },
  {
    q: "如何取消订阅？",
    a: "可以在 PayPal 中随时取消订阅，取消后下个账单周期不再扣费。",
  },
  {
    q: "支持退款吗？",
    a: "由于服务即开即用，付费后7天内如有任何问题可申请全额退款。",
  },
  {
    q: "处理的图片会保存吗？",
    a: "不会。我们会在处理完成后立即删除您的图片，保护您的隐私。",
  },
  {
    q: "支持的图片格式有哪些？",
    a: "支持 JPG、PNG、WebP 格式，单张图片最大 10MB。",
  },
];

type TabType = "subscription" | "credits";

export default function PricingPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("subscription");
  const [payingPlan, setPayingPlan] = useState<string | null>(null);

  const handlePaymentSuccess = () => {
    setPayingPlan(null);
    alert("支付成功！您的额度已更新。");
    // Refresh credits here if needed
  };

  const handlePaymentError = (err: string) => {
    setPayingPlan(null);
    alert(err);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple & <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Pay securely with PayPal.
          </p>
        </div>

        {/* Sandbox Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center mb-8 max-w-2xl mx-auto">
          <p className="text-yellow-400 text-sm">
            🧪 <strong>Sandbox Mode:</strong> Currently testing in PayPal sandbox. Use PayPal sandbox accounts for testing.
          </p>
        </div>

        {/* Payment Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab("subscription")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "subscription"
                  ? "bg-purple-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Subscription
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "credits"
                  ? "bg-purple-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Buy Credits
            </button>
          </div>
        </div>

        {activeTab === "subscription" ? (
          /* Subscription Plans */
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`
                    relative rounded-2xl p-6 transition-all duration-300
                    ${plan.popular
                      ? "bg-gradient-to-b from-purple-900/50 to-slate-800 border-2 border-purple-500 scale-105 shadow-xl shadow-purple-500/20"
                      : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                    }
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-slate-400 ml-1">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!user ? (
                    <div className="text-center text-slate-400 text-sm py-2">
                      Please login to subscribe
                    </div>
                  ) : (
                    <div onClick={() => setPayingPlan(plan.id)}>
                      <SubscriptionButton
                        plan={plan.id}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Free Credits Banner */}
            <div className="bg-slate-800/50 rounded-2xl p-8 text-center mb-20 max-w-2xl mx-auto">
              <div className="text-4xl mb-4">🎁</div>
              <h2 className="text-2xl font-bold mb-2">3 Free Credits on Sign Up</h2>
              <p className="text-slate-400 mb-6">
                No subscription needed. Try it first, subscribe when you need more.
              </p>
              {!user && (
                <Link
                  href="/"
                  className="inline-block px-8 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </>
        ) : (
          /* One-time Credit Packages */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Buy Credits</h2>
              <p className="text-slate-400">One-time payment, credits never expire</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.credits}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-slate-600 transition-all"
                >
                  <div className="text-3xl font-bold mb-2">{pkg.credits}</div>
                  <div className="text-slate-400 text-sm mb-4">Credits</div>
                  <div className="text-2xl font-bold mb-6">${pkg.price}</div>
                  {!user ? (
                    <div className="text-slate-400 text-sm">Login to buy</div>
                  ) : (
                    <div onClick={() => setPayingPlan(`credit-${pkg.credits}`)}>
                      <OneTimePaymentButton
                        amount={pkg.price}
                        credits={pkg.credits}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-slate-500 text-sm">
              <p>Credits never expire. Use them whenever you need.</p>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/50 rounded-xl p-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <span className="text-purple-400">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-slate-400 pl-6">
                  <span className="text-blue-400 mr-2">A:</span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">Have questions?</p>
          <a
            href="mailto:support@imagebackgroundremovers.shop"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Contact our team
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-800 mt-16">
        <p>© 2024 Image Background Remover. All rights reserved.</p>
      </footer>
    </div>
  );
}
