"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { LessonMetaDialog } from "@/components/features/lessons/lesson-meta-dialog";
import { LessonContentPanel } from "@/components/features/lessons/lesson-content-panel";
import { WordSelector } from "@/components/features/lessons/word-selector";
import { SentenceSelector } from "@/components/features/conversations/sentence-selector";
import { ConversationSelector } from "@/components/features/lessons/conversation-selector";
import { Button } from "@/components/ui/button";
import { mockWords } from "@/lib/mock-data/words";
import { mockSentences } from "@/lib/mock-data/sentences";
import { mockConversations } from "@/lib/mock-data/conversations";
import { mockSections } from "@/lib/mock-data/sections";
import { mockCourses } from "@/lib/mock-data/courses";
import type {
    ContentStatus,
    Lesson,
    LessonContentItem,
    LessonContentType,
    LessonMetaFormValues,
} from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function LessonDetailView({ initialLesson }: { initialLesson: Lesson }) {
    const { role } = useRole();
    const [lesson, setLesson] = useState(initialLesson);
    const [editMetaOpen, setEditMetaOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const section = mockSections.find((s) => s.id === lesson.sectionId);
    const course = section ? mockCourses.find((c) => c.id === section.courseId) : undefined;

    function setStatus(status: ContentStatus, rejectionReason?: string) {
        setLesson((prev) => ({ ...prev, status, rejectionReason, updatedAt: new Date().toISOString() }));
    }

    function handleMetaSave(values: LessonMetaFormValues) {
        setLesson((prev) => ({ ...prev, ...values, updatedAt: new Date().toISOString() }));
    }

    function itemsOfType(type: LessonContentType) {
        return lesson.items.filter((i) => i.contentType === type).sort((a, b) => a.order - b.order);
    }

    function addItem(type: LessonContentType, contentId: string) {
        const nextOrder = itemsOfType(type).length + 1;
        const newItem: LessonContentItem = {
            id: crypto.randomUUID(),
            order: nextOrder,
            contentType: type,
            contentId,
        };
        setLesson((prev) => ({ ...prev, items: [...prev.items, newItem], updatedAt: new Date().toISOString() }));
    }

    function renumberType(items: LessonContentItem[], type: LessonContentType) {
        const ofType = items.filter((i) => i.contentType === type).sort((a, b) => a.order - b.order);
        const renumbered = ofType.map((it, i) => ({ ...it, order: i + 1 }));
        const others = items.filter((i) => i.contentType !== type);
        return [...others, ...renumbered];
    }

    function removeItem(itemId: string) {
        setLesson((prev) => {
            const removed = prev.items.find((i) => i.id === itemId);
            if (!removed) return prev;
            const remaining = prev.items.filter((i) => i.id !== itemId);
            const renumbered = renumberType(remaining, removed.contentType);
            return { ...prev, items: renumbered, updatedAt: new Date().toISOString() };
        });
    }

    function reorderType(type: LessonContentType, reordered: LessonContentItem[]) {
        setLesson((prev) => {
            const others = prev.items.filter((i) => i.contentType !== type);
            return { ...prev, items: [...others, ...reordered], updatedAt: new Date().toISOString() };
        });
    }

    const wordItems = itemsOfType("WORD");
    const sentenceItems = itemsOfType("SENTENCE");
    const conversationItems = itemsOfType("CONVERSATION");

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
                <Link href="/lessons" className="hover:text-[var(--color-text)]">
                    Lessons
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="text-[var(--color-text-secondary)]">{lesson.lessonKey}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">{lesson.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {lesson.lessonKey} · {course?.title ?? "—"} · {section?.title ?? "—"}
                        </span>
                        <ContentStatusBadge status={lesson.status} />
                    </div>
                </div>
                <Button variant="secondary" onClick={() => setEditMetaOpen(true)}>
                    Edit details
                </Button>
            </div>

            {lesson.status === "REJECTED" && lesson.rejectionReason ? (
                <div className="flex gap-2.5 rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <p className="font-medium">Reason for rejection</p>
                        <p className="mt-0.5">{lesson.rejectionReason}</p>
                    </div>
                </div>
            ) : null}

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="words">Words ({wordItems.length})</TabsTrigger>
                    <TabsTrigger value="sentences">Sentences ({sentenceItems.length})</TabsTrigger>
                    <TabsTrigger value="conversations">Conversations ({conversationItems.length})</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <SummaryCard label="Words" count={wordItems.length} max={lesson.maxItemsRecommended} />
                        <SummaryCard label="Sentences" count={sentenceItems.length} max={lesson.maxItemsRecommended} />
                        <SummaryCard label="Conversations" count={conversationItems.length} max={lesson.maxItemsRecommended} />
                    </div>

                    <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
                        <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
                            Review & publishing
                        </h2>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
                        </p>
                        <div className="mt-4">
                            <ContentActionBar
                                role={role}
                                status={lesson.status}
                                onSaveDraft={lesson.status === "DRAFT" ? () => setStatus("DRAFT") : undefined}
                                onSubmitForReview={lesson.items.length > 0 ? () => setStatus("IN_REVIEW") : undefined}
                                onApprove={() => setStatus("APPROVED")}
                                onReject={() => setRejectOpen(true)}
                                onPublish={() => setStatus("PUBLISHED")}
                            />
                            {lesson.items.length === 0 ? (
                                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                    Add at least one word, sentence, or conversation before submitting for review.
                                </p>
                            ) : null}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="words">
                    <LessonContentPanel
                        items={wordItems}
                        maxRecommended={lesson.maxItemsRecommended}
                        addLabel="Add word"
                        pickerTitle="Add a word"
                        pickerDescription="Search existing words to add to this lesson."
                        renderPicker={(onPick) => <WordSelector onSelect={(w) => onPick(w.id)} />}
                        renderPreview={(contentId) => {
                            const word = mockWords.find((w) => w.id === contentId);
                            if (!word) return <p className="text-xs text-[var(--color-error-text)]">Word not found.</p>;
                            return (
                                <Link href={`/words/${word.id}`} className="flex items-center gap-3 hover:underline">
                                    <p dir="rtl" lang="ar" className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]">
                                        {word.arabicText}
                                    </p>
                                    <span className="text-sm text-[var(--color-text-secondary)]">{word.meaningEnglish}</span>
                                </Link>
                            );
                        }}
                        onAdd={(id) => addItem("WORD", id)}
                        onRemove={removeItem}
                        onReorder={(reordered) => reorderType("WORD", reordered)}
                    />
                </TabsContent>

                <TabsContent value="sentences">
                    <LessonContentPanel
                        items={sentenceItems}
                        maxRecommended={lesson.maxItemsRecommended}
                        addLabel="Add sentence"
                        pickerTitle="Add a sentence"
                        pickerDescription="Search existing sentences to add to this lesson."
                        renderPicker={(onPick) => <SentenceSelector onSelect={(s) => onPick(s.id)} />}
                        renderPreview={(contentId) => {
                            const sentence = mockSentences.find((s) => s.id === contentId);
                            if (!sentence) return <p className="text-xs text-[var(--color-error-text)]">Sentence not found.</p>;
                            return (
                                <Link href={`/sentences/${sentence.id}`} className="flex items-center gap-3 hover:underline">
                                    <p dir="rtl" lang="ar" className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]">
                                        {sentence.arabicText}
                                    </p>
                                    <span className="text-sm text-[var(--color-text-secondary)]">{sentence.meaningEnglish}</span>
                                </Link>
                            );
                        }}
                        onAdd={(id) => addItem("SENTENCE", id)}
                        onRemove={removeItem}
                        onReorder={(reordered) => reorderType("SENTENCE", reordered)}
                    />
                </TabsContent>

                <TabsContent value="conversations">
                    <LessonContentPanel
                        items={conversationItems}
                        maxRecommended={lesson.maxItemsRecommended}
                        addLabel="Add conversation"
                        pickerTitle="Add a conversation"
                        pickerDescription="Search existing conversations to add to this lesson."
                        renderPicker={(onPick) => <ConversationSelector onSelect={(c) => onPick(c.id)} />}
                        renderPreview={(contentId) => {
                            const conversation = mockConversations.find((c) => c.id === contentId);
                            if (!conversation)
                                return <p className="text-xs text-[var(--color-error-text)]">Conversation not found.</p>;
                            return (
                                <Link href={`/conversations/${conversation.id}`} className="flex items-center gap-3 hover:underline">
                                    <span className="font-medium text-[var(--color-text)]">{conversation.title}</span>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        {conversation.turns.length} turns
                                    </span>
                                </Link>
                            );
                        }}
                        onAdd={(id) => addItem("CONVERSATION", id)}
                        onRemove={removeItem}
                        onReorder={(reordered) => reorderType("CONVERSATION", reordered)}
                    />
                </TabsContent>

                <TabsContent value="settings">
                    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-text)]">
                        <dl className="flex flex-col gap-3">
                            <Row label="Title" value={lesson.title} />
                            <Row label="Course" value={course?.title ?? "—"} />
                            <Row label="Section" value={section?.title ?? "—"} />
                            <Row label="Recommended max items" value={String(lesson.maxItemsRecommended)} />
                            <Row label="Created by" value={lesson.createdBy} />
                            <Row label="Last updated" value={new Date(lesson.updatedAt).toLocaleDateString()} />
                        </dl>
                        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setEditMetaOpen(true)}>
                            Edit these details
                        </Button>
                    </section>
                </TabsContent>
            </Tabs>

            <LessonMetaDialog
                open={editMetaOpen}
                onOpenChange={setEditMetaOpen}
                initialLesson={lesson}
                onSave={handleMetaSave}
            />

            <RejectionDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                onSubmit={(reason) => setStatus("REJECTED", reason)}
            />
        </div>
    );
}

function SummaryCard({ label, count, max }: { label: string; count: number; max: number }) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 text-center">
            <p className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">{count}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
                {label} · {max} recommended
            </p>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b border-[var(--color-border)] pb-2 last:border-0 last:pb-0">
            <dt className="text-[var(--color-text-muted)]">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}