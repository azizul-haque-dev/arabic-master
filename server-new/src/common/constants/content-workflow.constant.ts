import type { ContentStatus } from '../../database/drizzle/enums.js';

// Allowed status transitions across the content lifecycle
export const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['IN_REVIEW'],
  IN_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['ARCHIVED'],
  REJECTED: ['DRAFT', 'IN_REVIEW'],
  ARCHIVED: ['DRAFT'],
};

// Target statuses that a Content Manager is permitted to transition content to
export const CONTENT_MANAGER_ALLOWED_TARGETS: ContentStatus[] = [
  'DRAFT',
  'IN_REVIEW',
];

// Content statuses where a Content Manager is permitted to edit content
export const CONTENT_MANAGER_EDITABLE_STATUSES: ContentStatus[] = [
  'DRAFT',
  'REJECTED',
];
