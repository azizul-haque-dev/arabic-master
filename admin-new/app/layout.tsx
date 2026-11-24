import type { Metadata } from "next";
import {
  Inter,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { UserProvider } from "@/lib/auth/user-context";
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
  title: {
    default: "Arabic Master — Learn the Arabic You Actually Need to Speak",
    template: "%s | Arabic Master",
  },
  description:
    "Practical spoken Arabic for everyday life in Saudi Arabia and Gulf countries. Learn words, daily sentences, and real-life conversations with Bangla and English meanings.",
  openGraph: {
    title: "Arabic Master — Spoken Arabic Learning Platform",
    description:
      "Learn the Arabic you actually need to speak with Bangla and English translations, native audio pronunciation, and guided conversations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${jakarta.variable} ${inter.variable} ${notoArabic.variable} ${notoBengali.variable} antialiased`}
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
