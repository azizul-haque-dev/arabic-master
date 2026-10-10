import { ContentStatus } from '../../database/drizzle/enums.js';

// Allowed status transitions across the lifecycle of a conversation
export const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['IN_REVIEW'],
  IN_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['ARCHIVED'],
  REJECTED: ['DRAFT', 'IN_REVIEW'],
  ARCHIVED: ['DRAFT'],
};

// Target statuses that a Content Manager is permitted to transition to (cannot approve or publish directly)
export const CONTENT_MANAGER_ALLOWED_TARGETS: ContentStatus[] = [
  'DRAFT',
  'IN_REVIEW',
];

// Content statuses where a Content Manager is permitted to edit conversation data
export const CONTENT_MANAGER_EDITABLE_STATUSES: ContentStatus[] = [
  'DRAFT',
  'REJECTED',
];

// Maximum allowed dialogue turns in a single conversation
export const MAX_TURNS_PER_CONVERSATION = 100;