import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import PayPalProvider from "@/components/paypal/PayPalProvider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "免费在线图片背景移除工具 - Image BG Remover",
  description: "免费在线图片背景移除工具，3秒内自动去除图片背景。无需注册即可试用，支持 JPG/PNG 格式。注册即送3张免费额度！",
  keywords: [
    "图片背景移除",
    "在线抠图",
    "免费去背景",
    "PNG背景透明",
    "证件照换底色",
    "产品图去背景",
    "background remover",
    "remove image background",
    "free background eraser",
  ],
  openGraph: {
    title: "免费在线图片背景移除工具 - Image BG Remover",
    description: "3秒内自动去除图片背景，无需注册，支持多格式。",
    url: "https://imagebackgroundremovers.shop",
    siteName: "Image BG Remover",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "免费在线图片背景移除工具",
    description: "3秒内自动去除图片背景，无需注册。",
  },
};

function Header() {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <Link href="/" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
        🖼️ Image Background Remover
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          首页
        </Link>
        <Link
          href="/pricing"
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          定价
        </Link>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Image BG Remover",
              description: "免费在线图片背景移除工具，3秒内自动去除图片背景",
              url: "https://imagebackgroundremovers.shop",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CNY",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "这个工具是免费的吗？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "是的，注册即送3张免费额度，体验图片背景移除功能。",
                  },
                },
                {
                  "@type": "Question",
                  name: "支持哪些图片格式？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "支持 JPG、PNG 等常见图片格式。",
                  },
                },
                {
                  "@type": "Question",
                  name: "处理一张图片需要多久？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "通常3秒内即可完成图片背景移除。",
                  },
                },
                {
                  "@type": "Question",
                  name: "可以商用吗？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "是的，处理后的图片可用于商业用途。",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <PayPalProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </PayPalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
