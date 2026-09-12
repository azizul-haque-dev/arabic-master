import { HeroSection } from "@/components/landing/HeroSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { SituationsSection } from "@/components/landing/SituationsSection";
import { PersonalizedLearningSection } from "@/components/landing/PersonalizedLearningSection";
import { ProgressSection } from "@/components/landing/ProgressSection";
import { ProSection } from "@/components/landing/ProSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <ValueSection />
      <MethodologySection />
      <SituationsSection />
      <PersonalizedLearningSection />
      <ProgressSection />
      <ProSection />
      <ComparisonSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
}