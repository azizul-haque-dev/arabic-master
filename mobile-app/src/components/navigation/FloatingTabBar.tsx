import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import type { Tabs } from "expo-router";
import {
  BarChart3,
  BookOpen,
  House,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const BAR_HEIGHT = 66;
const HAS_LIQUID_GLASS = isLiquidGlassAvailable();

/** Only these routes appear in the bar; any other route in the group stays hidden. */
const TAB_ITEMS: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: "Home", icon: House },
  learn: { label: "Learn", icon: BookOpen },
  progress: { label: "Progress", icon: BarChart3 },
  profile: { label: "Profile", icon: UserRound },
};

function useBottomOffset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom - 6, 14);
}

/** Bottom padding a scrollable tab screen needs so content clears the floating bar. */
export function useTabBarClearance() {
  return useBottomOffset() + BAR_HEIGHT + 24;
}

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const bottom = useBottomOffset();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Android resizes the window for the keyboard, which would lift the bar over it.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  const items = (
    <View
      className="flex-row items-center px-1.5"
      style={{ height: BAR_HEIGHT }}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const item = TAB_ITEMS[route.name];
        if (!item) return null;

        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const Icon = item.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => undefined);
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options?.tabBarAccessibilityLabel ?? item.label}
            className="flex-1 items-center justify-center"
            style={{ height: BAR_HEIGHT }}
          >
            {({ pressed }) => (
              <>
                <View
                  className={`h-8 w-14 items-center justify-center rounded-full ${
                    focused ? "bg-primary" : ""
                  }`}
                  style={{ transform: [{ scale: pressed ? 0.9 : 1 }] }}
                >
                  <Icon
                    size={20}
                    color={focused ? "#ffffff" : "#6b7280"}
                    strokeWidth={focused ? 2.4 : 2}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  className={`mt-1 text-[11px] ${
                    focused
                      ? "font-label-sm font-bold text-primary-strong"
                      : "font-label-sm font-medium text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 16, right: 16, bottom }}
    >
      <BarSurface>{items}</BarSurface>
    </View>
  );
}

function BarSurface({ children }: { children: ReactNode }) {
  const shadow = {
    borderRadius: 32,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  };

  if (HAS_LIQUID_GLASS) {
    return (
      <View style={shadow}>
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          style={{ borderRadius: 32, overflow: "hidden" }}
        >
          {children}
        </GlassView>
      </View>
    );
  }

  return (
    <View
      style={[
        shadow,
        {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "rgba(229,231,235,0.9)",
        },
      ]}
    >
      {children}
    </View>
  );
}
