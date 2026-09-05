import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

import "./globals.css";

const serif = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

const sans = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Arabic Master — Admin Console",
  description: "Content and admin management console",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
