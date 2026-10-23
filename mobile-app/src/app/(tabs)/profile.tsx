import { Text, View, Pressable } from "react-native";
import { User, Flame, Star, Heart, Settings, Shield, ChevronRight, LogOut } from "lucide-react-native";
import { TabScreen, tapFeedback, SectionHeader } from "@/components/learning/primitives";
import { learner } from "@/features/learning/data";

export default function ProfileScreen() {
  return (
    <TabScreen>
      {/* Profile Header */}
      <View className="items-center gap-2 pt-2">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary shadow-sm">
          <Text className="font-headline-sm text-2xl font-bold text-white">
            {learner.initials}
          </Text>
        </View>
        <Text className="font-headline-sm text-xl font-bold text-on-surface">
          {learner.fullName}
        </Text>
        <Text className="font-body-sm text-xs text-on-surface-variant">
          {learner.email}
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
        </View>
      </View>
    </TabScreen>
  );
}
