export interface CurrentLessonSummary {
  lessonId: string;
  lessonKey: string;
  lessonTitle: string;
  sectionTitle: string;
  courseId: string;
  courseTitle: string;
  completedItems: number;
  totalItems: number;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface LearnerNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface LearnerOverview {
  xp: number;
  level: number;
  streakCount: number;
  hearts: number;
  plan: "FREE" | "PRO";
  planName: string;
  currentLesson: CurrentLessonSummary | null;
  unreadNotifications: number;
  notifications: LearnerNotification[];
}

export interface PublicPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPublicResponse<T> {
  items: T[];
  meta: PublicPaginationMeta;
}

export interface PublicWordItem {
  id: string;
  wordKey: string;
  arabicText: string;
  audioUrl?: string | null;
  meaningEn: string;
  meaningBn: string;
  pronunciationEn: string;
  pronunciationBn: string;
  whenToUseEn: string;
  whenToUseBn: string;
  category: string;
  wordType: string;
}

export interface PublicSentenceItem {
  id: string;
  sentenceKey: string;
  arabicText: string;
  audioUrl?: string | null;
  meaningEn: string;
  meaningBn: string;
  pronunciationEn: string;
  pronunciationBn: string;
  whenToUseEn: string;
  whenToUseBn: string;
  sentenceType: string;
  difficulty: string;
  category: string;
}

export interface PublicConversationItem {
  id: string;
  conversationKey: string;
  title: string;
  topic: string;
  category: string;
  turnCount: number;
}

export interface PublicCourseItem {
  id: string;
  courseKey: string;
  title: string;
  description: string;
  level: string;
  courseType: "FREE" | "PRO";
  sectionCount: number;
  lessonCount: number;
}
