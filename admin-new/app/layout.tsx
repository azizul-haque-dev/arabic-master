import { RootShell } from "@/components/layout/root-shell";
import type { Metadata } from "next";
import {
  Inter,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Arabic Master Admin — Arabic Entities",
  description: "Manage the canonical Arabic text layer for Arabic Master.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${inter.variable} ${notoArabic.variable} ${notoBengali.variable} antialiased`}
      >
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
