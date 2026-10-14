import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
} from '../errors/app-error.js';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import {
  CONTENT_MANAGER_ALLOWED_TARGETS,
  CONTENT_MANAGER_EDITABLE_STATUSES,
  STATUS_TRANSITIONS,
} from '../constants/content-workflow.constant.js';

export function assertEditable(status: ContentStatus, role: Role): void {
  if (
    role === Role.CONTENT_MANAGER &&
    !CONTENT_MANAGER_EDITABLE_STATUSES.includes(status)
  ) {
    throw new ForbiddenError(
      'Content Manager can only edit content in DRAFT or REJECTED status',
    );
  }
}

export function resolveStatusChange(p: {
  from: ContentStatus;
  to: ContentStatus;
  role: Role;
  rejectionReason?: string;
}): { status: ContentStatus; rejectionReason: string | null } {
  if (!STATUS_TRANSITIONS[p.from].includes(p.to)) {
    throw new ConflictError(`Cannot change status from ${p.from} to ${p.to}`);
  }
  if (
    p.role === Role.CONTENT_MANAGER &&
    !CONTENT_MANAGER_ALLOWED_TARGETS.includes(p.to)
  ) {
    throw new ForbiddenError(
      'Content Manager can only move content to DRAFT or IN_REVIEW',
    );
  }
  const reason = p.rejectionReason?.trim();
  if (p.to === ContentStatus.REJECTED && !reason) {
    throw new BadRequestError('rejectionReason is required when rejecting');
  }
  return {
    status: p.to,
    rejectionReason:
      p.to === ContentStatus.REJECTED ? (reason as string) : null,
  };
}

export function assertSameIdSet(current: string[], provided: string[]): void {
  const cur = new Set(current);
  const ok =
    provided.length === current.length &&
    new Set(provided).size === provided.length &&
    provided.every((id) => cur.has(id));
  if (!ok)
    throw new BadRequestError(
      'ids must contain every existing item exactly once',
    );
}
