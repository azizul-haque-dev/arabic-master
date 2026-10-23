import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Crown, LockKeyhole } from "lucide-react-native";
import { useCallback, useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";

import {
  LearningAccessBadge,
  LearningCard,
  LearningContentCard,
  LearningStatusBadge,
  type LearningVisualStatus,
} from "@/components/learning/LearningUI";
import {
  ProgressBar,
  SectionHeader,
  TabScreen,
  tapFeedback,
} from "@/components/learning/primitives";
import {
  getLearningContentItem,
  getLearningProduct,
  type LearningLessonFixture,
} from "@/features/learning/data";

const curriculum = getLearningProduct("curriculum");
const curriculumLessons = curriculum.sections.flatMap(
  (section) =>
    section.levels?.flatMap((level) => level.lessons) ?? section.lessons ?? [],
);

export default function CurriculumScreen() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    tapFeedback();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/learn");
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  const firstCurrentLesson = curriculumLessons.find(
    (lesson) => lesson.status === "current",
  );
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    firstCurrentLesson?.id ?? curriculumLessons[0]?.id ?? null,
  );
  const selectedDay = curriculumLessons.find(
    (lesson) => lesson.id === selectedDayId,
  );
  const completedDays = curriculumLessons.filter(
    (lesson) => lesson.status === "done",
  ).length;
  const sequenceProgress =
    curriculumLessons.length > 0 ? completedDays / curriculumLessons.length : 0;
  const sampleItemId =
    selectedDay && selectedDay.status !== "locked"
      ? selectedDay.sampleItemIds[0]
      : undefined;
  const sampleItem = sampleItemId
    ? getLearningContentItem(sampleItemId)
    : undefined;

  return (
    <TabScreen>
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="mt-1 h-12 w-12 items-center justify-center rounded-full border border-outline-variant/70 bg-white active:bg-surface-container-low"
        >
          <ArrowLeft size={18} color="#374151" strokeWidth={2.2} />
        </Pressable>
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="font-headline-md text-[28px] font-bold leading-9 tracking-tight text-on-surface"
          >
            {curriculum.title}
          </Text>
          <Text className="mt-0.5 font-body-sm text-sm leading-5 text-on-surface-variant">
            {curriculum.description}
          </Text>
        </View>
      </View>

      <View className="gap-3 rounded-3xl border border-secondary/40 bg-secondary-subtle p-4">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Crown size={21} color="#b45309" strokeWidth={2.1} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="font-label-lg text-base font-bold text-on-surface">
              Your structured learning path
            </Text>
            <Text className="font-body-sm text-xs leading-4 text-on-surface-variant">
              A separate premium product with day-by-day lessons, objectives,
              and practice.
            </Text>
          </View>
        </View>
        <LearningAccessBadge
          access="premium"
          label="Separate premium product"
        />
        <Text className="font-body-sm text-xs leading-4 text-on-surface-variant">
          This is a local UI demo. No purchase, enrollment, or access change is
          performed.
        </Text>
      </View>

      <View className="gap-3 rounded-2xl border border-outline-variant/70 bg-white p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-label-lg text-sm font-bold text-on-surface">
            Sample sequence progress
          </Text>
          <Text className="font-label-md text-xs font-bold text-primary-strong">
            {completedDays} of {curriculumLessons.length} days
          </Text>
        </View>
        <ProgressBar
          value={sequenceProgress}
          label="Premium Curriculum demo sequence progress"
          height={7}
        />
        <Text className="font-body-sm text-xs text-on-surface-variant">
          Statuses are illustrative catalog fixtures, not account progress.
        </Text>
      </View>

      <View className="gap-3">
        <SectionHeader
          title="Your learning sequence"
          subtitle={`${curriculumLessons.length} sample days · select a day to preview its outline`}
        />
        {curriculumLessons.length > 0 ? (
          <View className="gap-2.5">
            {curriculumLessons.map((lesson, index) => (
              <CurriculumDayCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                selected={lesson.id === selectedDay?.id}
                onPress={() => {
                  tapFeedback();
                  setSelectedDayId(lesson.id);
                }}
              />
            ))}
          </View>
        ) : (
          <View
            accessibilityLiveRegion="polite"
            className="items-center rounded-3xl border border-outline-variant/70 bg-white px-6 py-8"
          >
            <Text className="font-label-lg text-base font-bold text-on-surface">
              No sample days yet
            </Text>
            <Text className="mt-1 text-center font-body-sm text-sm text-on-surface-variant">
              The local curriculum fixture does not contain any lessons.
            </Text>
          </View>
        )}
      </View>

      {selectedDay ? (
        <CurriculumDayPreview lesson={selectedDay} sampleItem={sampleItem} />
      ) : null}
    </TabScreen>
  );
}

