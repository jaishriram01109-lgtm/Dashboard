import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "SmartFlow AI — Institutional Market Intelligence Dashboard",
  description: "AI Smart Money Sector Rotation & Stock Momentum Dashboard for Indian Markets",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070708" />
        {/* Prevent flash of wrong theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{var t=localStorage.getItem('sf_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`
        }} />
      </head>
      <body className="bg-bg-primary text-ivory-100 antialiased min-h-screen grid-bg">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
