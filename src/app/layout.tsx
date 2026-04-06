import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Image Background Remover",
  description: "Remove image backgrounds with AI - free and easy to use",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
