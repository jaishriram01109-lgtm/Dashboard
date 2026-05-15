import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartFlow AI — Institutional Market Intelligence Dashboard",
  description: "AI Smart Money Sector Rotation & Stock Momentum Dashboard for Indian Markets",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070708" />
      </head>
      <body className="bg-bg-primary text-ivory-100 antialiased min-h-screen grid-bg">
        {children}
      </body>
    </html>
  );
}
