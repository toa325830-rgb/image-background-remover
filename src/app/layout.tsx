import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import PayPalProvider from "@/components/paypal/PayPalProvider";

export const metadata: Metadata = {
  title: "Image Background Remover",
  description: "Remove background from images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="google-adsbot" content="noindex" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <PayPalProvider>{children}</PayPalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
