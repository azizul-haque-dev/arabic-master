import { useState } from "react";
import { Alert, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Flame, Star, Heart, Settings, Shield, ChevronRight, LogOut } from "lucide-react-native";
import { TabScreen, tapFeedback, SectionHeader } from "@/components/learning/primitives";
import { learner } from "@/features/learning/data";
import { useAuth } from "@/features/auth/auth-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/");
    } catch {
      router.replace("/");
      Alert.alert(
        "Signed out on this device",
        "The server could not be reached to revoke the session. Sign in again when you are online.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <TabScreen>
      {/* Profile Header */}
      <View className="items-center gap-2 pt-2">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary shadow-sm">
          <Text className="font-headline-sm text-2xl font-bold text-white">
            {(user?.fullName ?? learner.fullName)
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <Text className="font-headline-sm text-xl font-bold text-on-surface">
          {user?.fullName ?? learner.fullName}
        </Text>
        <Text className="font-body-sm text-xs text-on-surface-variant">
          {user?.email ?? learner.email}
        </Text>
      </View>

      {/* Stats Summary */}
      <View className="flex-row gap-3 rounded-2xl border border-outline-variant/70 bg-white p-4">
        <View className="flex-1 items-center">
          <Flame size={18} color="#ea580c" />
          <Text className="mt-1 font-headline-sm text-base font-bold text-on-surface">
            {learner.streakDays} days
          </Text>
          <Text className="font-label-sm text-[10px] text-on-surface-variant">
            Streak
          </Text>
        </View>
        <View className="w-px bg-outline-variant/60" />
        <View className="flex-1 items-center">
          <Star size={18} color="#d97706" />
          <Text className="mt-1 font-headline-sm text-base font-bold text-on-surface">
            {learner.xp}
          </Text>
          <Text className="font-label-sm text-[10px] text-on-surface-variant">
            Total XP
          </Text>
        </View>
        <View className="w-px bg-outline-variant/60" />
        <View className="flex-1 items-center">
          <Heart size={18} color="#e11d48" />
          <Text className="mt-1 font-headline-sm text-base font-bold text-on-surface">
            {learner.hearts}
          </Text>
          <Text className="font-label-sm text-[10px] text-on-surface-variant">
            Hearts
          </Text>
        </View>
      </View>

      {/* Settings list */}
      <View className="gap-2">
        <SectionHeader title="Account & Preferences" />
        <View className="overflow-hidden rounded-2xl border border-outline-variant/70 bg-white">
          <Pressable
            onPress={tapFeedback}
            className="flex-row items-center justify-between p-4 border-b border-outline-variant/40 active:bg-surface-container-low"
          >
            <View className="flex-row items-center gap-3">
              <Settings size={18} color="#4b5563" />
              <Text className="font-label-md text-sm font-semibold text-on-surface">
                Learning Preferences
              </Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </Pressable>

          <Pressable
            onPress={tapFeedback}
            className="flex-row items-center justify-between p-4 active:bg-surface-container-low"
          >
            <View className="flex-row items-center gap-3">
              <Shield size={18} color="#4b5563" />
              <Text className="font-label-md text-sm font-semibold text-on-surface">
                Privacy & Security
              </Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </Pressable>

          {user ? (
            <Pressable
              onPress={handleSignOut}
              disabled={isSigningOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              className="flex-row items-center justify-between p-4 active:bg-surface-container-low"
            >
              <View className="flex-row items-center gap-3">
                <LogOut size={18} color="#b91c1c" />
                <Text className="font-label-md text-sm font-semibold text-red-700">
                  Sign out
                </Text>
              </View>
              {isSigningOut ? (
                <ActivityIndicator size="small" color="#b91c1c" />
              ) : (
                <ChevronRight size={18} color="#9ca3af" />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </TabScreen>
  );
}
