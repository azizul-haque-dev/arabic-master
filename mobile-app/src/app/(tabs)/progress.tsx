import {
  Award,
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

const week = [
  { day: "M", value: 0.48 },
  { day: "T", value: 0.72 },
  { day: "W", value: 0.36 },
  { day: "T", value: 0.88 },
  { day: "F", value: 0.66 },
  { day: "S", value: 0.94 },
  { day: "S", value: 0.7 },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-soft" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="gap-5 px-margin pt-5"
          style={{ maxWidth: 560, width: "100%", alignSelf: "center" }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle">
              <TrendingUp size={22} color="#15803d" />
            </View>
            <View>
              <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.2px] text-primary">
                YOUR MOMENTUM
              </Text>
              <Text className="mt-1 font-headline-sm text-xl font-bold text-on-surface">
                Progress that adds up
              </Text>
            </View>
          </View>

          <View className="rounded-3xl bg-primary-strong p-5">
            <View className="flex-row items-center gap-2">
              <CalendarDays size={17} color="#f0fdf4" />
              <Text className="font-label-md text-xs font-semibold text-primary-subtle">
                THIS WEEK
              </Text>
            </View>
            <Text className="mt-3 font-headline-lg-mobile text-3xl font-bold text-white">
              You showed up.
            </Text>
            <Text className="mt-1 font-body-sm text-sm text-primary-subtle">
              Seven focused minutes today. That counts.
            </Text>
            <View className="mt-7 h-32 flex-row items-end justify-between gap-2">
              {week.map(({ day, value }, index) => (
                <View
                  key={`${day}-${index}`}
                  className="flex-1 items-center gap-2"
                >
                  <View
                    className={`w-full rounded-t-lg ${
                      index === week.length - 1
                        ? "bg-white"
                        : "bg-primary-subtle/40"
                    }`}
                    style={{ height: `${Math.max(value * 100, 12)}%` }}
                    accessibilityLabel={`${day}: ${Math.round(value * 10)} minutes`}
                  />
                  <Text className="font-label-sm text-[10px] font-semibold text-primary-subtle">
                    {day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <ProgressStat
              icon={<Flame size={19} color="#b45309" />}
              value="7 days"
              label="current streak"
              iconClass="bg-warning-container"
            />
            <ProgressStat
              icon={<Award size={19} color="#b45309" />}
              value="420 XP"
              label="total earned"
              iconClass="bg-secondary-subtle"
            />
          </View>

          <View className="gap-3">
            <Text className="font-headline-sm text-lg font-bold text-on-surface">
              Your daily goal
            </Text>
            <View className="rounded-2xl border border-outline-variant/70 bg-white p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
                  <Target size={19} color="#15803d" />
                </View>
                <View className="flex-1">
                  <Text className="font-label-lg text-sm font-bold text-on-surface">
                    7 of 10 minutes
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-xs text-on-surface-variant">
                    You’re close to today’s target.
                  </Text>
                </View>
                <Text className="font-label-lg text-sm font-bold text-primary">
                  70%
                </Text>
              </View>
              <View
                className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10"
                accessibilityRole="progressbar"
                accessibilityLabel="Daily learning goal"
                accessibilityValue={{ min: 0, max: 10, now: 7 }}
              >
                <View className="h-full w-[70%] rounded-full bg-primary" />
              </View>
            </View>
          </View>

          <View className="rounded-2xl border border-primary/15 bg-primary-subtle p-4">
            <Text className="font-label-lg text-sm font-bold text-primary-strong">
              Your rhythm is building
            </Text>
            <Text className="mt-1 font-body-sm text-sm leading-5 text-on-surface-variant">
              A few minutes of practice each day can take you a long way. Keep
              your streak going.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressStat({
  icon,
  value,
  label,
  iconClass,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  iconClass: string;
}) {
  return (
    <View className="min-h-[86px] flex-1 flex-row items-center gap-3 rounded-2xl border border-outline-variant/70 bg-white p-3">
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="font-label-lg text-sm font-bold text-on-surface">
          {value}
        </Text>
        <Text className="mt-0.5 font-body-sm text-[10px] text-on-surface-variant">
          {label}
        </Text>
      </View>
    </View>
  );
}
