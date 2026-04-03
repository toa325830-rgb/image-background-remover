"use client";

import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";

const plans = [
  {
    name: "个人版",
    price: "9.9",
    unit: "元/月",
    description: "适合个人日常使用",
    features: [
      "每月 100 张额度",
      "注册送 3 张体验额度",
      "支持 JPG/PNG/WebP",
      "下载高清无水印",
      " Email 支持",
    ],
    notIncluded: [
      "优先队列",
      "批量处理",
    ],
    popular: false,
  },
  {
    name: "专业版",
    price: "39",
    unit: "元/月",
    description: "适合专业用户和小型工作室",
    features: [
      "每月 300 张额度",
      "注册送 3 张体验额度",
      "支持 JPG/PNG/WebP",
      "下载高清无水印",
      "优先队列处理",
      " Email 支持",
    ],
    notIncluded: [
      "批量处理",
    ],
    popular: true,
  },
  {
    name: "团队版",
    price: "99",
    unit: "元/月",
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
    a: "个人版和专业版的月度额度不会累计到下个月，建议在每月月底前使用完。团队版额度可累计。",
  },
  {
    q: "如何取消订阅？",
    a: "可以在个人中心随时取消订阅，取消后下个账单周期不再扣费。",
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

export default function PricingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            简单透明的<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">定价</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            选择适合您的方案，立即开始移除图片背景
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
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
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-5xl font-bold">¥{plan.price}</span>
                <span className="text-slate-400 ml-1">{plan.unit}</span>
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

              <button
                className={`
                  w-full py-3 rounded-xl font-medium transition-all duration-200
                  ${plan.popular
                    ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
                  }
                `}
              >
                {user ? "立即订阅" : "登录后订阅"}
              </button>
            </div>
          ))}
        </div>

        {/* Free Credits Info */}
        <div className="bg-slate-800/50 rounded-2xl p-8 text-center mb-20">
          <div className="text-4xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2">注册即送 3 张免费额度</h2>
          <p className="text-slate-400 mb-6">
            无需订阅，先体验再决定。3 张额度永久有效。
          </p>
          {!user && (
            <button
              onClick={() => window.location.href = "/"}
              className="px-8 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              立即体验
            </button>
          )}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
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

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">还有疑问？</p>
          <a
            href="mailto:support@imagebackgroundremovers.shop"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            联系我们的团队
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
