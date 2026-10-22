import { BookOpen, Sparkles } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type LearningEntry = {
  arabic: string;
  pronunciation: string;
  translation: string;
  category: string;
};

type LearningLibraryScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  entries: LearningEntry[];
};

export function LearningLibraryScreen({
  eyebrow,
  title,
  description,
  entries,
}: LearningLibraryScreenProps) {
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
              {eyebrow === "SPEAKING PRACTICE" ? (
                <Sparkles size={21} color="#15803d" />
              ) : (
                <BookOpen size={21} color="#15803d" />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.2px] text-primary">
                {eyebrow}
              </Text>
              <Text className="mt-1 font-headline-sm text-xl font-bold text-on-surface">
                {title}
              </Text>
            </View>
          </View>

          <Text className="font-body-sm text-sm leading-5 text-on-surface-variant">
            {description}
          </Text>

          <View className="rounded-3xl bg-primary-strong p-5">
            <Text className="font-label-md text-xs font-bold uppercase tracking-wider text-primary-subtle">
              YOUR LEARNING PATH
            </Text>
            <Text className="mt-2 font-headline-sm text-lg font-bold text-white">
              Everyday Arabic, one step at a time.
            </Text>
            <Text className="mt-1 font-body-sm text-sm leading-5 text-primary-subtle">
              Keep your daily streak going with a few useful phrases.
            </Text>
            <View className="mt-4 flex-row items-center gap-2">
              <View className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                <View className="h-full w-[70%] rounded-full bg-white" />
              </View>
              <Text className="font-label-md text-xs font-bold text-white">
                7 / 10 min
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-headline-sm text-lg font-bold text-on-surface">
              Today’s picks
            </Text>
            {entries.map((entry, index) => (
              <View
                key={`${entry.arabic}-${entry.category}`}
                className="rounded-2xl border border-outline-variant/70 bg-white p-4"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <View className="self-start rounded-full bg-primary-subtle px-2.5 py-1">
                      <Text className="font-label-sm text-[10px] font-semibold text-primary-strong">
                        {entry.category}
                      </Text>
                    </View>
                    <Text
                      className="mt-3 font-arabic-display text-[28px] leading-[42px] text-on-surface"
                      style={{ writingDirection: "rtl" }}
                    >
                      {entry.arabic}
                    </Text>
                    <Text className="mt-0.5 font-label-lg text-sm font-bold text-on-surface">
                      {entry.pronunciation}
                    </Text>
                    <Text className="mt-1 font-body-sm text-sm text-on-surface-variant">
                      {entry.translation}
                    </Text>
                  </View>
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-low">
                    <Text className="font-label-md text-xs font-bold text-on-surface-variant">
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
