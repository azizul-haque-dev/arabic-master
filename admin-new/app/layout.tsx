import type { Metadata } from "next";
import {
  Inter,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { RootShell } from "@/components/layout/root-shell";
import { getAuthSession } from "@/lib/auth/session";
import "./globals.css";
import { removeHarakat } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });
const notoArabic = Noto_Naskh_Arabic({ variable: "--font-noto-arabic", subsets: ["arabic"], weight: ["400", "500", "700"] });
const notoBengali = Noto_Sans_Bengali({ variable: "--font-noto-bengali", subsets: ["bengali"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Arabic Master",
  description: "Learn the Arabic you actually need to speak.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${inter.variable} ${notoArabic.variable} ${notoBengali.variable} antialiased`}
      >
        <RootShell initialUser={user ?? null}>{children}</RootShell>
      </body>
    </html>
  );
}