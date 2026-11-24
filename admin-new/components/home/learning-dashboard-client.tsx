"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Heart, Play, Star } from "lucide-react";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";

interface LearningDashboardClientProps {
  initialUser: SafeUser | null;
  initialOverview: LearnerOverview | null;
}

function ProgressRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-primary/15"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-bold text-text">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function AuthenticatedDashboard({
  overview,
}: {
  overview: LearnerOverview | null;
}) {
  const xp = overview?.xp ?? 0;
  const streakCount = overview?.streakCount ?? 0;
  const hearts = overview?.hearts ?? 5;
  const currentLesson = overview?.currentLesson ?? null;
  const progressPercent = currentLesson?.progressPercent ?? 0;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] lg:grid-cols-12">
      <div className="flex flex-col items-center justify-center gap-3 bg-primary-light p-6 text-center lg:col-span-4 lg:p-8">
        <ProgressRing percent={progressPercent} />
        <div>
          <p className="text-sm font-semibold text-primary-dark">Your Progress</p>
          <p className="mt-0.5 text-xs text-primary-dark/75">
            {currentLesson
              ? `${currentLesson.completedLessons} of ${currentLesson.totalLessons} lessons`
              : "Level " + (overview?.level ?? 1)}
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
        >
              <span>View Progress</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-col justify-between p-6 lg:col-span-8 lg:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {currentLesson ? "Continue Lesson" : "Choose a lesson"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-text">
              {currentLesson ? currentLesson.courseTitle : "Start with a course"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {currentLesson
                ? `${currentLesson.lessonTitle} · ${currentLesson.completedLessons} of ${currentLesson.totalLessons} lessons done`
                : "Browse courses or start with words and sentences."}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>{currentLesson ? "Continue Lesson" : "Browse Courses"}</span>
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-high p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
              <Star className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-text">{xp} XP</p>
              <p className="text-xs text-white/70">Total XP</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-high p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Flame className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-text">
                {streakCount} {streakCount === 1 ? "Day" : "Days"}
              </p>
              <p className="text-xs text-white/70">Current Streak</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-high p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
              <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-base font-bold text-text">
                {hearts} Hearts
              </p>
              <p className="text-xs text-white/70">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestIntroductionCard() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] lg:grid-cols-12">
      <div className="flex flex-col justify-between gap-4 bg-primary-light p-6 lg:col-span-5 lg:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-dark shadow-2xs">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Free account</span>
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-text">
            Start with a free lesson.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Create an account to save lessons, track XP, and keep your streak.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
          >
            <span>Create free account</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/words"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-primary/25 bg-white px-4 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light/30"
          >
            Browse words
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 p-6 lg:col-span-7 lg:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
          What a lesson includes
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-surface-container-high p-4">
            <span className="text-xs font-bold text-primary">01 · Words</span>
            <p className="mt-1 text-sm font-semibold text-text">Learn a word</p>
            <p className="mt-1 text-xs text-text-secondary">
              Read its meaning in Bangla and English and hear it spoken.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface-container-high p-4">
            <span className="text-xs font-bold text-primary">02 · Sentences</span>
            <p className="mt-1 text-sm font-semibold text-text">Read a phrase</p>
            <p className="mt-1 text-xs text-text-secondary">
              See how the word is used in a sentence.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface-container-high p-4">
            <span className="text-xs font-bold text-primary">03 · Speak</span>
            <p className="mt-1 text-sm font-semibold text-text">Follow a dialogue</p>
            <p className="mt-1 text-xs text-text-secondary">
              Read a short conversation for a daily situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearningDashboardClient({
  initialUser,
  initialOverview,
}: LearningDashboardClientProps) {
  const { user, overview, hasClientOverride } = useUser();

  const activeUser = hasClientOverride ? user : initialUser;
  const activeOverview = hasClientOverride ? overview : initialOverview;

  return activeUser ? (
    <AuthenticatedDashboard overview={activeOverview} />
  ) : (
    <GuestIntroductionCard />
  );
}
