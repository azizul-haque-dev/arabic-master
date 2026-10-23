import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  Check,
  Flame,
  Heart,
  Star,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  ProgressBar,
  ProgressRing,
  SectionHeader,
  StatStrip,
  TabScreen,
  tapFeedback,
} from "@/components/learning/primitives";
import { LearningAccessBadge } from "@/components/learning/LearningUI";
import {
  continueLesson,
  goalMinutesFrom,
  learningProducts,
  learner,
  situations,
  weeklyMinutes,
  wordOfTheDay,
  type LearnSection,
  type LearningProductId,
} from "@/features/learning/data";
import { useOnboardingStore } from "@/features/onboarding/store";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const practiceDuration = useOnboardingStore((s) => s.practiceDuration);
  const goals = useOnboardingStore((s) => s.goals);
  const [savedWord, setSavedWord] = useState(false);

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const todayIndex = (now.getDay() + 6) % 7; // Monday = 0

  const goalMinutes = goalMinutesFrom(practiceDuration);
  const goalRatio = Math.min(learner.todayMinutes / goalMinutes, 1);
  const minutesLeft = Math.max(goalMinutes - learner.todayMinutes, 0);
  const lessonRatio = continueLesson.completed / continueLesson.total;

  // Surface situations that match the learner's onboarding goals first.
  const recommended = [...situations].sort(
    (a, b) =>
      Number(goals.includes(b.goalId)) - Number(goals.includes(a.goalId)),
  );

  const openLearn = (section: LearnSection) => {
    tapFeedback();
    router.navigate({ pathname: "/learn", params: { section } });
  };

  const openProduct = (productId: LearningProductId) => {
    tapFeedback();
    if (productId === "curriculum") {
      router.navigate("/curriculum");
      return;
    }

    router.navigate({ pathname: "/learn", params: { section: productId } });
  };

  return (
    <TabScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            tapFeedback();
            router.navigate("/profile");
          }}
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          className="flex-row items-center gap-3"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="font-label-lg text-base font-bold text-white">
              {learner.firstName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="font-body-sm text-xs text-on-surface-variant">
              {greeting}
            </Text>
            <Text className="font-headline-sm text-xl font-bold tracking-tight text-on-surface">
              {learner.firstName}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            tapFeedback();
            Alert.alert(
              "You're all caught up",
              "There are no new notifications right now.",
            );
          }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          className="h-11 w-11 items-center justify-center rounded-full border border-outline-variant/70 bg-white active:bg-surface-container-low"
        >
          <Bell size={19} color="#374151" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Streak · XP · Hearts */}
      <StatStrip
        items={[
          {
            key: "streak",
            icon: <Flame size={20} color="#ea580c" fill="#fed7aa" />,
            value: `${learner.streakDays}`,
            label: "day streak",
          },
          {
            key: "xp",
            icon: <Star size={20} color="#d97706" fill="#fde68a" />,
            value: `${learner.xp}`,
            label: "total XP",
          },
          {
            key: "hearts",
            icon: <Heart size={20} color="#e11d48" fill="#fecdd3" />,
            value: `${learner.hearts}`,
            label: "hearts",
          },
        ]}
      />

      {/* Today's goal */}
      <View className="rounded-3xl border border-outline-variant/70 bg-white p-4">
        <View className="flex-row items-center gap-4">
          <ProgressRing value={goalRatio} size={84} strokeWidth={9}>
            <Text className="font-headline-sm text-xl font-bold leading-6 text-on-surface">
              {learner.todayMinutes}
            </Text>
            <Text className="font-body-sm text-[10px] text-on-surface-variant">
              of {goalMinutes} min
            </Text>
          </ProgressRing>
          <View className="flex-1">
            <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.2px] text-primary">
              Today's goal
            </Text>
            <Text className="mt-1 font-headline-sm text-lg font-bold leading-6 text-on-surface">
              {minutesLeft > 0
                ? `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} to go`
                : "Goal complete"}
            </Text>
            <Text className="mt-0.5 font-body-sm text-xs leading-4 text-on-surface-variant">
              {minutesLeft > 0
                ? "One short lesson will get you there."
                : "Great work. Anything extra is a bonus."}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row justify-between border-t border-outline-variant/60 pt-3.5">
          {WEEK_DAYS.map((day, index) => {
            const isToday = index === todayIndex;
            const isFuture = index > todayIndex;
            const metGoal =
              !isFuture && (weeklyMinutes[index] ?? 0) >= goalMinutes;
            return (
              <View
                key={`${day}-${index}`}
                className="items-center gap-1.5"
                accessible
                accessibilityLabel={`${day}${isToday ? ", today" : ""}${
                  metGoal ? ", goal met" : ""
                }`}
              >
                <Text
                  className={`font-label-sm text-[11px] ${
                    isToday
                      ? "font-bold text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  {day}
                </Text>
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full ${
                    metGoal
                      ? "bg-primary"
                      : isToday
                        ? "border-2 border-primary bg-primary-subtle"
                        : isFuture
                          ? "border border-dashed border-outline-variant"
                          : "bg-surface-container"
                  }`}
                >
                  {metGoal ? (
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Continue learning */}
      <View className="gap-3">
        <SectionHeader
          title="Continue learning"
          actionLabel="All lessons"
          onAction={() => openLearn(continueLesson.section)}
        />
        <LinearGradient
          colors={["#14532d", "#166534", "#15803d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, overflow: "hidden" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-white/15 px-3 py-1">
              <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1px] text-white">
                {continueLesson.situation} · {continueLesson.lessonLabel}
              </Text>
            </View>
            <Text className="font-label-md text-xs font-bold text-primary-subtle">
              {Math.round(lessonRatio * 100)}%
            </Text>
          </View>

          <View className="mt-4 flex-row items-center gap-4">
            <View className="flex-1">
              <Text className="font-headline-sm text-xl font-bold leading-7 text-white">
                {continueLesson.title}
              </Text>
              <Text className="mt-1 font-body-sm text-xs text-primary-subtle">
                {continueLesson.completed} of {continueLesson.total} words
                learned
              </Text>
            </View>
            <View className="h-[72px] w-[72px] items-center justify-center rounded-3xl border border-white/15 bg-white/10">
              <Text
                className="font-arabic-display text-[28px] text-white"
                style={{ writingDirection: "rtl" }}
              >
                {continueLesson.arabic}
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <ProgressBar
              value={lessonRatio}
              label="Lesson progress"
              fillColor="#ffffff"
              trackColor="rgba(255,255,255,0.18)"
              height={6}
            />
          </View>

          <Pressable
            onPress={() => openLearn(continueLesson.section)}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${continueLesson.title}`}
            className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-full bg-white active:bg-primary-subtle"
          >
            <Text className="font-label-lg text-sm font-bold text-primary-strong">
              Continue lesson
            </Text>
            <ArrowRight size={17} color="#14532d" strokeWidth={2.5} />
          </Pressable>
        </LinearGradient>
      </View>

      {/* Learning products */}
      <View className="gap-3">
        <SectionHeader
          title="Explore learning"
          subtitle="Choose a path for today's practice"
        />
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {learningProducts.map((product) => {
            const Icon = product.icon;
            return (
              <Pressable
                key={product.id}
                onPress={() => openProduct(product.id)}
                accessibilityRole="button"
                accessibilityLabel={`${product.title}, ${product.access === "mixed" ? "free and premium" : product.access}. ${product.description}`}
                className="min-h-[164px] w-[48.5%] justify-between rounded-3xl border border-outline-variant/70 bg-white p-3.5 active:bg-surface-container-low"
              >
                <View className="gap-2.5">
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-2xl ${product.tileClass}`}
                  >
                    <Icon
                      size={19}
                      color={product.iconColor}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="font-label-lg text-sm font-bold text-on-surface"
                  >
                    {product.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="font-body-sm text-[11px] leading-4 text-on-surface-variant"
                  >
                    {product.description}
                  </Text>
                </View>
                <LearningAccessBadge access={product.access} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Word of the day */}
      <View className="rounded-3xl border border-outline-variant/70 bg-white p-4">
        <View className="flex-row items-start justify-between">
          <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1.2px] text-primary">
            Word of the day
          </Text>
          <Pressable
            onPress={() => {
              tapFeedback();
              setSavedWord((saved) => !saved);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={savedWord ? "Remove saved word" : "Save word"}
            aria-pressed={savedWord}
            className={`h-9 w-9 items-center justify-center rounded-full ${
              savedWord ? "bg-primary" : "bg-surface-container-low"
            }`}
          >
            {savedWord ? (
              <BookmarkCheck size={17} color="#ffffff" strokeWidth={2.2} />
            ) : (
              <Bookmark size={17} color="#374151" strokeWidth={2} />
            )}
          </Pressable>
        </View>

        <View className="mt-1 flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="font-headline-sm text-2xl font-bold text-on-surface">
              {wordOfTheDay.translation}
            </Text>
            <Text className="mt-0.5 font-label-md text-sm font-semibold text-primary">
              {wordOfTheDay.pronunciation}
            </Text>
          </View>
          <Text
            className="font-arabic-display text-[36px] leading-[54px] text-on-surface"
            style={{ writingDirection: "rtl" }}
          >
            {wordOfTheDay.arabic}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-surface-container-low px-3.5 py-2.5">
          <Text className="font-body-sm text-xs text-on-surface-variant">
            {wordOfTheDay.exampleTranslation}
          </Text>
          <Text
            className="font-arabic-display text-base text-on-surface"
            style={{ writingDirection: "rtl" }}
          >
            {wordOfTheDay.exampleArabic}
          </Text>
        </View>
      </View>

      {/* Recommended */}
      <View className="gap-3">
        <SectionHeader
          title="Recommended for you"
          subtitle="Real situations, step by step"
          actionLabel="See all"
          onAction={() => openLearn("words")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {recommended.map((situation) => {
            const Icon = situation.icon;
            const forYou = goals.includes(situation.goalId);
            return (
              <Pressable
                key={situation.id}
                onPress={() => openLearn("words")}
                accessibilityRole="button"
                accessibilityLabel={`${situation.title}, ${situation.lessons} lessons, ${Math.round(
                  situation.progress * 100,
                )} percent complete`}
                className="w-[152px] rounded-3xl border border-outline-variant/70 bg-white p-4 active:bg-surface-container-low"
              >
                <View className="flex-row items-start justify-between">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary-subtle">
                    <Icon size={18} color="#15803d" strokeWidth={2.2} />
                  </View>
                  {forYou ? (
                    <View className="rounded-full bg-secondary-subtle px-2 py-0.5">
                      <Text className="font-label-sm text-[9px] font-bold text-on-secondary-subtle">
                        FOR YOU
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  className="mt-3 font-arabic-display text-lg text-on-surface-variant"
                  style={{ writingDirection: "rtl" }}
                >
                  {situation.arabic}
                </Text>
                <Text className="font-label-lg text-sm font-bold text-on-surface">
                  {situation.title}
                </Text>
                <Text className="mt-0.5 font-body-sm text-[11px] text-on-surface-variant">
                  {situation.progress > 0
                    ? `${Math.round(situation.progress * 100)}% · ${situation.lessons} lessons`
                    : `${situation.lessons} lessons · New`}
                </Text>
                <View className="mt-3">
                  <ProgressBar
                    value={situation.progress}
                    label={`${situation.title} progress`}
                    height={4}
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </TabScreen>
  );
}
