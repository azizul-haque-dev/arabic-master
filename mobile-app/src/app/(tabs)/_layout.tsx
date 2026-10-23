import { Tabs } from "expo-router";

import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";

export default function LearningTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarAccessibilityLabel: "Home" }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: "Learn", tabBarAccessibilityLabel: "Learn" }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarAccessibilityLabel: "Progress" }}
      />
      <Tabs.Screen name="curriculum" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarAccessibilityLabel: "Profile" }}
      />
      {/* Legacy routes: kept only as redirects into Learn, never shown in the bar. */}
      <Tabs.Screen name="words" options={{ href: null }} />
      <Tabs.Screen name="sentences" options={{ href: null }} />
      <Tabs.Screen name="conversations" options={{ href: null }} />
    </Tabs>
  );
}
