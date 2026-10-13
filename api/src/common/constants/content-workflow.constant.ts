import type { ContentStatus } from '../../database/drizzle/enums.js';

// content lifecycle-এর অনুমোদিত status transition
export const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['IN_REVIEW'],
  IN_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['ARCHIVED'],
  REJECTED: ['DRAFT', 'IN_REVIEW'],
  ARCHIVED: ['DRAFT'],
};

// Content Manager যে target status-এ নিতে পারে
export const CONTENT_MANAGER_ALLOWED_TARGETS: ContentStatus[] = ['DRAFT', 'IN_REVIEW'];

// Content Manager যে status-এর content edit করতে পারে
export const CONTENT_MANAGER_EDITABLE_STATUSES: ContentStatus[] = ['DRAFT', 'REJECTED'];
