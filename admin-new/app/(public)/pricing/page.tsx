import type { Metadata } from "next";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { ProSection } from "@/components/landing/ProSection";

export const metadata: Metadata = {
  title: "Arabic Master Pro — Plans & Comparison",
  description:
    "Compare Free and Pro plans on Arabic Master. Unlock the full structured curriculum, advanced conversations, and ad-free practice.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      <ProSection />
      <ComparisonSection />
    </div>
  );
}
