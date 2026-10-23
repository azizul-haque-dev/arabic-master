import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Award,
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";

import {
  ProgressBar,
  SectionHeader,
  TabScreen,
} from "@/components/learning/primitives";
import {
  goalMinutesFrom,
  learner,
  weeklyMinutes,
} from "@/features/learning/data";
import { useOnboardingStore } from "@/features/onboarding/store";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_WEEKLY_MINUTES = Math.max(...weeklyMinutes, learner.todayMinutes, 1);
const PROGRESS_PREVIEW_STATES = [
  { id: "progress", label: "Sample" },
  { id: "loading", label: "Loading" },
  { id: "empty", label: "Empty" },
  { id: "error", label: "Error" },
] as const;

type ProgressPreviewState = (typeof PROGRESS_PREVIEW_STATES)[number]["id"];

export default function ProgressScreen() {
  const practiceDuration = useOnboardingStore(
    (state) => state.practiceDuration,
  );
  const [previewState, setPreviewState] =
    useState<ProgressPreviewState>("progress");
  const goalMinutes = goalMinutesFrom(practiceDuration);
  const goalPercent = Math.round(
    Math.min(learner.todayMinutes / goalMinutes, 1) * 100,
  );
  const todayIndex = (new Date().getDay() + 6) % 7;
  const week = WEEK_DAYS.map((day, index) => {
    const minutes =
      index === todayIndex ? learner.todayMinutes : (weeklyMinutes[index] ?? 0);
    return {
      day,
      minutes,
      value: minutes / MAX_WEEKLY_MINUTES,
    };
  });

  return (
    <TabScreen>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle">
          <TrendingUp size={22} color="#15803d" />
        </View>
        <View className="flex-1">
          <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.2px] text-primary">
            YOUR MOMENTUM
          </Text>
          <Text className="mt-1 font-headline-sm text-xl font-bold text-on-surface">
            Progress that adds up
          </Text>
        </View>
      </View>

      <Text className="font-body-sm text-xs leading-4 text-on-surface-variant">
        Sample figures and state previews are local UI fixtures; nothing is
        synced or saved.
      </Text>

      {previewState === "progress" ? (
        <>
          <View className="rounded-3xl bg-primary-strong p-5">
            <View className="flex-row items-center gap-2">
              <CalendarDays size={17} color="#f0fdf4" />
              <Text className="font-label-md text-xs font-semibold text-primary-subtle">
                THIS WEEK · SAMPLE
              </Text>
            </View>
            <Text className="mt-3 font-headline-lg-mobile text-3xl font-bold text-white">
              You showed up.
            </Text>
            <Text className="mt-1 font-body-sm text-sm text-primary-subtle">
              {learner.todayMinutes} focused minutes today. That counts.
            </Text>
            <View className="mt-7 h-32 flex-row items-end justify-between gap-2">
              {week.map(({ day, minutes, value }, index) => (
                <View
                  key={`${day}-${index}`}
                  className="flex-1 items-center gap-2"
                >
                  <View
                    accessible
                    accessibilityLabel={`${day}${index === todayIndex ? ", today" : ""}: ${minutes} sample minutes`}
                    className={`w-full rounded-t-lg ${
                      index === todayIndex ? "bg-white" : "bg-primary-subtle/40"
                    }`}
                    style={{ height: Math.max(value * 96, 12) }}
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
              value={`${learner.streakDays} days`}
              label="sample current streak"
              iconClass="bg-warning-container"
            />
            <ProgressStat
              icon={<Award size={19} color="#b45309" />}
              value={`${learner.xp} XP`}
              label="sample total earned"
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
                    {learner.todayMinutes} of {goalMinutes} minutes
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-xs text-on-surface-variant">
                    {goalPercent >= 100
                      ? "Your sample daily goal is complete."
                      : "You’re close to your sample target."}
                  </Text>
                </View>
                <Text className="font-label-lg text-sm font-bold text-primary">
                  {goalPercent}%
                </Text>
              </View>
              <ProgressBar
                value={goalPercent / 100}
                label="Sample daily learning goal"
                height={8}
              />
            </View>
          </View>

          <View className="rounded-2xl border border-primary/15 bg-primary-subtle p-4">
            <Text className="font-label-lg text-sm font-bold text-primary-strong">
              Your rhythm is building
            </Text>
            <Text className="mt-1 font-body-sm text-sm leading-5 text-on-surface-variant">
              A few minutes of practice each day can take you a long way. These
              sample figures are not saved to an account.
            </Text>
          </View>
        </>
      ) : (
        <ProgressStatePreview
          state={previewState}
          onShowSample={() => setPreviewState("progress")}
        />
      )}

      <View className="gap-3">
        <SectionHeader
          title="Preview UI states"
          subtitle="Local visual examples only · no network request"
        />
        <View className="flex-row flex-wrap gap-2" accessibilityRole="tablist">
          {PROGRESS_PREVIEW_STATES.map(({ id, label }) => {
            const selected = previewState === id;
            return (
              <Pressable
                key={id}
                onPress={() => setPreviewState(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                aria-selected={selected}
                accessibilityLabel={`${label} progress preview`}
                className={`min-h-12 items-center justify-center rounded-full border px-4 ${
                  selected
                    ? "border-primary bg-primary-subtle"
                    : "border-outline-variant/70 bg-white active:bg-surface-container-low"
                }`}
              >
                <Text
                  className={`font-label-md text-xs font-bold ${
                    selected ? "text-primary-strong" : "text-on-surface"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </TabScreen>
  );
}

function ProgressStatePreview({
  state,
  onShowSample,
}: {
  state: Exclude<ProgressPreviewState, "progress">;
  onShowSample: () => void;
}) {
  if (state === "loading") {
    return (
      <View
        accessibilityLiveRegion="polite"
        className="min-h-52 items-center justify-center gap-3 rounded-3xl border border-outline-variant/70 bg-white p-6"
      >
        <ActivityIndicator
          size="large"
          color="#15803d"
          accessibilityLabel="Loading sample progress"
        />
        <Text className="font-label-lg text-sm font-bold text-on-surface">
          Loading sample progress
        </Text>
        <Text className="text-center font-body-sm text-xs text-on-surface-variant">
          This is a visual loading preview. No request is in progress.
        </Text>
      </View>
    );
  }

  const isError = state === "error";

  return (
    <View
      accessibilityLiveRegion="polite"
      className={`min-h-52 items-center justify-center gap-3 rounded-3xl border p-6 ${
        isError
          ? "border-error/30 bg-error-container"
          : "border-outline-variant/70 bg-white"
      }`}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${
          isError ? "bg-white/70" : "bg-primary-subtle"
        }`}
      >
        {isError ? (
          <AlertCircle size={22} color="#ba1a1a" />
        ) : (
          <CalendarDays size={22} color="#15803d" />
        )}
      </View>
      <Text
        className={`font-label-lg text-base font-bold ${
          isError ? "text-on-error-container" : "text-on-surface"
        }`}
      >
        {isError ? "Sample progress unavailable" : "No sample progress yet"}
      </Text>
      <Text
        className={`text-center font-body-sm text-sm leading-5 ${
          isError ? "text-on-error-container" : "text-on-surface-variant"
        }`}
      >
        {isError
          ? "This visual error preview did not come from a server or network request."
          : "This empty state is a local UI example, not a check of saved account data."}
      </Text>
      <Pressable
        onPress={onShowSample}
        accessibilityRole="button"
        accessibilityLabel="Return to sample progress"
        className="min-h-12 justify-center rounded-full bg-primary px-5 active:bg-primary-strong"
      >
        <Text className="font-label-md text-xs font-bold text-white">
          Show sample progress
        </Text>
      </Pressable>
    </View>
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
