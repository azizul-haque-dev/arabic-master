import {
  Check,
  ChevronRight,
  Crown,
  LockKeyhole,
  Volume2,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { ProgressBar } from "@/components/learning/primitives";

export type LearningAccess = "free" | "mixed" | "premium";
export type LearningVisualStatus = "completed" | "in-progress" | "locked";

const ACCESS_PRESENTATION: Record<
  LearningAccess,
  {
    label: string;
    containerClassName: string;
    textClassName: string;
    icon?: ReactNode;
  }
> = {
  free: {
    label: "Free",
    containerClassName: "bg-success-container",
    textClassName: "text-primary-strong",
  },
  mixed: {
    label: "Free + Premium",
    containerClassName: "bg-secondary-subtle",
    textClassName: "text-on-secondary-subtle",
  },
  premium: {
    label: "Premium",
    containerClassName: "bg-surface-container-high",
    textClassName: "text-on-surface",
    icon: <Crown size={11} color="#b45309" />,
  },
};

const STATUS_PRESENTATION: Record<
  LearningVisualStatus,
  {
    label: string;
    containerClassName: string;
    textClassName: string;
    icon: ReactNode;
  }
> = {
  completed: {
    label: "Completed",
    containerClassName: "bg-success-container",
    textClassName: "text-primary-strong",
    icon: <Check size={11} color="#14532d" strokeWidth={2.8} />,
  },
  "in-progress": {
    label: "In progress",
    containerClassName: "bg-primary-subtle",
    textClassName: "text-primary-strong",
    icon: <View className="h-1.5 w-1.5 rounded-full bg-primary" />,
  },
  locked: {
    label: "Locked preview",
    containerClassName: "bg-surface-container-low",
    textClassName: "text-on-surface-variant",
    icon: <LockKeyhole size={11} color="#737373" />,
  },
};

export function LearningAccessBadge({
  access,
  label,
}: {
  access: LearningAccess;
  label?: string;
}) {
  const presentation = ACCESS_PRESENTATION[access];

  return (
    <View
      accessible
      accessibilityLabel={`${label ?? presentation.label} access`}
      className={`min-h-6 flex-row items-center gap-1 rounded-full px-2.5 py-1 ${presentation.containerClassName}`}
    >
      {presentation.icon}
      <Text
        className={`font-label-sm text-[10px] font-semibold ${presentation.textClassName}`}
      >
        {label ?? presentation.label}
      </Text>
    </View>
  );
}

export function LearningStatusBadge({
  status,
  label,
}: {
  status: LearningVisualStatus;
  label?: string;
}) {
  const presentation = STATUS_PRESENTATION[status];

  return (
    <View
      accessible
      accessibilityLabel={label ?? presentation.label}
      className={`min-h-6 flex-row items-center gap-1 rounded-full px-2.5 py-1 ${presentation.containerClassName}`}
    >
      {presentation.icon}
      <Text
        className={`font-label-sm text-[10px] font-semibold ${presentation.textClassName}`}
      >
        {label ?? presentation.label}
      </Text>
    </View>
  );
}

export type LearningCardProgress = {
  value: number;
  label: string;
  detail?: string;
};

export function LearningCard({
  title,
  description,
  metadata,
  leading,
  access,
  status,
  progress,
  selected = false,
  accessibilityLabel,
  onPress,
}: {
  title: string;
  description?: string;
  metadata?: string;
  leading?: ReactNode;
  access?: LearningAccess;
  status?: LearningVisualStatus;
  progress?: LearningCardProgress;
  selected?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-center gap-3">
      {leading ? (
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-subtle">
          {leading}
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text
            numberOfLines={2}
            className="flex-shrink font-label-lg text-sm font-bold text-on-surface"
          >
            {title}
          </Text>
          {access ? <LearningAccessBadge access={access} /> : null}
          {status ? <LearningStatusBadge status={status} /> : null}
        </View>
        {description ? (
          <Text className="mt-1 font-body-sm text-xs leading-4 text-on-surface-variant">
            {description}
          </Text>
        ) : null}
        {metadata ? (
          <Text className="mt-1 font-label-sm text-[11px] text-on-surface-variant">
            {metadata}
          </Text>
        ) : null}
        {progress ? (
          <View className="mt-2 gap-1.5">
            <ProgressBar
              value={progress.value}
              label={progress.label}
              height={5}
            />
            {progress.detail ? (
              <Text className="font-label-sm text-[11px] text-on-surface-variant">
                {progress.detail}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {onPress ? (
        <ChevronRight size={18} color="#737373" strokeWidth={2} />
      ) : null}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !onPress, selected }}
      className={`min-h-[76px] justify-center rounded-2xl border p-4 ${
        selected
          ? "border-primary bg-primary-subtle"
          : "border-outline-variant/70 bg-white"
      } ${onPress && !selected ? "active:bg-surface-container-low" : ""} ${
        onPress && selected ? "active:bg-primary-subtle" : ""
      }`}
    >
      {content}
    </Pressable>
  );
}

export function LearningContentCard({
  arabic,
  transliteration,
  meaningBn,
  meaningEn,
  category,
  speaker,
  audioAvailable,
}: {
  arabic: string;
  transliteration: string;
  meaningBn: string;
  meaningEn?: string;
  category?: string;
  speaker?: string;
  audioAvailable?: boolean;
}) {
  const accessibilityLabel = [
    speaker,
    category,
    arabic,
    transliteration,
    meaningBn,
    meaningEn,
    audioAvailable ? "Audio available" : undefined,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className="rounded-2xl border border-outline-variant/70 bg-white p-4"
    >
      {category || speaker ? (
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {category ? (
            <View className="self-start rounded-full bg-primary-subtle px-2.5 py-1">
              <Text className="font-label-sm text-[10px] font-semibold text-primary-strong">
                {category}
              </Text>
            </View>
          ) : null}
          {speaker ? (
            <Text className="font-label-md text-xs font-semibold text-on-surface-variant">
              {speaker}
            </Text>
          ) : null}
        </View>
      ) : null}
      <Text
        className="mt-3 text-right font-arabic-display text-[26px] leading-[42px] text-on-surface"
        style={{ writingDirection: "rtl" }}
      >
        {arabic}
      </Text>
      <Text className="mt-1 font-label-lg text-sm font-bold text-primary-strong">
        {transliteration}
      </Text>
      <Text className="mt-1 font-body-sm text-sm leading-5 text-on-surface">
        {meaningBn}
      </Text>
      {meaningEn ? (
        <Text className="mt-1 font-body-sm text-xs leading-4 text-on-surface-variant">
          {meaningEn}
        </Text>
      ) : null}
      {audioAvailable ? (
        <View className="mt-3 flex-row items-center gap-1.5">
          <Volume2 size={14} color="#15803d" />
          <Text className="font-label-sm text-[11px] font-semibold text-primary-strong">
            Audio available
          </Text>
        </View>
      ) : null}
    </View>
  );
}
