import {
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Target,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import {
  useOnboardingStore,
  type PracticeDuration,
} from "@/features/onboarding/store";

type DurationOption = {
  value: PracticeDuration;
  label: string;
  banglaTime: string;
  level: string;
  detail: string;
  Icon: typeof Zap;
  iconColor: string;
  tag?: string;
};

const durations: DurationOption[] = [
  {
    value: "5",
    label: "5 minutes / day",
    banglaTime: "৫ মিনিট / দিন",
    level: "Casual",
    detail: "সহজ শুরু • ১টি ছোট লেসন",
    Icon: Zap,
    iconColor: "#d97706",
  },
  {
    value: "10",
    label: "10 minutes / day",
    banglaTime: "১০ মিনিট / দিন",
    level: "Regular",
    detail: "জনপ্রিয় পছন্দ • সবচেয়ে কার্যকর",
    Icon: Target,
    iconColor: "#15803d",
    tag: "★ Recommended",
  },
  {
    value: "15",
    label: "15 minutes / day",
    banglaTime: "১৫ মিনিট / দিন",
    level: "Steady",
    detail: "ধারাবাহিক অগ্রগতি • দ্রুত উন্নতি",
    Icon: Clock3,
    iconColor: "#2563eb",
  },
  {
    value: "20+",
    label: "20+ minutes / day",
    banglaTime: "২০+ মিনিট / দিন",
    level: "Intense",
    detail: "সিরিয়াস লার্নার • দ্রুত আয়ত্ত",
    Icon: Flame,
    iconColor: "#ea580c",
  },
];

export default function PracticeTimeScreen() {
  const router = useRouter();
  const selectedDuration = useOnboardingStore(
    (state) => state.practiceDuration,
  );
  const setPracticeDuration = useOnboardingStore(
    (state) => state.setPracticeDuration,
  );

  return (
    <OnboardingLayout
      step={4}
      headerContent={
        <View className="mb-2 flex-row items-center">
          <View className="flex-row items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 border border-outline-variant">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="font-label-sm text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Step 4 of 4 • Daily Goal
            </Text>
          </View>
        </View>
      }
      title="How much time can you practice each day?"
      subtitle="সহজে বজায় রাখা যায় এমন একটি লক্ষ্য বেছে নিন (পরবর্তীতে যেকোনো সময় পরিবর্তন করা যাবে)"
      continueLabel="Start Learning"
      onBack={() => router.back()}
      continueDisabled={!selectedDuration}
      onContinue={() => router.push("/onboarding/complete")}
      onSkip={() => router.push("/onboarding/complete")}
    >
      {/* Practice Duration Choice Cards */}
      <View
        className="gap-3.5"
        accessibilityRole="radiogroup"
        accessibilityLabel="Daily practice duration options"
      >
        {durations.map(
          ({ value, label, banglaTime, detail, Icon, iconColor, tag }) => {
            const isSelected = selectedDuration === value;
            return (
              <Pressable
                key={value}
                onPress={() => setPracticeDuration(value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                aria-checked={isSelected}
                accessibilityLabel={`${label}, ${detail}`}
                className={`min-h-[84px] flex-row items-center justify-between rounded-2xl p-5 border-2 active:opacity-90 ${
                  isSelected
                    ? "border-primary bg-primary-subtle"
                    : "border-outline-variant bg-surface"
                }`}
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-4">
                  {/* Habit Icon Avatar */}
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                      isSelected
                        ? "border-primary/40 bg-white"
                        : "border-outline-variant/80 bg-surface-container"
                    }`}
                  >
                    <Icon
                      size={22}
                      color={isSelected ? "#15803d" : iconColor}
                      strokeWidth={2.2}
                    />
                  </View>

                  {/* Duration Labels & Subtext */}
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`font-label-lg text-base font-bold leading-tight ${
                          isSelected ? "text-primary-strong" : "text-on-surface"
                        }`}
                      >
                        {label}
                      </Text>
                      {tag ? (
                        <View
                          className={`rounded-full px-2.5 py-0.5 ${
                            isSelected ? "bg-primary" : "bg-primary-subtle"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              isSelected ? "text-white" : "text-primary-strong"
                            }`}
                          >
                            {tag}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-1 font-body-sm text-xs font-medium text-on-surface-variant">
                      {banglaTime} • {detail}
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View className="ml-4 shrink-0">
                  {isSelected ? (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check color="#ffffff" size={14} strokeWidth={3} />
                    </View>
                  ) : (
                    <View className="h-6 w-6 rounded-full border-2 border-outline-variant" />
                  )}
                </View>
              </Pressable>
            );
          },
        )}
      </View>

      {/* Habit Psychology Reassurance Banner */}
      <View className="mt-6 flex-row items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
        <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-lg bg-primary-subtle">
          <CheckCircle2 size={16} color="#15803d" strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-xs text-on-surface">
            Small steps, big results
          </Text>
          <Text className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">
            প্রতিদিন মাত্র ১০ মিনিট নিয়মিত চর্চা করলে এক মাসে ৩০০+ প্রয়োজনীয়
            আরবি শব্দ ও কথোপকথন অনায়াসেই আয়ত্ত করা সম্ভব।
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
