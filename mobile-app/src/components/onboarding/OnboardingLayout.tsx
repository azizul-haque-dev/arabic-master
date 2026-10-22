import { ArrowLeft, ArrowRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgressDots } from "@/components/onboarding/ProgressDots";

type OnboardingLayoutProps = {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  headerContent?: ReactNode;
  children: ReactNode;
  continueLabel?: string;
  continueDisabled?: boolean;
  onContinue: () => void;
  onSkip: () => void;
  onBack?: () => void;
};

export function OnboardingLayout({
  step,
  totalSteps = 4,
  title,
  subtitle,
  headerContent,
  children,
  continueLabel = "Continue",
  continueDisabled = false,
  onContinue,
  onSkip,
  onBack,
}: OnboardingLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
      >
        <View className="flex-1">
          {/* Top Navigation Bar */}
          <View className="h-14 flex-row items-center justify-between px-margin">
            {onBack ? (
              <Pressable
                onPress={onBack}
                hitSlop={12}
                className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ArrowLeft className="text-on-surface" size={22} strokeWidth={2.2} />
              </Pressable>
            ) : (
              <View className="h-10 w-10" />
            )}
            <ProgressDots step={step} total={totalSteps} />
            <Pressable
              onPress={onSkip}
              hitSlop={12}
              className="h-10 min-w-10 items-center justify-center px-2 rounded-full active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Skip this step"
            >
              <Text className="font-label-lg text-sm font-semibold text-primary">
                Skip
              </Text>
            </Pressable>
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 px-margin pb-8 pt-4">
              {headerContent ? <View className="mb-6">{headerContent}</View> : null}
              <View className="mb-7">
                <Text className="font-headline-md text-2xl font-bold tracking-tight text-on-surface leading-[34px]">
                  {title}
                </Text>
                <Text className="mt-2 font-body-md text-base text-on-surface-variant leading-relaxed">
                  {subtitle}
                </Text>
              </View>
              <View className="flex-1">{children}</View>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View className="border-t border-outline-variant bg-background px-margin pt-4 pb-6">
            <Pressable
              onPress={onContinue}
              disabled={continueDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: continueDisabled }}
              className={`min-h-[56px] w-full flex-row items-center justify-center rounded-2xl py-4 active:opacity-90 ${
                continueDisabled
                  ? "bg-surface-container-high"
                  : "bg-primary"
              }`}
            >
              <Text
                className={`font-label-lg text-lg font-bold tracking-wide ${
                  continueDisabled
                    ? "text-on-surface-variant"
                    : "text-white"
                }`}
              >
                {continueLabel}
              </Text>
              <ArrowRight
                size={20}
                color={continueDisabled ? "#737373" : "#ffffff"}
                className="ml-2.5"
                strokeWidth={2.4}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

