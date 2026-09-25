import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viraso | Marjara Enterprises",
  description:
    "Viraso by Marajar Enterprises manufactures and sells sewing machine stands and related accessories for home, tailoring, and business use.",
  keywords: [
    "Viraso",
    "Marajar Enterprises",
    "sewing machine stand",
    "Sewing Machine Table",
    "TA1 stand",
    "Umbrella sewing machine stand",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Viraso Admin",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
      { url: "/logo/viraso-favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}
