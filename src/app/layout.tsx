import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/lv/context";

export const metadata: Metadata = {
  title: "LussoVogue Admin Panel",
  description: "Premium Admin Dashboard for LussoVogue Luxury Indian Clothing",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
