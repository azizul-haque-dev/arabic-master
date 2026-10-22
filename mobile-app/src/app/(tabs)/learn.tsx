import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  Crown,
  Heart,
  Lock,
  Play,
  Search,
  SearchX,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import {
  ProgressBar,
  SectionHeader,
  TabScreen,
  tapFeedback,
} from "@/components/learning/primitives";
import {
  continueLesson,
  courses,
  getCourse,
  isLearnSection,
  learner,
  type Course,
  type Lesson,
  type LearnSection,
  type Phrase,
} from "@/features/learning/data";

export default function LearnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const [section, setSection] = useState<LearnSection>(
    isLearnSection(params.section) ? params.section : "words",
  );
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Home deep-links here with ?section=… while this tab may already be mounted.
  useEffect(() => {
    if (isLearnSection(params.section)) setSection(params.section);
  }, [params.section]);

  const course = getCourse(section);
  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const phraseResults = isSearching
    ? courses.flatMap((c) =>
        c.phrases
          .filter((p) =>
            [p.arabic, p.pronunciation, p.translation, p.category].some((field) =>
              field.toLowerCase().includes(trimmed),
            ),
          )
          .map((p) => ({ phrase: p, courseTitle: c.title })),
      )
    : [];
  const lessonResults = isSearching
    ? courses.flatMap((c) =>
        c.lessons
          .filter((l) => l.title.toLowerCase().includes(trimmed))
          .map((l) => ({ lesson: l, course: c })),
      )
    : [];

  const selectSection = (next: LearnSection) => {
    if (next === section) return;
    tapFeedback();
    setSection(next);
    router.setParams({ section: next });
  };

  const openLesson = (lesson: Lesson, owner: Course) => {
    tapFeedback();
    if (lesson.status === "locked") {
      Alert.alert(
        lesson.isPro ? "Premium lesson" : "Lesson locked",
        lesson.isPro
          ? "This lesson is available with Arabic Master Pro: full curriculum, advanced conversations and ad-free learning."
          : "Finish the previous lesson to unlock this one.",
        [{ text: lesson.isPro ? "Maybe later" : "Got it", style: "cancel" }],
      );
      return;
    }
    Alert.alert(
      `${owner.title} · ${lesson.title}`,
      "The lesson player is the next screen to be built.",
    );
  };

  return (
    <TabScreen>
      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="font-headline-md text-[28px] font-bold leading-9 tracking-tight text-on-surface"
          >
            Learn Arabic
          </Text>
          <Text className="mt-0.5 font-body-sm text-sm text-on-surface-variant">
            Words → sentences → real conversations.
          </Text>
        </View>
        <View
          accessible
          accessibilityLabel={`${learner.hearts} of ${learner.maxHearts} hearts`}
          className="flex-row items-center gap-1.5 rounded-full border border-outline-variant/70 bg-white px-3 py-2"
        >
          <Heart size={15} color="#e11d48" fill="#fecdd3" />
          <Text className="font-label-md text-sm font-bold text-on-surface">
            {learner.hearts}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View
        className={`h-12 flex-row items-center rounded-2xl border bg-white px-3.5 ${
          searchFocused ? "border-primary" : "border-outline-variant/70"
        }`}
      >
        <Search
          size={18}
          color={searchFocused ? "#15803d" : "#6b7280"}
          strokeWidth={2}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search words, phrases, lessons"
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search lessons"
          className="ml-2.5 flex-1 font-body-md text-[15px] text-on-surface"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="h-6 w-6 items-center justify-center rounded-full bg-surface-container"
          >
            <X size={13} color="#4b5563" strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {isSearching ? (
        <SearchResults
          query={query.trim()}
          phrases={phraseResults}
          lessons={lessonResults}
          onOpenLesson={openLesson}
        />
      ) : (
        <>
          {/* Continue */}
          <Pressable
            onPress={() => selectSection(continueLesson.section)}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${continueLesson.title}`}
            className="flex-row items-center gap-3.5 rounded-3xl border border-outline-variant/70 bg-white p-3.5 active:bg-surface-container-low"
          >
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle">
              <Text
                className="font-arabic-display text-xl text-primary-strong"
                style={{ writingDirection: "rtl" }}
              >
                {continueLesson.arabic}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1px] text-primary">
                Continue · {continueLesson.lessonLabel}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-0.5 font-label-lg text-sm font-bold text-on-surface"
              >
                {continueLesson.title}
              </Text>
              <View className="mt-2">
                <ProgressBar
                  value={continueLesson.completed / continueLesson.total}
                  label="Lesson progress"
                  height={5}
                />
              </View>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Play size={16} color="#ffffff" fill="#ffffff" />
            </View>
          </Pressable>

          {/* Course selector */}
          <View className="gap-3">
            <SectionHeader title="Courses" subtitle="Pick what to practise" />
            <View className="flex-row gap-2.5" accessibilityRole="tablist">
              {courses.map((c) => {
                const selected = c.id === section;
                const Icon = c.icon;
                const done = c.lessons.filter((l) => l.status === "done").length;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => selectSection(c.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${c.title}, ${done} of ${c.lessons.length} lessons done`}
                    className={`flex-1 rounded-3xl border-2 p-3 ${
                      selected
                        ? "border-primary bg-white"
                        : "border-transparent bg-white active:bg-surface-container-low"
                    }`}
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-xl ${c.tileClass}`}
                    >
                      <Icon size={17} color={c.iconColor} strokeWidth={2.2} />
                    </View>
                    <Text
                      numberOfLines={1}
                      className="mt-2.5 font-label-lg text-[13px] font-bold text-on-surface"
                    >
                      {c.title}
                    </Text>
                    <Text className="mt-0.5 font-body-sm text-[11px] text-on-surface-variant">
                      {done}/{c.lessons.length} lessons
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Lesson path */}
          <View className="gap-3">
            <SectionHeader title={course.pathTitle} subtitle={course.subtitle} />
            <View className="rounded-3xl border border-outline-variant/70 bg-white px-4 py-2">
              {course.lessons.map((lesson, index) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isLast={index === course.lessons.length - 1}
                  onPress={() => openLesson(lesson, course)}
                />
              ))}
            </View>
          </View>

          {/* Key phrases */}
          <View className="gap-3">
            <SectionHeader
              title="Key phrases"
              subtitle={`From ${course.title.toLowerCase()} you're learning`}
            />
            <View className="gap-2.5">
              {course.phrases.map((phrase) => (
                <PhraseCard key={`${phrase.arabic}-${phrase.category}`} phrase={phrase} />
              ))}
            </View>
          </View>

          {/* Pro curriculum */}
          <Pressable
            onPress={() => {
              tapFeedback();
              Alert.alert(
                "Arabic Master Pro",
                "The full curriculum, tense course and advanced conversations are coming with Pro.",
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Pro curriculum, locked"
          >
            <LinearGradient
              colors={["#1f2937", "#111827"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 18 }}
            >
              <View className="flex-row items-center gap-3.5">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-secondary/20">
                  <Crown size={20} color="#f59e0b" fill="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="font-label-lg text-sm font-bold text-white">
                    Pro curriculum
                  </Text>
                  <Text className="mt-0.5 font-body-sm text-xs leading-4 text-gray-300">
                    Tense course, advanced conversations and more.
                  </Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Lock size={14} color="#e5e7eb" strokeWidth={2.4} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </>
      )}
    </TabScreen>
  );
}

function LessonRow({
  lesson,
  index,
  isLast,
  onPress,
}: {
  lesson: Lesson;
  index: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const isDone = lesson.status === "done";
  const isCurrent = lesson.status === "current";
  const isLocked = lesson.status === "locked";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${index + 1}, ${lesson.title}, ${
        isDone ? "completed" : isCurrent ? "in progress" : "locked"
      }`}
      className="flex-row gap-3.5 active:opacity-70"
    >
      {/* Timeline node + connector */}
      <View className="items-center">
        <View
          className={`mt-3 h-9 w-9 items-center justify-center rounded-full ${
            isDone
              ? "bg-primary"
              : isCurrent
                ? "border-2 border-primary bg-primary-subtle"
                : "bg-surface-container"
          }`}
        >
          {isDone ? (
            <Check size={16} color="#ffffff" strokeWidth={3} />
          ) : isCurrent ? (
            <Play size={13} color="#15803d" fill="#15803d" />
          ) : (
            <Lock size={14} color="#9ca3af" strokeWidth={2.2} />
          )}
        </View>
        {!isLast ? (
          <View
            className={`w-0.5 flex-1 ${isDone ? "bg-primary/40" : "bg-outline-variant"}`}
          />
        ) : null}
      </View>

      <View
        className={`flex-1 py-3 ${!isLast ? "border-b border-outline-variant/50" : ""}`}
      >
        <View className="flex-row items-center gap-2">
          <Text className="font-label-sm text-[10px] font-bold uppercase tracking-[1px] text-on-surface-variant">
            Lesson {index + 1}
          </Text>
          {lesson.isPro ? (
            <View className="rounded-full bg-secondary-subtle px-1.5 py-0.5">
              <Text className="font-label-sm text-[9px] font-bold text-on-secondary-subtle">
                PRO
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className={`mt-0.5 font-label-lg text-sm font-bold ${
            isLocked ? "text-on-surface-variant" : "text-on-surface"
          }`}
        >
          {lesson.title}
        </Text>
        {isCurrent ? (
          <View className="mt-2 flex-row items-center gap-2">
            <View className="flex-1">
              <ProgressBar
                value={lesson.completed / lesson.total}
                label={`${lesson.title} progress`}
                height={5}
              />
            </View>
            <Text className="font-label-sm text-[11px] font-bold text-primary">
              {lesson.completed}/{lesson.total}
            </Text>
          </View>
        ) : (
          <Text className="mt-0.5 font-body-sm text-xs text-on-surface-variant">
            {isDone
              ? `${lesson.total} / ${lesson.total} completed`
              : `${lesson.total} items`}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function PhraseCard({ phrase, source }: { phrase: Phrase; source?: string }) {
  return (
    <View className="rounded-3xl border border-outline-variant/70 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-primary-subtle px-2.5 py-1">
          <Text className="font-label-sm text-[10px] font-semibold text-primary-strong">
            {phrase.category}
          </Text>
        </View>
        {source ? (
          <Text className="font-label-sm text-[10px] font-semibold text-on-surface-variant">
            {source}
          </Text>
        ) : null}
      </View>
      <Text
        className="mt-3 text-right font-arabic-display text-[26px] leading-[40px] text-on-surface"
        style={{ writingDirection: "rtl" }}
      >
        {phrase.arabic}
      </Text>
      <Text className="mt-1 font-label-lg text-sm font-bold text-primary">
        {phrase.pronunciation}
      </Text>
      <Text className="mt-0.5 font-body-sm text-sm text-on-surface-variant">
        {phrase.translation}
      </Text>
    </View>
  );
}

function SearchResults({
  query,
  phrases,
  lessons,
  onOpenLesson,
}: {
  query: string;
  phrases: { phrase: Phrase; courseTitle: string }[];
  lessons: { lesson: Lesson; course: Course }[];
  onOpenLesson: (lesson: Lesson, course: Course) => void;
}) {
  if (phrases.length === 0 && lessons.length === 0) {
    return (
      <View
        className="items-center rounded-3xl border border-outline-variant/70 bg-white px-6 py-10"
        accessibilityLiveRegion="polite"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-low">
          <SearchX size={24} color="#6b7280" strokeWidth={2} />
        </View>
        <Text className="mt-4 font-label-lg text-base font-bold text-on-surface">
          No results for “{query}”
        </Text>
        <Text className="mt-1 text-center font-body-sm text-sm text-on-surface-variant">
          Try an English meaning like “market” or a lesson name like “Shopping”.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-5" accessibilityLiveRegion="polite">
      {lessons.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Lessons" subtitle={`${lessons.length} found`} />
          <View className="rounded-3xl border border-outline-variant/70 bg-white px-4 py-2">
            {lessons.map(({ lesson, course }, index) => (
              <LessonRow
                key={`${course.id}-${lesson.id}`}
                lesson={lesson}
                index={course.lessons.indexOf(lesson)}
                isLast={index === lessons.length - 1}
                onPress={() => onOpenLesson(lesson, course)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {phrases.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Words & phrases" subtitle={`${phrases.length} found`} />
          <View className="gap-2.5">
            {phrases.map(({ phrase, courseTitle }) => (
              <PhraseCard
                key={`${courseTitle}-${phrase.arabic}`}
                phrase={phrase}
                source={courseTitle}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
