import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { LearningDashboardSection } from "@/components/home/learning-dashboard";
import { LearningModulesSection } from "@/components/home/learning-modules";
import { WhyArabicMasterSection } from "@/components/home/why-arabic-master";
import { MethodologySection } from "@/components/home/methodology-section";
import { SituationsSection } from "@/components/home/situations-section";
import { ProSection } from "@/components/home/pro-section";
import { ComparisonSection } from "@/components/home/comparison-section";
import { FAQSection } from "@/components/home/faq-section";
import { FinalCTASection } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Arabic Master — Spoken Arabic for Saudi Arabia",
  description:
    "Learn spoken Arabic for daily life in Saudi Arabia, with Bangla and English meanings.",
};

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <LearningDashboardSection />
      <LearningModulesSection />
      <WhyArabicMasterSection />
      <MethodologySection />
      <SituationsSection />
      <ProSection />
      <ComparisonSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}
