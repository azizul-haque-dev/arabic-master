import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  grammaticalFormEnum,
  contentStatusEnum,
  difficultyLevelEnum,
  tenseEnum,
  wordTypeEnum,
} from '../enums.js';

export const arabicEntity = pgTable(
  'ArabicEntity',
  {
    id: text('id').primaryKey(),
    entityKey: text('entityKey').notNull().unique(),
    arabicText: text('arabicText').notNull(),
    normalizedText: text('normalizedText').notNull().unique(),
    audioUrl: text('audioUrl'),
    pronunciationBangla: text('pronunciationBangla').notNull(),
    pronunciationEnglish: text('pronunciationEnglish').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('ArabicEntity_status_idx').on(table.status)],
);
export const word = pgTable(
  'Word',
  {
    id: text('id').primaryKey(),
    wordKey: text('wordKey').notNull().unique(),
    entityId: text('entityId').notNull(),
    meaningBn: text('meaningBn').notNull(),
    meaningEn: text('meaningEn').notNull(),
    pronunciationBn: text('pronunciationBn').notNull(),
    pronunciationEn: text('pronunciationEn').notNull(),
    whenToUseEn: text('whenToUseEn').notNull(),
    whenToUseBn: text('whenToUseBn').notNull(),
    feminineBn: text('feminineBn').notNull(),
    feminineEn: text('feminineEn').notNull(),
    wordType: wordTypeEnum('wordType').default('UNKNOWN').notNull(),
    tense: tenseEnum('tense'),
    category: text('category').notNull(),
    noteEn: text('noteEn'),
    noteBn: text('noteBn'),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Word_entityId_idx').on(table.entityId),
    index('Word_status_idx').on(table.status),
    index('Word_category_idx').on(table.category),
  ],
);
/** Inflected forms are stored only when relevant to the word's grammatical type. */
export const grammaticalVariant = pgTable(
  'GrammaticalVariant',
  {
    id: text('id').primaryKey(),
    wordId: text('wordId').notNull(),
    form: grammaticalFormEnum('form').notNull(),
    entityId: text('entityId').notNull(),
    meaningBn: text('meaningBn'),
    meaningEn: text('meaningEn'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('GrammaticalVariant_wordId_form_key').on(table.wordId, table.form),
    index('GrammaticalVariant_entityId_idx').on(table.entityId),
  ],
);
export const sentenceWord = pgTable(
  'SentenceWord',
  {
    id: text('id').primaryKey(),
    sentenceId: text('sentenceId').notNull(),
    wordId: text('wordId').notNull(),
    position: integer('position'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('SentenceWord_sentenceId_wordId_key').on(
      table.sentenceId,
      table.wordId,
    ),
    index('SentenceWord_sentenceId_idx').on(table.sentenceId),
    index('SentenceWord_wordId_idx').on(table.wordId),
  ],
);
export const sentence = pgTable(
  'Sentence',
  {
    id: text('id').primaryKey(),
    sentenceKey: text('sentenceKey').notNull().unique(),
    entityId: text('entityId').notNull(),
    meaningBn: text('meaningBn').notNull(),
    meaningEn: text('meaningEn').notNull(),
    pronunciationBn: text('pronunciationBn').notNull(),
    pronunciationEn: text('pronunciationEn').notNull(),
    whenToUseEn: text('whenToUseEn').notNull(),
    whenToUseBn: text('whenToUseBn').notNull(),
    feminineBn: text('feminineBn').notNull(),
    feminineEn: text('feminineEn').notNull(),
    difficulty: difficultyLevelEnum('difficulty').default('BEGINNER').notNull(),
    category: text('category').notNull(),
    relatedWordId: text('relatedWordId'),
    noteEn: text('noteEn'),
    noteBn: text('noteBn'),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Sentence_entityId_idx').on(table.entityId),
    index('Sentence_relatedWordId_idx').on(table.relatedWordId),
    index('Sentence_status_idx').on(table.status),
    index('Sentence_category_idx').on(table.category),
  ],
);
export const conversation = pgTable(
  'Conversation',
  {
    id: text('id').primaryKey(),
    conversationKey: text('conversationKey').notNull().unique(),
    title: text('title').notNull(),
    topic: text('topic').notNull(),
    category: text('category').notNull(),
    status: contentStatusEnum('status').default('DRAFT').notNull(),
    rejectionReason: text('rejectionReason'),
    createdById: text('createdById'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [index('Conversation_status_idx').on(table.status)],
);
export const conversationTurn = pgTable(
  'ConversationTurn',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversationId').notNull(),
    order: integer('order').notNull(),
    speaker: text('speaker').notNull(),
    sentenceId: text('sentenceId').notNull(),
  },
  (table) => [
    uniqueIndex('ConversationTurn_conversationId_order_key').on(
      table.conversationId,
      table.order,
    ),
    index('ConversationTurn_sentenceId_idx').on(table.sentenceId),
  ],
);
export const arabicEntityRelationTable = pgTable(
  'ArabicEntityRelation',
  {
    conceptId: text('conceptId').notNull(),
    relatedEntityId: text('relatedEntityId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.relatedEntityId] }),
  ],
);
