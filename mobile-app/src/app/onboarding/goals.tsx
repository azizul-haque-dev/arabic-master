import {
  BriefcaseBusiness,
  Bus,
  Check,
  CheckCircle2,
  Heart,
  MessageCircle,
  Plane,
  ShoppingBag,
  Target,
  Users,
  Utensils,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/features/onboarding/store";

type GoalItem = {
  id: string;
  label: string;
  bangla: string;
  Icon: typeof MessageCircle;
  accentColor: string;
};

const goals: GoalItem[] = [
  {
    id: "Everyday conversation",
    label: "Everyday Talk",
    bangla: "দৈনন্দিন কথপোকথন",
    Icon: MessageCircle,
    accentColor: "#15803d",
  },
  {
    id: "Work",
    label: "Work & Career",
    bangla: "কর্মক্ষেত্র ও চাকরি",
    Icon: BriefcaseBusiness,
    accentColor: "#b45309",
  },
  {
    id: "Shopping",
    label: "Shopping & Market",
    bangla: "কেনাকাটা ও লেনদেন",
    Icon: ShoppingBag,
    accentColor: "#7c3aed",
  },
  {
    id: "Restaurant & food",
    label: "Food & Dining",
    bangla: "রেস্তোরাঁ ও খাবার",
    Icon: Utensils,
    accentColor: "#c2410c",
  },
  {
    id: "Transportation",
    label: "Transportation",
    bangla: "যাতায়াত ও ভ্রমণ",
    Icon: Bus,
    accentColor: "#2563eb",
  },
  {
    id: "Making friends",
    label: "Social & Friends",
    bangla: "বন্ধু তৈরি ও আড্ডা",
    Icon: Users,
    accentColor: "#0f766e",
  },
  {
    id: "Travel",
    label: "Travel & Airport",
    bangla: "ভ্রমণ ও এয়ারপোর্ট",
    Icon: Plane,
    accentColor: "#0284c7",
  },
  {
    id: "Understanding people around me",
    label: "Understanding",
    bangla: "মানুষের কথা বোঝা",
    Icon: Heart,
    accentColor: "#e11d48",
  },
];

export default function GoalsScreen() {
  const router = useRouter();
  const selectedGoals = useOnboardingStore((state) => state.goals);
  const toggleGoal = useOnboardingStore((state) => state.toggleGoal);

  const rows = Array.from({ length: Math.ceil(goals.length / 2) }, (_, index) =>
    goals.slice(index * 2, index * 2 + 2),
  );

  return (
    <OnboardingLayout
      step={3}
      headerContent={
        <View className="mb-2 flex-row items-center">
          <View className="flex-row items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 border border-outline-variant">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="font-label-sm text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Step 3 of 4 • Goals
            </Text>
          </View>
        </View>
      }
      title="Why do you want to learn Arabic?"
      subtitle="আরবি শেখার প্রধান উদ্দেশ্যগুলো বেছে নিন (একাধিক নির্বাচন করা যাবে)"
      onBack={() => router.back()}
      continueDisabled={selectedGoals.length === 0}
      onContinue={() => router.push("/onboarding/practice-time")}
      onSkip={() => router.push("/onboarding/practice-time")}
    >
      {/* Live Selection Feedback Counter */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <CheckCircle2
            size={16}
            color={selectedGoals.length > 0 ? "#15803d" : "#737373"}
            strokeWidth={2.2}
          />
          <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
            Select all that apply
          </Text>
        </View>
        {selectedGoals.length > 0 ? (
          <View className="rounded-full bg-primary px-2.5 py-0.5">
            <Text className="text-[11px] font-bold text-white">
              {selectedGoals.length} selected
            </Text>
          </View>
        ) : (
          <Text className="font-body-sm text-xs text-on-surface-variant">
            Choose at least 1
          </Text>
        )}
      </View>

      {/* Modern 2-Column Goals Grid */}
      <View
        className="gap-3.5"
        accessibilityLabel="Choose one or more learning goals"
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-3.5">
            {row.map(({ id, label, bangla, Icon, accentColor }) => {
              const isSelected = selectedGoals.includes(id);
              return (
                <View key={id} className="flex-1">
                  <Pressable
                    onPress={() => toggleGoal(id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    aria-checked={isSelected}
                    accessibilityLabel={`${label}, ${bangla}`}
                    className={`min-h-[132px] justify-between rounded-2xl p-4 border-2 active:opacity-90 ${
                      isSelected
                        ? "border-primary bg-primary-subtle"
                        : "border-outline-variant bg-surface"
                    }`}
                  >
                    {/* Top Row: Icon badge & Checkbox */}
                    <View className="flex-row items-center justify-between">
                      <View
                        className={`h-11 w-11 items-center justify-center rounded-xl border ${
                          isSelected
                            ? "border-primary/30 bg-white"
                            : "border-outline-variant/60 bg-surface-container"
                        }`}
                      >
                        <Icon
                          size={22}
                          color={isSelected ? "#15803d" : accentColor}
                          strokeWidth={2.2}
                        />
                      </View>
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full ${
                          isSelected
                            ? "bg-primary"
                            : "border-2 border-outline-variant"
                        }`}
                      >
                        {isSelected ? (
                          <Check color="#ffffff" size={14} strokeWidth={3} />
                        ) : null}
                      </View>
                    </View>

                    {/* Bottom Row: Bilingual Title and Subtitle */}
                    <View className="mt-3">
                      <Text
                        className={`font-label-lg text-sm font-bold leading-snug ${
                          isSelected ? "text-primary-strong" : "text-on-surface"
                        }`}
                      >
                        {label}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 font-body-sm text-[11px] font-medium text-on-surface-variant"
                      >
                        {bangla}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>

      {/* Helpful Custom Curriculum Note */}
      <View className="mt-6 flex-row items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
        <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle">
          <Target size={16} color="#15803d" strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-xs text-on-surface">
            Tailored Practice
          </Text>
          <Text className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">
            আপনার পছন্দের লক্ষ্য অনুযায়ী অ্যাপের পাঠ ও প্রয়োজনীয় শব্দভাণ্ডারগুলো
            সাজানো হবে।
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
