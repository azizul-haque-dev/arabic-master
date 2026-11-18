import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Layers,
  Lock,
  MessageSquareText,
  MessagesSquare,
  Play,
  RotateCcw,
  Search,
  SearchX,
  Trophy,
  Volume2,
  X,
  Zap,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ProgressBar,
  ProgressRing,
  SectionHeader,
  TabScreen,
  tapFeedback,
} from "@/components/learning/primitives";
import {
  continueLesson,
  getLearningContentItem,
  getLearningProduct,
  isLearnSection,
  learner,
  skillProgress,
  type LearnSection,
  type LearningContentItemFixture,
  type LearningLessonFixture,
  type LearningProductFixture,
  type LearningSectionFixture,
} from "@/features/learning/data";

type FilterType = "all" | "in-progress" | "completed" | "free" | "premium";

type CurrentLessonLocation = {
  section: LearningSectionFixture;
  lesson: LearningLessonFixture;
  levelId?: string;
};

type LearningSelection = {
  productId: LearnSection;
  sectionId: string;
  lessonId: string | null;
};

type DemoLessonState = {
  key: string;
  itemIndex: number;
  isComplete: boolean;
};

const SECTION_METADATA: Record<
  string,
  {
    arabic: string;
    iconBg: string;
    iconColor: string;
    chipBg: string;
    chipText: string;
  }
> = {
  // Words
  "words-greetings": {
    arabic: "تَحِيَّات",
    iconBg: "bg-amber-100",
    iconColor: "#d97706",
    chipBg: "bg-amber-50",
    chipText: "text-amber-800",
  },
  "words-numbers": {
    arabic: "أَرْقَام",
    iconBg: "bg-emerald-100",
    iconColor: "#059669",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-800",
  },
  "words-food": {
    arabic: "طَعَام",
    iconBg: "bg-orange-100",
    iconColor: "#ea580c",
    chipBg: "bg-orange-50",
    chipText: "text-orange-800",
  },
  "words-shopping": {
    arabic: "تَسَوُّق",
    iconBg: "bg-teal-100",
    iconColor: "#0d9488",
    chipBg: "bg-teal-50",
    chipText: "text-teal-800",
  },
  "words-transport": {
    arabic: "مُوَاصَلَات",
    iconBg: "bg-sky-100",
    iconColor: "#0284c7",
    chipBg: "bg-sky-50",
    chipText: "text-sky-800",
  },
  // Sentences
  "sentences-greetings": {
    arabic: "تَحِيَّات",
    iconBg: "bg-amber-100",
    iconColor: "#d97706",
    chipBg: "bg-amber-50",
    chipText: "text-amber-800",
  },
  "sentences-introductions": {
    arabic: "تَعَارُف",
    iconBg: "bg-purple-100",
    iconColor: "#7c3aed",
    chipBg: "bg-purple-50",
    chipText: "text-purple-800",
  },
  "sentences-food": {
    arabic: "طَعَام",
    iconBg: "bg-orange-100",
    iconColor: "#ea580c",
    chipBg: "bg-orange-50",
    chipText: "text-orange-800",
  },
  "sentences-shopping": {
    arabic: "تَسَوُّق",
    iconBg: "bg-teal-100",
    iconColor: "#0d9488",
    chipBg: "bg-teal-50",
    chipText: "text-teal-800",
  },
  "sentences-transport": {
    arabic: "مُوَاصَلَات",
    iconBg: "bg-sky-100",
    iconColor: "#0284c7",
    chipBg: "bg-sky-50",
    chipText: "text-sky-800",
  },
  // Conversations
  "conversations-greetings": {
    arabic: "تَعَارُف",
    iconBg: "bg-indigo-100",
    iconColor: "#4f46e5",
    chipBg: "bg-indigo-50",
    chipText: "text-indigo-800",
  },
  "conversations-shopping": {
    arabic: "فِي السُّوق",
    iconBg: "bg-teal-100",
    iconColor: "#0d9488",
    chipBg: "bg-teal-50",
    chipText: "text-teal-800",
  },
  "conversations-restaurant": {
    arabic: "فِي المَقْهَى",
    iconBg: "bg-rose-100",
    iconColor: "#e11d48",
    chipBg: "bg-rose-50",
    chipText: "text-rose-800",
  },
  "conversations-travel": {
    arabic: "السَّفَر",
    iconBg: "bg-blue-100",
    iconColor: "#2563eb",
    chipBg: "bg-blue-50",
    chipText: "text-blue-800",
  },
};

const TRACKS: {
  id: LearnSection;
  title: string;
  arabicTitle: string;
  icon: typeof BookOpen;
  subtitle: string;
}[] = [
  {
    id: "words",
    title: "Words",
    arabicTitle: "كَلِمَات",
    icon: BookOpen,
    subtitle: "Vocabulary",
  },
  {
    id: "sentences",
    title: "Sentences",
    arabicTitle: "جُمَل",
    icon: MessageSquareText,
    subtitle: "Daily phrases",
  },
  {
    id: "conversations",
    title: "Conversations",
    arabicTitle: "مُحَادَثَات",
    icon: MessagesSquare,
    subtitle: "Real conversations",
  },
];

function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}

function getSectionLessons(
  section: LearningSectionFixture,
): LearningLessonFixture[] {
  return (
    section.levels?.flatMap((level) => level.lessons) ?? section.lessons ?? []
  );
}

function doesSectionMatchFilter(
  section: LearningSectionFixture,
  filter: FilterType,
): boolean {
  if (filter === "all") return true;
  const lessons = getSectionLessons(section);
  if (filter === "in-progress") {
    return lessons.some((l) => l.status === "current");
  }
  if (filter === "completed") {
    return lessons.length > 0 && lessons.every((l) => l.status === "done");
  }
  if (filter === "free") {
    return lessons.some((l) => l.access === "free");
  }
  if (filter === "premium") {
    return lessons.some((l) => l.access === "premium");
  }
  return true;
}

function getLessonStageLabel(index: number, levelTitle?: string): string {
  if (levelTitle) {
    if (levelTitle.toLowerCase().includes("beginner")) {
      return `Basic ${index + 1}`;
    }
    if (levelTitle.toLowerCase().includes("elementary")) {
      return `Elementary ${Math.max(1, index - 2)}`;
    }
  }

  const stages = [
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Elementary 1",
    "Elementary 2",
    "Intermediate",
  ];
  return stages[index] ?? `Lesson ${index + 1}`;
}