function CurriculumDayCard({
  lesson,
  index,
  selected,
  onPress,
}: {
  lesson: LearningLessonFixture;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const status: LearningVisualStatus =
    lesson.status === "done"
      ? "completed"
      : lesson.status === "current"
        ? "in-progress"
        : "locked";
  const dayNumber = lesson.dayNumber ?? index + 1;

  return (
    <LearningCard
      title={lesson.title}
      description={lesson.objective}
      leading={
        <Text className="font-label-lg text-sm font-bold text-primary-strong">
          {String(dayNumber).padStart(2, "0")}
        </Text>
      }
      access="premium"
      status={status}
      metadata={`Day ${dayNumber} · sample lesson`}
      accessibilityLabel={`Day ${dayNumber}, ${lesson.title}, ${status}, premium curriculum`}
      selected={selected}
      onPress={onPress}
    />
  );
}

function CurriculumDayPreview({
  lesson,
  sampleItem,
}: {
  lesson: LearningLessonFixture;
  sampleItem: ReturnType<typeof getLearningContentItem>;
}) {
  const isLocked = lesson.status === "locked";
  const status: LearningVisualStatus =
    lesson.status === "done"
      ? "completed"
      : lesson.status === "current"
        ? "in-progress"
        : "locked";

  return (
    <View className="gap-3 rounded-3xl border border-secondary/30 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text
            accessibilityRole="header"
            className="font-label-lg text-base font-bold text-on-surface"
          >
            {isLocked ? "Locked day preview" : "Day outline preview"}
          </Text>
          <Text className="font-label-md text-xs text-on-surface-variant">
            {lesson.title}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <LearningAccessBadge access="premium" />
        <LearningStatusBadge status={status} />
      </View>

      {lesson.objective ? (
        <View className="gap-1 rounded-2xl bg-surface-container-low p-3.5">
          <Text className="font-label-md text-xs font-bold text-on-surface">
            Learning objective
          </Text>
          <Text className="font-body-sm text-sm leading-5 text-on-surface-variant">
            {lesson.objective}
          </Text>
        </View>
      ) : null}

      {isLocked ? (
        <View className="flex-row items-start gap-2 rounded-2xl border border-secondary/30 bg-secondary-subtle p-3.5">
          <LockKeyhole size={17} color="#b45309" />
          <Text className="flex-1 font-body-sm text-xs leading-4 text-on-surface-variant">
            This day remains locked in the demo. Lesson content and exercises
            are not opened, and no access is granted.
          </Text>
        </View>
      ) : sampleItem ? (
        <View className="gap-2">
          <Text className="font-label-md text-xs font-bold text-on-surface">
            Illustrative practice item
          </Text>
          <LearningContentCard
            arabic={sampleItem.arabic}
            transliteration={sampleItem.transliteration}
            meaningBn={sampleItem.meaningBn}
            meaningEn={sampleItem.meaningEn}
            category="Local sample"
          />
          <Text className="font-body-sm text-xs leading-4 text-on-surface-variant">
            Content is for layout preview only. Exercises, assessment, and
            lesson actions are not implemented.
          </Text>
        </View>
      ) : (
        <Text
          accessibilityLiveRegion="polite"
          className="font-body-sm text-sm text-error"
        >
          This day&apos;s sample item is unavailable in the local fixture.
        </Text>
      )}
    </View>
  );
}
