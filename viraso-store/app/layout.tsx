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
  icons: {
    icon: "/logo/Untitled design (1).jpg",
    apple: "/logo/Untitled design (1).jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}
