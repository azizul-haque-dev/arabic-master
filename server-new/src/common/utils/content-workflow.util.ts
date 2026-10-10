import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import {
  CONTENT_MANAGER_ALLOWED_TARGETS,
  CONTENT_MANAGER_EDITABLE_STATUSES,
  STATUS_TRANSITIONS,
} from '../constants/content-workflow.constant.js';

// Verify that the actor is authorized to edit content in its current status
export function assertEditable(status: ContentStatus, role: Role): void {
  if (
    role === Role.CONTENT_MANAGER &&
    !CONTENT_MANAGER_EDITABLE_STATUSES.includes(status)
  ) {
    throw new ForbiddenException(
      'Content Manager can only edit content in DRAFT or REJECTED status',
    );
  }
}

// Validate status transition rules and role permissions, returning normalized status and rejection reason
export function resolveStatusChange(params: {
  from: ContentStatus;
  to: ContentStatus;
  role: Role;
  rejectionReason?: string;
}): { status: ContentStatus; rejectionReason: string | null } {
  const { from, to, role } = params;

  if (!STATUS_TRANSITIONS[from].includes(to)) {
    throw new ConflictException(`Cannot change status from ${from} to ${to}`);
  }

  if (
    role === Role.CONTENT_MANAGER &&
    !CONTENT_MANAGER_ALLOWED_TARGETS.includes(to)
  ) {
    throw new ForbiddenException(
      'Content Manager can only move content to DRAFT or IN_REVIEW',
    );
  }

  const reason = params.rejectionReason?.trim();
  if (to === ContentStatus.REJECTED && !reason) {
    throw new BadRequestException('rejectionReason is required when rejecting');
  }

  return {
    status: to,
    rejectionReason: to === ContentStatus.REJECTED ? (reason as string) : null,
  };
}

// Ensure the provided ID array contains every existing sibling ID exactly once during reordering
export function assertSameIdSet(current: string[], provided: string[]): void {
  const currentSet = new Set(current);
  const providedSet = new Set(provided);
  const valid =
    provided.length === current.length &&
    providedSet.size === provided.length &&
    provided.every((id) => currentSet.has(id));

  if (!valid) {
    throw new BadRequestException(
      'ids must contain every existing item exactly once',
    );
  }
}
