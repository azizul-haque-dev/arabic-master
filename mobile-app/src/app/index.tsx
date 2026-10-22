import { BookOpen, ChevronRight, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useOnboardingStore } from "@/features/onboarding/store";

export default function WelcomeScreen() {
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

  const startOnboarding = () => {
    reset();
    router.push("/onboarding/language");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-between px-margin pb-6 pt-6">
          {/* Hero Section & Visual Centerpiece */}
          <View className="items-center py-4">
            <Text className="text-center font-headline-lg-mobile text-[28px] font-extrabold tracking-tight text-on-surface leading-tight">
              Welcome to{"\n"} Arabic Master
            </Text>
            <Text className="mt-2 text-center font-body-md text-sm font-medium text-on-surface-variant max-w-[260px] leading-relaxed">
              Learn practical Arabic for everyday conversations.
            </Text>

            {/* Layered Brand Illustration Aura */}
            <View className="relative mt-6 h-52 w-52 items-center justify-center">
              {/* Outer Soft Mint Circle Backdrop */}
              <View
                className="h-44 w-44 items-center justify-center rounded-full bg-primary-subtle"
                accessible={false}
                importantForAccessibility="no-hide-descendants"
              >
                {/* Visual Official Icon Artwork */}
                <Image
                  source={require("@/assets/images/myImages/arabic_logo.png")}
                  style={{ width: 130, height: 130, borderRadius: 28 }}
                  contentFit="cover"
                />
              </View>

              {/* Decorative Accent Badges */}
              <View
                className="absolute -top-1 left-7 h-2 w-2 rounded-full bg-secondary"
                accessible={false}
              />
              <View
                className="absolute bottom-6 right-6 h-3 w-3 rounded-full bg-primary opacity-60"
                accessible={false}
              />
            </View>
          </View>

          {/* Dual Action Choice Cards */}
          <View className="gap-3.5 pt-2">
            {/* Card 1: Existing Account */}
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Sign in",
                  "Sign-in screen will be connected with the authentication module.",
                )
              }
              accessibilityRole="button"
              accessibilityLabel="I already have an account"
              className="flex-row items-center justify-between rounded-2xl bg-primary p-4 active:opacity-90"
            >
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-strong">
                  <User color="#ffffff" size={20} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text className="font-label-lg text-base font-bold text-white leading-tight">
                    I already have an account
                  </Text>
                </View>
              </View>
              <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
            </Pressable>

            {/* Card 2: New Learner Onboarding Flow */}
            <Pressable
              onPress={startOnboarding}
              accessibilityRole="button"
              accessibilityLabel="I'm new here, start learning without creating an account"
              className="flex-row items-center justify-between rounded-2xl border-2 border-primary bg-primary-subtle p-4 active:opacity-90"
            >
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-container">
                  <BookOpen color="#15803d" size={22} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text className="font-label-lg text-base font-bold text-on-surface leading-tight">
                    I’m new here
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-xs font-normal text-on-surface-variant leading-snug">
                    Start learning without creating an account.
                  </Text>
                </View>
              </View>
              <ChevronRight color="#15803d" size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

