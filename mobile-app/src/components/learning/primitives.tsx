import * as Haptics from "expo-haptics";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useTabBarClearance } from "@/components/navigation/FloatingTabBar";

export const SCREEN_BACKGROUND = "#f6f8f7";

/** Light selection haptic. Failures (e.g. web, unsupported device) are ignored. */
export function tapFeedback() {
  Haptics.selectionAsync().catch(() => undefined);
}

/** Safe-area + scroll shell shared by every tab, with room for the floating tab bar. */
export function TabScreen({ children }: { children: ReactNode }) {
  const clearance = useTabBarClearance();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: SCREEN_BACKGROUND }}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: clearance }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="gap-6 px-margin pt-3"
          style={{ maxWidth: 560, width: "100%", alignSelf: "center" }}
        >
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-end justify-between gap-3">
      <View className="flex-1">
        <Text
          accessibilityRole="header"
          className="font-headline-sm text-lg font-bold tracking-tight text-on-surface"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-body-sm text-xs text-on-surface-variant">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="min-h-9 flex-row items-center gap-0.5 rounded-full px-2 active:bg-primary-subtle"
        >
          <Text className="font-label-md text-xs font-bold text-primary">
            {actionLabel}
          </Text>
          <ChevronRight size={14} color="#15803d" strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProgressBar({
  value,
  label,
  fillColor = "#15803d",
  trackColor = "rgba(21,128,61,0.12)",
  height = 8,
}: {
  value: number;
  label: string;
  fillColor?: string;
  trackColor?: string;
  height?: number;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className="overflow-hidden rounded-full"
      style={{ height, backgroundColor: trackColor }}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${percent}%`, backgroundColor: fillColor }}
      />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 84,
  strokeWidth = 9,
  color = "#15803d",
  trackColor = "rgba(21,128,61,0.12)",
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export type StatItem = {
  key: string;
  icon: ReactNode;
  value: string;
  label: string;
};

/** One card, evenly divided columns — calmer than three separate stat cards. */
export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <View className="flex-row rounded-3xl border border-outline-variant/70 bg-white py-3.5">
      {items.map((item, index) => (
        <View
          key={item.key}
          accessible
          accessibilityLabel={`${item.value} ${item.label}`}
          className={`flex-1 flex-row items-center justify-center gap-2.5 ${
            index > 0 ? "border-l border-outline-variant/70" : ""
          }`}
        >
          {item.icon}
          <View>
            <Text className="font-headline-sm text-base font-bold leading-5 text-on-surface">
              {item.value}
            </Text>
            <Text className="font-body-sm text-[11px] text-on-surface-variant">
              {item.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
