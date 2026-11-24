import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { LearningDashboardSection } from "@/components/home/learning-dashboard";
import { LearningModulesSection } from "@/components/home/learning-modules";
import { WhyArabicMasterSection } from "@/components/home/why-arabic-master";
import { FinalCTASection } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Arabic Master — Learn the Arabic You Actually Need to Speak",
  description:
    "Practical spoken Arabic for everyday life in Arabic-speaking countries. Learn practical words, daily sentences, and conversations with Bangla and English meanings.",
};

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <LearningDashboardSection />
      <LearningModulesSection />
      <WhyArabicMasterSection />
      <FinalCTASection />
    </div>
  );
}
