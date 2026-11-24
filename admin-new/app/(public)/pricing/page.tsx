import type { Metadata } from "next";
import { ComparisonSection } from "@/components/home/comparison-section";
import { ProSection } from "@/components/home/pro-section";

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