export default function LearnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const productId = isLearnSection(params.section) ? params.section : "words";

  const [selection, setSelection] = useState<LearningSelection | null>(null);
  const [searchState, setSearchState] = useState({
    productId: "words" as LearnSection,
    value: "",
  });
  const [filter, setFilter] = useState<FilterType>("all");
  const [demoLessonState, setDemoLessonState] =
    useState<DemoLessonState | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [lockedModalLesson, setLockedModalLesson] =
    useState<LearningLessonFixture | null>(null);

  const query = searchState.productId === productId ? searchState.value : "";
  const product = getLearningProduct(productId);
  const activeSelection = selection?.productId === productId ? selection : null;
  const selectedSection = product.sections.find(
    (section) => section.id === activeSelection?.sectionId,
  );

  // Directly retrieve all lessons for this section without beginner/elementary tabs
  const detailLessons = selectedSection
    ? getSectionLessons(selectedSection)
    : [];

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Filter sections by search and active category filter
  const visibleSections = product.sections
    .filter((section) => sectionMatchesQuery(section, normalizedQuery))
    .filter((section) => doesSectionMatchFilter(section, filter));

  const visibleLessons = detailLessons.filter((lesson) =>
    lessonMatchesQuery(lesson, normalizedQuery),
  );

  const selectedLesson = visibleLessons.find(
    (lesson) => lesson.id === activeSelection?.lessonId,
  );
  const lessonPlayerKey = selectedLesson
    ? `${productId}:${selectedLesson.id}`
    : "";
  const activeDemoLesson =
    demoLessonState?.key === lessonPlayerKey
      ? demoLessonState
      : { key: lessonPlayerKey, itemIndex: 0, isComplete: false };

  const lessonItems =
    selectedLesson?.sampleItemIds.map(getLearningContentItem) ?? [];
  const conversationItems =
    selectedLesson?.sampleItemIds
      .map(getLearningContentItem)
      .filter(isConversationLine) ?? [];
  const hasValidConversationItems =
    conversationItems.length > 0 &&
    conversationItems.length === selectedLesson?.sampleItemIds.length;
  const expectedItemKind = productId === "words" ? "word" : "sentence";
  const hasValidLessonItems =
    lessonItems.length > 0 &&
    lessonItems.every((item) => item?.kind === expectedItemKind);
  const currentLessonItem = hasValidLessonItems
    ? lessonItems[activeDemoLesson.itemIndex]
    : undefined;

  const selectProduct = (nextProduct: LearnSection) => {
    if (nextProduct === productId) return;
    tapFeedback();
    setSelection(null);
    setSearchState({ productId: nextProduct, value: "" });
    setFilter("all");
    router.setParams({ section: nextProduct });
  };

  const openSection = (section: LearningSectionFixture) => {
    tapFeedback();
    setSelection({
      productId,
      sectionId: section.id,
      lessonId: null,
    });
    setSearchState({ productId, value: "" });
  };

  const openCurrentLesson = (location: CurrentLessonLocation) => {
    tapFeedback();
    setSelection({
      productId,
      sectionId: location.section.id,
      lessonId: location.lesson.id,
    });
    setDemoLessonState({
      key: `${productId}:${location.lesson.id}`,
      itemIndex: 0,
      isComplete: false,
    });
    setSearchState({ productId, value: "" });
  };

  const openSelectedLesson = (lesson: LearningLessonFixture) => {
    tapFeedback();
    if (lesson.access === "premium" && lesson.status === "locked") {
      setLockedModalLesson(lesson);
      return;
    }
    setSelection((current) =>
      current?.productId === productId
        ? { ...current, lessonId: lesson.id }
        : current,
    );
    setDemoLessonState({
      key: `${productId}:${lesson.id}`,
      itemIndex: 0,
      isComplete: false,
    });
  };

  const goBackToSections = () => {
    tapFeedback();
    setSelection(null);
    setSearchState({ productId, value: "" });
  };

  // Mobile Hardware/Gesture Native Back Button handler
  // Navigates hierarchically: Locked Modal -> Lesson Player -> Topic Roadmap -> Main Explorer
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // 1. If locked Pro modal is open, dismiss it
        if (lockedModalLesson) {
          tapFeedback();
          setLockedModalLesson(null);
          return true;
        }

        // 2. If inside an active lesson (Word, Sentence, Conversation), return to recent view (Topic Roadmap)
        if (selectedLesson) {
          tapFeedback();
          setSelection((current) =>
            current?.productId === productId
              ? { ...current, lessonId: null }
              : current,
          );
          return true;
        }

        // 3. If inside a topic section roadmap, return to recent view (Main Topics Explorer)
        if (selectedSection) {
          tapFeedback();
          goBackToSections();
          return true;
        }

        // 4. If search query is currently entered, clear it
        if (isSearching) {
          tapFeedback();
          setSearchState({ productId, value: "" });
          return true;
        }

        // 5. At root learn explorer: allow system back behavior (e.g. exit tab / go back to Home)
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [
      lockedModalLesson,
      selectedLesson,
      selectedSection,
      isSearching,
      productId,
    ]),
  );

  const currentLesson = findCurrentLesson(product);
  const shouldShowEmptySearch = isSearching
    ? selectedSection
      ? visibleLessons.length === 0
      : visibleSections.length === 0
    : visibleSections.length === 0 && filter !== "all";

  // Skill progress matching the active track
  const activeSkill = skillProgress.find((s) => s.id === productId);

  return (
    <TabScreen>
      {/* 1. Header Bar: Profile Status & Badges (ONLY ON MAIN EXPLORER) */}
      {!selectedSection ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between min-h-[36px]">
            <View className="h-9 justify-center">
              <Text
                className="font-headline-sm text-[26px] font-bold tracking-tight text-on-surface"
                style={{ includeFontPadding: false }}
              >
                Learn Arabic
              </Text>
            </View>

            {/* Hearts and Pro Action - vertically aligned at the exact same level as title */}
            <View className="flex-row items-center gap-2 h-9">
              <Pressable
                onPress={() => {
                  tapFeedback();
                  Alert.alert(
                    "Hearts",
                    `You have ${learner.hearts} of ${learner.maxHearts} hearts. Hearts protect your practice streak!`,
                  );
                }}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${learner.hearts} of ${learner.maxHearts} hearts`}
                className="h-9 flex-row items-center justify-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 active:bg-rose-100"
              >
                <Heart size={15} color="#e11d48" fill="#e11d48" />
                <Text className="font-label-md text-sm font-bold text-rose-700">
                  {learner.hearts}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  tapFeedback();
                  router.navigate("/curriculum");
                }}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Open Pro curriculum"
                className="h-9 flex-row items-center justify-center gap-1.5 rounded-full border border-secondary/40 bg-secondary-subtle px-3 active:bg-secondary/30"
              >
                <Crown size={15} color="#b45309" strokeWidth={2.4} />
                <Text className="font-label-md text-sm font-bold text-on-secondary-subtle">
                  Pro
                </Text>
              </Pressable>
            </View>
          </View>

          <Text className="font-body-sm text-sm leading-5 text-on-surface-variant">
            Master essential vocabulary, sentences & conversations
          </Text>
        </View>
      ) : null}

      {/* 2. Breathable Learning Tracks Deck (Words, Sentences, Conversations) */}
      {!selectedSection ? (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Learning Tracks
            </Text>
            {activeSkill ? (
              <View className="rounded-full bg-primary-subtle px-3 py-1 border border-primary/20">
                <Text className="font-label-sm text-xs font-bold text-primary-strong">
                  {activeSkill.done}/{activeSkill.total} Mastered (
                  {Math.round((activeSkill.done / activeSkill.total) * 100)}%)
                </Text>
              </View>
            ) : null}
          </View>

          {/* Horizontally breathable track cards with fixed comfortable widths */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 6 }}
            accessibilityRole="tablist"
          >
            {TRACKS.map((track) => {
              const selected = track.id === productId;
              const Icon = track.icon;
              const trackSkill = skillProgress.find((s) => s.id === track.id);
              const progressPct = trackSkill
                ? Math.round((trackSkill.done / trackSkill.total) * 100)
                : 0;

              return (
                <Pressable
                  key={track.id}
                  onPress={() => selectProduct(track.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  aria-selected={selected}
                  style={{ width: 162 }}
                  className={`rounded-2xl border p-4 transition-all shadow-xs ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-outline-variant/70 bg-white active:bg-surface-container-low"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-xl ${
                        selected ? "bg-white/20" : "bg-primary-subtle"
                      }`}
                    >
                      <Icon
                        size={18}
                        color={selected ? "#ffffff" : "#15803d"}
                        strokeWidth={2.4}
                      />
                    </View>
                    <View
                      className={`rounded-md px-2 py-0.5 ${
                        selected ? "bg-white/20" : "bg-primary-subtle"
                      }`}
                    >
                      <Text
                        className={`font-arabic-display text-xs font-semibold ${
                          selected ? "text-white" : "text-primary"
                        }`}
                      >
                        {track.arabicTitle}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    className={`mt-3 font-headline-sm text-base font-bold ${
                      selected ? "text-white" : "text-on-surface"
                    }`}
                  >
                    {track.title}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className={`mt-0.5 font-body-sm text-xs ${
                      selected ? "text-white/80" : "text-on-surface-variant"
                    }`}
                  >
                    {track.subtitle}
                  </Text>

                  <View className="mt-3 gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-label-sm text-xs font-medium ${
                          selected ? "text-white/90" : "text-on-surface-variant"
                        }`}
                      >
                        Progress
                      </Text>
                      <Text
                        className={`font-label-sm text-xs font-bold ${
                          selected ? "text-white" : "text-primary-strong"
                        }`}
                      >
                        {progressPct}%
                      </Text>
                    </View>
                    <View
                      className={`h-2 w-full overflow-hidden rounded-full ${
                        selected ? "bg-white/30" : "bg-surface-container"
                      }`}
                    >
                      <View
                        className={`h-full rounded-full ${
                          selected ? "bg-white" : "bg-primary"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* 3. Section Detail View or Main Explorer */}
      {selectedSection ? (
        <View className="gap-5">
          {selectedLesson &&
          productId === "conversations" &&
          selectedLesson.access === "free" &&
          selectedLesson.status !== "locked" ? (
            <ConversationExperience
              sectionTitle={selectedSection.title}
              lesson={selectedLesson}
              items={conversationItems}
              hasValidItems={hasValidConversationItems}
              onBack={() =>
                setSelection((current) =>
                  current?.productId === productId
                    ? { ...current, lessonId: null }
                    : current,
                )
              }
            />
          ) : selectedLesson &&
            (productId === "words" || productId === "sentences") &&
            selectedLesson.access === "free" &&
            selectedLesson.status !== "locked" ? (
            <WordSentenceExperience
              productTitle={product.title}
              sectionTitle={selectedSection.title}
              lesson={selectedLesson}
              item={currentLessonItem}
              itemIndex={activeDemoLesson.itemIndex}
              itemCount={lessonItems.length}
              itemKind={expectedItemKind}
              isComplete={activeDemoLesson.isComplete}
              hasValidItems={hasValidLessonItems}
              onPrevious={() =>
                setDemoLessonState((current) =>
                  current?.key === lessonPlayerKey
                    ? {
                        ...current,
                        itemIndex: Math.max(0, current.itemIndex - 1),
                      }
                    : current,
                )
              }
              onNext={() => {
                setDemoLessonState((current) => {
                  if (current?.key !== lessonPlayerKey) return current;
                  const nextIndex = current.itemIndex + 1;
                  if (nextIndex >= lessonItems.length) {
                    successHaptic();
                    return { ...current, isComplete: true };
                  }
                  tapFeedback();
                  return { ...current, itemIndex: nextIndex };
                });
              }}
              onRestart={() => {
                tapFeedback();
                setDemoLessonState({
                  key: lessonPlayerKey,
                  itemIndex: 0,
                  isComplete: false,
                });
              }}
              onBack={() =>
                setSelection((current) =>
                  current?.productId === productId
                    ? { ...current, lessonId: null }
                    : current,
                )
              }
            />
          ) : (
            <>
              {/* Dedicated Topic Page Header (Clean, no Learn Arabic / Heart / Pro) */}
              <View className="flex-row items-start justify-between gap-3 pt-1">
                <View className="flex-1 flex-row items-start gap-3.5">
                  <Pressable
                    onPress={goBackToSections}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Back to all topics"
                    className="mt-0.5 h-11 w-11 items-center justify-center rounded-full border border-outline-variant/70 bg-white active:bg-surface-container-low shadow-2xs"
                  >
                    <ArrowLeft size={19} color="#15803d" strokeWidth={2.4} />
                  </Pressable>

                  <View className="flex-1 min-w-0 pr-2">
                    <Text
                      accessibilityRole="header"
                      className="font-headline-sm text-2xl font-bold tracking-tight text-on-surface"
                    >
                      {selectedSection.title}
                    </Text>
                    <Text className="mt-1 font-body-sm text-sm leading-5 text-on-surface-variant">
                      {selectedSection.description}
                    </Text>
                  </View>
                </View>

                {SECTION_METADATA[selectedSection.id]?.arabic ? (
                  <View className="rounded-xl border border-primary/20 bg-primary-subtle px-3.5 py-1.5">
                    <Text className="font-arabic-display text-base font-semibold text-primary-strong">
                      {SECTION_METADATA[selectedSection.id].arabic}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Topic Progress Card */}
              <View className="overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-xs">
                <LinearGradient
                  colors={["#f0fdf4", "#ffffff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 20 }}
                >
                  <View className="flex-row items-center gap-4">
                    <ProgressRing
                      value={
                        detailLessons.length > 0
                          ? detailLessons.filter((l) => l.status === "done")
                              .length / detailLessons.length
                          : 0
                      }
                      size={52}
                      strokeWidth={5}
                      color="#15803d"
                    >
                      <Text className="font-label-sm text-xs font-bold text-primary-strong">
                        {Math.round(
                          (detailLessons.filter((l) => l.status === "done")
                            .length /
                            Math.max(detailLessons.length, 1)) *
                            100,
                        )}
                        %
                      </Text>
                    </ProgressRing>

                    <View className="flex-1 gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-label-md text-base font-bold text-on-surface">
                          Topic Progress
                        </Text>
                        <Text className="font-label-sm text-xs font-semibold text-primary-strong">
                          {
                            detailLessons.filter((l) => l.status === "done")
                              .length
                          }{" "}
                          of {detailLessons.length} Completed
                        </Text>
                      </View>

                      <ProgressBar
                        value={
                          detailLessons.length > 0
                            ? detailLessons.filter((l) => l.status === "done")
                                .length / detailLessons.length
                            : 0
                        }
                        label="Topic progress"
                        height={8}
                        fillColor="#15803d"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Unified Lesson Roadmap List (NO Beginner/Elementary tabs; direct progression with Basic 1, Basic 2...) */}
              <View className="gap-3.5">
                <SectionHeader
                  title="Lessons"
                  subtitle={`${visibleLessons.length} progressive lesson${visibleLessons.length === 1 ? "" : "s"}`}
                />

                <View className="gap-3.5">
                  {visibleLessons.map((lesson, index) => {
                    const parentLevel = selectedSection.levels?.find((lvl) =>
                      lvl.lessons.some((l) => l.id === lesson.id),
                    );
                    const stageLabel = getLessonStageLabel(
                      index,
                      parentLevel?.title,
                    );

                    return (
                      <RoadmapLessonCard
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        stageLabel={stageLabel}
                        itemKind={expectedItemKind}
                        onPress={() => openSelectedLesson(lesson)}
                      />
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </View>
      ) : (
        <>
          {/* 4. "Continue Learning" / Active Focus Hero Card with generous, spacious padding */}
          {currentLesson && !isSearching && filter === "all" ? (
            <Pressable
              onPress={() => openCurrentLesson(currentLesson)}
              accessibilityRole="button"
              accessibilityLabel={`Resume lesson: ${currentLesson.lesson.title}`}
              className="overflow-hidden rounded-3xl border border-primary/30 bg-white active:scale-[0.99] shadow-xs"
            >
              <LinearGradient
                colors={["#f0fdf4", "#ffffff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 22 }}
              >
                <View style={{ gap: 14 }}>
                  {/* Top Tag Row */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
                      <View className="h-2 w-2 rounded-full bg-primary" />
                      <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary-strong">
                        Continue Learning
                      </Text>
                    </View>

                    <View className="rounded-xl border border-primary/20 bg-primary-subtle px-3 py-1">
                      <Text className="font-arabic-display text-base font-bold text-primary-strong">
                        {continueLesson.arabic || "سُوق"}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Section */}
                  <View style={{ gap: 4 }}>
                    <Text className="font-headline-sm text-xl font-bold text-on-surface">
                      {currentLesson.lesson.title}
                    </Text>
                    <Text className="font-body-sm text-sm text-on-surface-variant">
                      {currentLesson.section.title} ·{" "}
                      {currentLesson.lesson.total} interactive items
                    </Text>
                  </View>

                  {/* Progress Bar Row */}
                  <View style={{ gap: 6 }}>
                    <View className="flex-row items-center justify-between">
                      <Text className="font-label-sm text-xs font-semibold text-primary-strong">
                        Lesson Progress
                      </Text>
                      <Text className="font-label-sm text-xs font-medium text-on-surface-variant">
                        {Math.round(
                          (currentLesson.lesson.completed /
                            currentLesson.lesson.total) *
                            100,
                        )}
                        % complete
                      </Text>
                    </View>
                    <ProgressBar
                      value={
                        currentLesson.lesson.completed /
                        currentLesson.lesson.total
                      }
                      label="Lesson progress"
                      height={8}
                      fillColor="#15803d"
                    />
                  </View>

                  {/* Bottom Action Row */}
                  <View className="flex-row items-center justify-between pt-1">
                    <View className="flex-row items-center gap-1.5">
                      <Zap size={16} color="#d97706" />
                      <Text className="font-label-sm text-xs font-medium text-on-surface-variant">
                        +20 XP upon completion
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 shadow-xs">
                      <Play size={14} color="#ffffff" fill="#ffffff" />
                      <Text className="font-label-md text-sm font-bold text-white">
                        Resume
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          ) : null}

          {/* 5. Modern Search & Quick Filter Bar */}
          <View className="gap-3">
            <View className="h-13 flex-row items-center rounded-2xl border border-outline-variant/70 bg-white px-4 shadow-2xs">
              <Search
                size={19}
                color={searchFocused ? "#15803d" : "#6b7280"}
                strokeWidth={2.2}
              />
              <TextInput
                value={query}
                onChangeText={(value) => {
                  setSearchState({ productId, value });
                  setSelection((current) =>
                    current?.productId === productId
                      ? { ...current, lessonId: null }
                      : current,
                  );
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={`Search ${product.title.toLowerCase()}...`}
                placeholderTextColor="#9ca3af"
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search lessons"
                className="ml-3 flex-1 font-body-md text-base text-on-surface"
              />
              {query.length > 0 ? (
                <Pressable
                  onPress={() => {
                    setSearchState({ productId, value: "" });
                    setSelection((current) =>
                      current?.productId === productId
                        ? { ...current, lessonId: null }
                        : current,
                    );
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="h-8 w-8 items-center justify-center rounded-full bg-surface-container"
                >
                  <X size={14} color="#4b5563" strokeWidth={2.5} />
                </Pressable>
              ) : null}
            </View>

            {/* Quick Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {(
                [
                  { id: "all", label: "All Topics" },
                  { id: "in-progress", label: "In Progress" },
                  { id: "completed", label: "Completed" },
                  { id: "free", label: "Free" },
                  { id: "premium", label: "Pro 👑" },
                ] as const
              ).map((chip) => {
                const active = filter === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => {
                      tapFeedback();
                      setFilter(chip.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={`rounded-full px-4 py-2 border ${
                      active
                        ? "border-primary bg-primary-subtle"
                        : "border-outline-variant/60 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-label-md text-sm font-semibold ${
                        active
                          ? "text-primary-strong"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 6. Topic Sections Deck */}
          <View className="gap-3">
            <SectionHeader
              title={isSearching ? "Matching Topics" : "Explore Topics"}
              subtitle={`${visibleSections.length} topic${visibleSections.length === 1 ? "" : "s"} available`}
            />

            {visibleSections.length > 0 ? (
              <View className="gap-3.5">
                {visibleSections.map((section) => (
                  <ModernSectionCard
                    key={section.id}
                    section={section}
                    onPress={() => openSection(section)}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {/* 7. Pro Curriculum Pathway Banner with generous right-side padding and flex wrapping */}
          {!isSearching && filter === "all" ? (
            <Pressable
              onPress={() => {
                tapFeedback();
                router.navigate("/curriculum");
              }}
              accessibilityRole="button"
              accessibilityLabel="View full Pro curriculum"
              className="overflow-hidden rounded-3xl border border-secondary/40 bg-white shadow-xs active:scale-[0.99]"
            >
              <LinearGradient
                colors={["#fef3c7", "#fffbeb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 20, paddingVertical: 18 }}
              >
                <View className="flex-row items-center justify-between gap-4">
                  {/* Left icon and text container with flex-1 and generous right padding */}
                  <View className="flex-1 min-w-0 flex-row items-center gap-3.5 pr-3">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 flex-shrink-0 shadow-xs">
                      <Crown size={22} color="#ffffff" strokeWidth={2.4} />
                    </View>
                    <View className="flex-1 min-w-0 gap-1">
                      <Text
                        numberOfLines={1}
                        className="font-headline-sm text-base font-bold text-on-surface"
                      >
                        Structured Day-by-Day Path
                      </Text>
                      <Text className="font-body-sm text-sm leading-5 text-on-surface-variant">
                        Follow our guided curriculum with daily goals
                      </Text>
                    </View>
                  </View>

                  {/* Right circular chevron pill - never touching text */}
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-200/80 flex-shrink-0">
                    <ChevronRight size={18} color="#b45309" strokeWidth={2.4} />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          ) : null}

          {/* Empty Search / Filter State */}
          {shouldShowEmptySearch ? (
            <ModernEmptyState
              query={query.trim()}
              isFiltered={filter !== "all"}
              onReset={() => {
                setSearchState({ productId, value: "" });
                setFilter("all");
              }}
            />
          ) : null}
        </>
      )}

      {/* 8. Pro Locked Content Preview Modal */}
      {lockedModalLesson ? (
        <ProLockedModal
          lesson={lockedModalLesson}
          onClose={() => setLockedModalLesson(null)}
          onExplorePro={() => {
            setLockedModalLesson(null);
            router.navigate("/curriculum");
          }}
        />
      ) : null}
    </TabScreen>
  );
}

// ==========================================
// Subcomponents with Senior UX Polish
// ==========================================

function ModernSectionCard({
  section,
  onPress,
}: {
  section: LearningSectionFixture;
  onPress: () => void;
}) {
  const Icon = section.icon;
  const lessons = getSectionLessons(section);
  const completed = lessons.filter((l) => l.status === "done").length;
  const meta = SECTION_METADATA[section.id] ?? {
    arabic: "",
    iconBg: "bg-primary-subtle",
    iconColor: "#15803d",
    chipBg: "bg-primary-subtle",
    chipText: "text-primary-strong",
  };
  const progressRatio = lessons.length > 0 ? completed / lessons.length : 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open topic ${section.title}`}
      className="overflow-hidden rounded-3xl border border-outline-variant/70 bg-white p-5 active:scale-[0.99] active:bg-surface-container-low shadow-xs"
    >
      <View className="flex-row items-start gap-4">
        <View
          className={`h-13 w-13 items-center justify-center rounded-2xl ${meta.iconBg}`}
        >
          <Icon size={24} color={meta.iconColor} strokeWidth={2.2} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              numberOfLines={1}
              className="font-headline-sm text-lg font-bold text-on-surface"
            >
              {section.title}
            </Text>
            {meta.arabic ? (
              <View className={`rounded-lg px-2.5 py-1 ${meta.chipBg}`}>
                <Text
                  className={`font-arabic-display text-sm font-semibold ${meta.chipText}`}
                >
                  {meta.arabic}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            numberOfLines={2}
            className="mt-1 font-body-sm text-sm leading-5 text-on-surface-variant"
          >
            {section.description}
          </Text>

          {/* Progress row */}
          <View className="mt-3.5 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <ProgressBar
                value={progressRatio}
                label={`${section.title} progress`}
                height={6}
                fillColor={meta.iconColor}
              />
            </View>
            <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
              {completed}/{lessons.length} lessons
            </Text>
          </View>
        </View>

        <ChevronRight
          size={20}
          color="#9ca3af"
          strokeWidth={2}
          className="self-center"
        />
      </View>
    </Pressable>
  );
}

function RoadmapLessonCard({
  lesson,
  index,
  stageLabel,
  itemKind,
  onPress,
}: {
  lesson: LearningLessonFixture;
  index: number;
  stageLabel: string;
  itemKind: "word" | "sentence";
  onPress: () => void;
}) {
  const isDone = lesson.status === "done";
  const isCurrent = lesson.status === "current";
  const isLocked = lesson.status === "locked";
  const isPro = lesson.access === "premium";
  const countLabel =
    itemKind === "word"
      ? `${lesson.total ? Math.max(lesson.total, 10) : 10} words`
      : `${lesson.total} sentences`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${stageLabel}: ${lesson.title}, ${lesson.status}`}
      className={`rounded-3xl border p-5 transition-all shadow-xs ${
        isCurrent
          ? "border-2 border-primary bg-white shadow-sm"
          : isDone
            ? "border-outline-variant/70 bg-white"
            : "border-outline-variant/40 bg-surface-container-low/60 opacity-90"
      }`}
    >
      {/* 1. Top Meta Row: Stage Label Pill on Left, Status Badge on Right */}
      <View className="flex-row items-center justify-between">
        <View
          className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${
            isCurrent
              ? "bg-primary"
              : isDone
                ? "bg-primary-subtle border border-primary/20"
                : "bg-surface-container"
          }`}
        >
          {isDone ? <Check size={12} color="#15803d" strokeWidth={3} /> : null}
          <Text
            className={`font-label-sm text-xs font-bold ${
              isCurrent
                ? "text-white"
                : isDone
                  ? "text-primary-strong"
                  : "text-on-surface-variant"
            }`}
          >
            {stageLabel}
          </Text>
        </View>

        {/* Status Indicator Chip */}
        <View className="flex-row items-center gap-2">
          {isDone ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-200">
              <Text className="font-label-sm text-[11px] font-bold text-emerald-700">
                Completed
              </Text>
            </View>
          ) : isCurrent ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 border border-primary/20">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <Text className="font-label-sm text-[11px] font-bold text-primary-strong">
                Current
              </Text>
            </View>
          ) : isPro ? (
            <View className="flex-row items-center gap-1 rounded-full bg-secondary-subtle px-2.5 py-1 border border-amber-200">
              <Crown size={12} color="#b45309" strokeWidth={2.4} />
              <Text className="font-label-sm text-[11px] font-bold text-on-secondary-subtle">
                PRO
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-container px-2.5 py-1">
              <Lock size={12} color="#737373" strokeWidth={2.4} />
              <Text className="font-label-sm text-[11px] font-medium text-on-surface-variant">
                Locked
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Middle Content: Lesson Title + Objective + Spacious Badges */}
      <View className="mt-3.5 gap-1.5">
        <Text
          className={`font-headline-sm text-lg font-bold leading-6 ${
            isLocked ? "text-on-surface-variant" : "text-on-surface"
          }`}
        >
          {lesson.title}
        </Text>

        {lesson.objective ? (
          <Text className="font-body-sm text-sm leading-5 text-on-surface-variant">
            {lesson.objective}
          </Text>
        ) : null}

        {/* Dedicated stats chips - giving words count & XP full breathing room */}
        <View className="flex-row items-center gap-2.5 pt-1">
          <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1">
            <BookOpen size={13} color="#15803d" />
            <Text className="font-label-sm text-xs font-semibold text-primary-strong">
              {countLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-200/50">
            <Zap size={13} color="#d97706" />
            <Text className="font-label-sm text-xs font-semibold text-amber-800">
              +20 XP
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Bottom Action CTA: Breathable, dedicated, never crowded */}
      <View className="mt-4 border-t border-outline-variant/30 pt-3.5">
        {isCurrent ? (
          <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-4 shadow-xs">
            <Play size={14} color="#ffffff" fill="#ffffff" />
            <Text className="font-label-md text-sm font-bold text-white">
              Start Lesson
            </Text>
          </View>
        ) : isDone ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Check size={14} color="#15803d" strokeWidth={2.4} />
              <Text className="font-label-sm text-xs font-medium text-primary-strong">
                Lesson completed
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 rounded-full border border-primary/30 bg-primary-subtle px-3.5 py-1.5">
              <RotateCcw size={13} color="#15803d" />
              <Text className="font-label-sm text-xs font-bold text-primary-strong">
                Review
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Lock size={13} color="#9ca3af" strokeWidth={2.2} />
              <Text className="font-label-sm text-xs text-on-surface-variant">
                {isPro ? "Unlock with Pro" : "Complete previous lesson to unlock"}
              </Text>
            </View>

            <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-container">
              <ChevronRight size={14} color="#9ca3af" strokeWidth={2.2} />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function WordSentenceExperience({
  productTitle,
  sectionTitle,
  lesson,
  item,
  itemIndex,
  itemCount,
  itemKind,
  isComplete,
  hasValidItems,
  onPrevious,
  onNext,
  onRestart,
  onBack,
}: {
  productTitle: string;
  sectionTitle: string;
  lesson: LearningLessonFixture;
  item: LearningContentItemFixture | undefined;
  itemIndex: number;
  itemCount: number;
  itemKind: "word" | "sentence";
  isComplete: boolean;
  hasValidItems: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onBack: () => void;
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [targetLang, setTargetLang] = useState<"en" | "bn">("en");
  const [activeDetailTab, setActiveDetailTab] = useState<"examples" | "forms">(
    "examples",
  );
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(
    null,
  );

  const playArabicAudio = () => {
    tapFeedback();
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1200);
  };

  const playSentenceAudio = (idx: number) => {
    tapFeedback();
    setPlayingSentenceIdx(idx);
    setTimeout(() => {
      setPlayingSentenceIdx(null);
    }, 1400);
  };

  if (!hasValidItems) {
    return (
      <View className="gap-3 rounded-2xl border border-error/30 bg-error-container p-5">
        <Text className="font-label-lg text-base font-bold text-on-error-container">
          Content Unavailable
        </Text>
        <Text className="font-body-sm text-sm leading-5 text-on-error-container">
          This sample does not have valid items. Tap below to return to the
          roadmap.
        </Text>
        <Pressable
          onPress={onBack}
          className="mt-2 self-start rounded-full bg-white px-4 py-2"
        >
          <Text className="font-label-md text-sm font-bold text-error">
            Back to lessons
          </Text>
        </Pressable>
      </View>
    );
  }

  if (isComplete) {
    return (
      <View className="items-center gap-4 rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Trophy size={32} color="#d97706" strokeWidth={2.2} />
        </View>

        <View className="items-center gap-1.5">
          <View className="rounded-full bg-amber-50 px-3.5 py-1">
            <Text className="font-label-sm text-xs font-bold text-amber-700">
              +20 XP EARNED ⭐
            </Text>
          </View>
          <Text className="mt-1 font-headline-sm text-2xl font-bold text-on-surface">
            MashaAllah! Complete!
          </Text>
          <Text className="text-center font-body-sm text-sm leading-6 text-on-surface-variant">
            You successfully completed all {itemCount} {itemKind} items in{" "}
            {lesson.title}.
          </Text>
        </View>

        <View className="w-full gap-3 pt-2">
          <Pressable
            onPress={onRestart}
            accessibilityRole="button"
            className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-outline-variant/80 bg-white px-4 active:bg-surface-container-low"
          >
            <RotateCcw size={18} color="#15803d" />
            <Text className="font-label-md text-base font-bold text-primary-strong">
              Review Again
            </Text>
          </Pressable>

          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            className="min-h-12 items-center justify-center rounded-full bg-primary px-4 active:bg-primary-strong"
          >
            <Text className="font-label-md text-base font-bold text-white">
              Back to Roadmap
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Active translation based on targetLang (single language shown at a time)
  const isEn = targetLang === "en";
  const activeMeaning = isEn ? item?.meaningEn : item?.meaningBn;
  const activeWhenToUse = isEn ? item?.whenToUseEn : item?.whenToUseBn;
  const activeFeminine = isEn ? item?.feminineEn : item?.feminineBn;

  const hasExamples = Boolean(
    item?.exampleSentences && item.exampleSentences.length > 0,
  );
  const hasVariants = Boolean(
    item?.grammaticalVariants && item.grammaticalVariants.length > 0,
  );
  const hasExtraDetails = hasExamples || hasVariants;
  const currentTab =
    activeDetailTab === "forms" && !hasVariants
      ? "examples"
      : activeDetailTab === "examples" && !hasExamples
        ? "forms"
        : activeDetailTab;

  return (
    <View className="gap-4 pb-4">
      {/* 1. Top Bar: Exit Button, Progress Bar & Language Toggle (EN | BN) */}
      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to lesson roadmap"
          className="h-10 flex-row items-center gap-1.5 rounded-full border border-outline-variant/70 bg-white px-3.5 active:bg-surface-container-low shadow-2xs"
        >
          <ChevronLeft size={18} color="#15803d" strokeWidth={2.4} />
          <Text className="font-label-md text-xs font-bold text-primary-strong">
            Roadmap
          </Text>
        </Pressable>

        {/* Progress in the middle */}
        <View className="flex-1 px-1">
          <ProgressBar
            value={(itemIndex + 1) / itemCount}
            label="Lesson progress"
            height={8}
            fillColor="#15803d"
          />
        </View>

        {/* Language Target Mode Selector: EN (default) vs BN */}
        <View className="flex-row items-center rounded-full border border-outline-variant/80 bg-white p-0.5 shadow-2xs">
          <Pressable
            onPress={() => {
              tapFeedback();
              setTargetLang("en");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isEn }}
            className={`rounded-full px-2.5 py-1 ${
              isEn ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-label-sm text-xs font-bold ${
                isEn ? "text-white" : "text-on-surface-variant"
              }`}
            >
              EN
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              tapFeedback();
              setTargetLang("bn");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: !isEn }}
            className={`rounded-full px-2.5 py-1 ${
              !isEn ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-label-sm text-xs font-bold ${
                !isEn ? "text-white" : "text-on-surface-variant"
              }`}
            >
              BN
            </Text>
          </Pressable>
        </View>
      </View>

      {item ? (
        <View className="gap-4">
          {/* 2. Hero Interactive Arabic Word Card (Clean, spacious, unnested) */}
          <View className="overflow-hidden rounded-3xl border border-outline-variant/70 bg-white shadow-xs">
            <LinearGradient
              colors={["#f0fdf4", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.4 }}
              style={{ padding: 22 }}
            >
              {/* Card Meta Row (NO sparkles, NO AI badge) */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <View className="rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
                    <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary-strong">
                      {item.wordType ||
                        (itemKind === "word" ? "Word" : "Sentence")}
                    </Text>
                  </View>
                  {item.category ? (
                    <Text className="font-label-sm text-xs font-medium text-on-surface-variant">
                      · {item.category}
                    </Text>
                  ) : null}
                </View>

                <Text className="font-label-sm text-xs font-semibold text-on-surface-variant">
                  {itemIndex + 1} of {itemCount}
                </Text>
              </View>

              {/* Arabic Calligraphy Center Stage (Glorious & Large) */}
              <View className="items-center py-6">
                <Text
                  className="text-center font-arabic-display text-[46px] font-bold leading-[72px] text-on-surface"
                  style={{ writingDirection: "rtl" }}
                >
                  {item.arabic}
                </Text>

                {/* Transliteration badge - fresh emerald, generous padding, never touching borders */}
                <View className="mt-3 min-h-[42px] px-6 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 items-center justify-center">
                  <Text
                    className="font-label-lg text-base font-bold tracking-wide text-emerald-800"
                    style={{ includeFontPadding: false }}
                  >
                    {item.transliteration}
                  </Text>
                </View>

                {/* Arabic Audio Playback Button - vertically spacious with generous padding */}
                <Pressable
                  onPress={playArabicAudio}
                  accessibilityRole="button"
                  accessibilityLabel="Listen to Arabic pronunciation"
                  className={`mt-5 min-h-[56px] px-7 py-3.5 flex-row items-center justify-center gap-2.5 rounded-full border transition-all ${
                    isPlayingAudio
                      ? "border-primary bg-primary shadow-sm"
                      : "border-primary/30 bg-primary-subtle active:scale-95"
                  }`}
                >
                  <Volume2
                    size={22}
                    color={isPlayingAudio ? "#ffffff" : "#15803d"}
                    strokeWidth={2.4}
                  />
                  <Text
                    className={`font-label-lg text-base font-bold ${
                      isPlayingAudio ? "text-white" : "text-primary-strong"
                    }`}
                  >
                    {isPlayingAudio ? "Playing..." : "Listen Arabic"}
                  </Text>
                </Pressable>
              </View>

              {/* Meaning (Direct on card, NO nested border, spacious & large) */}
              <View className="mt-4 items-center border-t border-outline-variant/30 pt-5">
                <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {isEn ? "Meaning" : "অর্থ"}
                </Text>
                <Text className="mt-1.5 text-center font-headline-sm text-2xl font-bold text-on-surface">
                  {activeMeaning}
                </Text>
              </View>

              {/* When to Use / Context (Integrated Callout Box) */}
              {activeWhenToUse ? (
                <View className="mt-5 rounded-2xl bg-surface-container-low/70 p-4 border border-outline-variant/40">
                  <View className="flex-row items-center gap-1.5">
                    <Compass size={15} color="#15803d" strokeWidth={2.4} />
                    <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary-strong">
                      {isEn ? "When to use" : "ব্যবহারের ক্ষেত্র"}
                    </Text>
                  </View>

                  <Text className="mt-2 font-body-sm text-sm leading-5 text-on-surface">
                    {activeWhenToUse}
                  </Text>

                  {/* Feminine note / gender variation if applicable */}
                  {activeFeminine ? (
                    <View className="mt-3 pt-2.5 border-t border-outline-variant/30 flex-row items-start gap-1.5">
                      <Text className="font-label-sm text-xs font-bold text-primary-strong">
                        {isEn ? "Female:" : "স্ত্রীলিঙ্গ:"}
                      </Text>
                      <Text className="flex-1 font-body-sm text-xs leading-4 text-on-surface-variant">
                        {activeFeminine}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </LinearGradient>
          </View>

          {/* 3. Deep Dive Explorer: Segmented View for Examples & Forms */}
          {hasExtraDetails ? (
            <View className="rounded-3xl border border-outline-variant/70 bg-white p-5 shadow-xs">
              {/* Segmented Tab Header */}
              <View className="flex-row items-center rounded-2xl bg-surface-container-low p-1">
                {hasExamples ? (
                  <Pressable
                    onPress={() => {
                      tapFeedback();
                      setActiveDetailTab("examples");
                    }}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl ${
                      currentTab === "examples" ? "bg-white shadow-2xs" : ""
                    }`}
                  >
                    <MessageSquareText
                      size={15}
                      color={currentTab === "examples" ? "#15803d" : "#6b7280"}
                    />
                    <Text
                      className={`font-label-md text-sm font-bold ${
                        currentTab === "examples"
                          ? "text-primary-strong"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {isEn
                        ? `Examples (${item.exampleSentences?.length ?? 0})`
                        : `উদাহরণ (${item.exampleSentences?.length ?? 0})`}
                    </Text>
                  </Pressable>
                ) : null}

                {hasVariants ? (
                  <Pressable
                    onPress={() => {
                      tapFeedback();
                      setActiveDetailTab("forms");
                    }}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl ${
                      currentTab === "forms" ? "bg-white shadow-2xs" : ""
                    }`}
                  >
                    <Layers
                      size={15}
                      color={currentTab === "forms" ? "#4f46e5" : "#6b7280"}
                    />
                    <Text
                      className={`font-label-md text-sm font-bold ${
                        currentTab === "forms"
                          ? "text-indigo-900"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {isEn
                        ? `Forms (${item.grammaticalVariants?.length ?? 0})`
                        : `রূপসমূহ (${item.grammaticalVariants?.length ?? 0})`}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {/* Tab Content */}
              {currentTab === "examples" && hasExamples ? (
                <View className="mt-4 gap-3">
                  {item.exampleSentences?.map((sent, idx) => (
                    <View
                      key={idx}
                      className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/30 p-4"
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <Text
                          className="flex-1 font-arabic-display text-xl font-bold leading-8 text-on-surface"
                          style={{ writingDirection: "rtl" }}
                        >
                          {sent.arabic}
                        </Text>
                        <Pressable
                          onPress={() => playSentenceAudio(idx)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel="Listen to example sentence"
                          className={`h-9 w-9 items-center justify-center rounded-full ${
                            playingSentenceIdx === idx
                              ? "bg-primary"
                              : "bg-primary-subtle active:scale-95"
                          }`}
                        >
                          <Volume2
                            size={16}
                            color={
                              playingSentenceIdx === idx
                                ? "#ffffff"
                                : "#15803d"
                            }
                          />
                        </Pressable>
                      </View>
                      <Text className="mt-1 font-label-md text-sm font-semibold text-primary">
                        {sent.transliteration}
                      </Text>
                      <Text className="mt-1 font-body-sm text-sm leading-5 text-on-surface">
                        {isEn ? sent.meaningEn : sent.meaningBn}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : currentTab === "forms" && hasVariants ? (
                <View className="mt-4 gap-2.5">
                  {item.grammaticalVariants?.map((variant, idx) => (
                    <View
                      key={idx}
                      className="flex-row items-center justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-low/30 p-3.5"
                    >
                      <View className="gap-0.5">
                        <Text className="font-label-sm text-xs font-bold uppercase tracking-wider text-primary-strong">
                          {variant.form}
                        </Text>
                        <Text className="font-body-sm text-sm text-on-surface">
                          {isEn ? variant.meaningEn : variant.meaningBn}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text
                          className="font-arabic-display text-xl font-bold text-on-surface"
                          style={{ writingDirection: "rtl" }}
                        >
                          {variant.arabic}
                        </Text>
                        {variant.transliteration ? (
                          <Text className="font-label-sm text-xs text-on-surface-variant">
                            {variant.transliteration}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* 4. Navigation Actions (Previous / Next / Complete) - Big, prominent, generous padding */}
          <View className="mt-4 flex-row items-center gap-3">
            <Pressable
              onPress={onPrevious}
              disabled={itemIndex === 0}
              accessibilityRole="button"
              accessibilityLabel="Previous item"
              className={`min-h-[58px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-outline-variant/70 bg-white px-4 py-4 ${
                itemIndex === 0
                  ? "opacity-40"
                  : "active:bg-surface-container-low"
              }`}
            >
              <ChevronLeft size={20} color="#15803d" strokeWidth={2.4} />
              <Text className="font-label-lg text-base font-bold text-primary-strong">
                Previous
              </Text>
            </Pressable>

            <Pressable
              onPress={onNext}
              accessibilityRole="button"
              accessibilityLabel={
                itemIndex === itemCount - 1 ? "Complete Lesson" : "Next item"
              }
              className="min-h-[58px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 active:bg-primary-strong shadow-sm"
            >
              <Text className="font-label-lg text-base font-bold text-white tracking-wide">
                {itemIndex === itemCount - 1
                  ? "Complete Lesson"
                  : itemKind === "sentence"
                    ? "Next Sentence"
                    : "Next Word"}
              </Text>
              <ChevronRight size={20} color="#ffffff" strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ConversationExperience({
  sectionTitle,
  lesson,
  items,
  hasValidItems,
  onBack,
}: {
  sectionTitle: string;
  lesson: LearningLessonFixture;
  items: LearningContentItemFixture[];
  hasValidItems: boolean;
  onBack: () => void;
}) {
  const [showTranslations, setShowTranslations] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const playLineAudio = (id: string) => {
    tapFeedback();
    setPlayingId(id);
    setTimeout(() => setPlayingId(null), 1200);
  };

  return (
    <View className="gap-4">
      {/* Header bar */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to conversation topics"
          className="flex-row items-center gap-1.5 rounded-full border border-outline-variant/70 bg-white px-3.5 py-2 active:bg-surface-container-low"
        >
          <ChevronLeft size={18} color="#15803d" strokeWidth={2.4} />
          <Text className="font-label-md text-sm font-bold text-primary-strong">
            Roadmap
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            tapFeedback();
            setShowTranslations((v) => !v);
          }}
          className="flex-row items-center gap-1.5 rounded-full border border-outline-variant/70 bg-white px-3.5 py-2 active:bg-surface-container-low"
        >
          {showTranslations ? (
            <EyeOff size={15} color="#6b7280" />
          ) : (
            <Eye size={15} color="#15803d" />
          )}
          <Text className="font-label-md text-sm font-semibold text-on-surface">
            {showTranslations ? "Hide Translation" : "Show Translation"}
          </Text>
        </Pressable>
      </View>

      <View className="gap-1">
        <Text className="font-label-sm text-sm font-bold text-primary">
          Conversation · {sectionTitle}
        </Text>
        <Text className="font-headline-sm text-2xl font-bold text-on-surface">
          {lesson.title}
        </Text>
      </View>

      {/* Chat Dialogue Bubbles */}
      <View className="gap-3.5">
        {items.map((item, index) => {
          const isLayla = item.speaker?.includes("Layla") || index % 2 === 0;
          const isPlaying = playingId === item.id;

          return (
            <View
              key={item.id}
              className={`gap-1.5 ${isLayla ? "items-start" : "items-end"}`}
            >
              {/* Speaker Label */}
              <Text className="px-2 font-label-sm text-xs font-bold text-on-surface-variant">
                {item.speaker || (isLayla ? "Person A" : "Person B")}
              </Text>

              {/* Speech Bubble */}
              <View
                className={`max-w-[88%] rounded-3xl p-4.5 border ${
                  isLayla
                    ? "rounded-tl-xs border-primary/20 bg-primary-subtle"
                    : "rounded-tr-xs border-outline-variant/80 bg-white shadow-xs"
                }`}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text
                    className="flex-1 font-arabic-display text-xl font-bold leading-8 text-on-surface"
                    style={{ writingDirection: "rtl" }}
                  >
                    {item.arabic}
                  </Text>
                  <Pressable
                    onPress={() => playLineAudio(item.id)}
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      isPlaying ? "bg-primary" : "bg-white"
                    }`}
                  >
                    <Volume2
                      size={16}
                      color={isPlaying ? "#ffffff" : "#15803d"}
                    />
                  </Pressable>
                </View>

                {showTranslations ? (
                  <View className="mt-2.5 gap-1 border-t border-outline-variant/40 pt-2.5">
                    <Text className="font-label-md text-sm font-semibold text-primary-strong">
                      {item.transliteration}
                    </Text>
                    <Text className="font-body-sm text-sm text-on-surface">
                      {item.meaningBn}
                    </Text>
                    <Text className="font-body-sm text-xs text-on-surface-variant">
                      {item.meaningEn}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {/* Completed CTA */}
      <View className="mt-4 rounded-3xl border border-primary/30 bg-white p-5 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Check size={22} color="#ffffff" strokeWidth={3} />
          </View>
          <View className="flex-1">
            <Text className="font-label-lg text-base font-bold text-on-surface">
              Conversation Reviewed
            </Text>
            <Text className="font-body-sm text-sm text-on-surface-variant">
              Practice speaking both roles aloud to master fluency!
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onBack}
          className="mt-4 min-h-12 items-center justify-center rounded-full bg-primary active:bg-primary-strong"
        >
          <Text className="font-label-md text-sm font-bold text-white">
            Return to Topics
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ModernEmptyState({
  query,
  isFiltered,
  onReset,
}: {
  query: string;
  isFiltered: boolean;
  onReset: () => void;
}) {
  return (
    <View className="items-center rounded-3xl border border-outline-variant/70 bg-white px-6 py-8">
      <View className="h-13 w-13 items-center justify-center rounded-full bg-surface-container-low">
        <SearchX size={24} color="#6b7280" strokeWidth={2} />
      </View>
      <Text className="mt-3 font-headline-sm text-lg font-bold text-on-surface">
        {query ? `No results for "${query}"` : "No matching topics"}
      </Text>
      <Text className="mt-1 text-center font-body-sm text-sm text-on-surface-variant">
        {isFiltered
          ? "Try switching your filter or clearing the search query."
          : "Try searching with a different keyword or explore another track."}
      </Text>
      <Pressable
        onPress={onReset}
        className="mt-4 rounded-full bg-primary px-5 py-2.5 active:bg-primary-strong"
      >
        <Text className="font-label-md text-sm font-bold text-white">
          Reset Filters
        </Text>
      </Pressable>
    </View>
  );
}

function ProLockedModal({
  lesson,
  onClose,
  onExplorePro,
}: {
  lesson: LearningLessonFixture;
  onClose: () => void;
  onExplorePro: () => void;
}) {
  return (
    <View className="rounded-3xl border border-secondary/40 bg-white p-6 shadow-lg">
      <View className="flex-row items-start justify-between">
        <View className="h-13 w-13 items-center justify-center rounded-2xl bg-amber-100">
          <Crown size={26} color="#d97706" strokeWidth={2.4} />
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-surface-container-low"
        >
          <X size={16} color="#4b5563" />
        </Pressable>
      </View>

      <Text className="mt-3 font-headline-sm text-xl font-bold text-on-surface">
        Unlock with Arabic Master Pro
      </Text>
      <Text className="mt-1.5 font-body-sm text-sm leading-6 text-on-surface-variant">
        “{lesson.title}” is part of our comprehensive Pro library. Get unlimited
        hearts, native audio dialogues, and full structured courses.
      </Text>

      <View className="mt-5 gap-2.5">
        <Pressable
          onPress={onExplorePro}
          className="min-h-12 items-center justify-center rounded-full bg-amber-500 px-4 active:bg-amber-600 shadow-xs"
        >
          <Text className="font-label-md text-base font-bold text-white">
            Explore Pro Curriculum
          </Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          className="min-h-11 items-center justify-center rounded-full border border-outline-variant/70 bg-white active:bg-surface-container-low"
        >
          <Text className="font-label-md text-sm font-bold text-on-surface-variant">
            Maybe Later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Helpers for queries
function isConversationLine(
  item: LearningContentItemFixture | undefined,
): item is LearningContentItemFixture {
  return item?.kind === "conversation-line" && Boolean(item.speaker?.trim());
}

function findCurrentLesson(
  product: LearningProductFixture,
): CurrentLessonLocation | undefined {
  for (const section of product.sections) {
    for (const level of section.levels ?? []) {
      const lesson = level.lessons.find((item) => item.status === "current");
      if (lesson) return { section, levelId: level.id, lesson };
    }

    const lesson = section.lessons?.find((item) => item.status === "current");
    if (lesson) return { section, lesson };
  }
}

function sectionMatchesQuery(
  section: LearningSectionFixture,
  query: string,
): boolean {
  if (!query) return true;
  const lessonText = getSectionLessons(section).flatMap((lesson) => [
    lesson.title,
    lesson.objective ?? "",
  ]);
  const levelText = section.levels?.map((level) => level.title) ?? [];
  const meta = SECTION_METADATA[section.id]?.arabic ?? "";
  return [section.title, section.description, meta, ...levelText, ...lessonText]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function lessonMatchesQuery(
  lesson: LearningLessonFixture,
  query: string,
): boolean {
  return (
    !query ||
    `${lesson.title} ${lesson.objective ?? ""}`.toLowerCase().includes(query)
  );
}
