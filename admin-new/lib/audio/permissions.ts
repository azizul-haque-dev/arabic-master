import type { AdminRole, ContentStatus } from "@/lib/types/content";

export interface AudioPermissionResult {
  canEdit: boolean;
  disabledReason?: string;
}

/**
 * Evaluates whether the active role can add, replace, or delete audio for an entity.
 * Mirrors backend `assertEditable`:
 * - ADMIN: Always permitted.
 * - CONTENT_MANAGER: Permitted only when entity status is DRAFT or REJECTED.
 * - Others: Denied.
 */
export function checkAudioPermission(
  role: AdminRole | string | undefined | null,
  status?: ContentStatus | string | null
): AudioPermissionResult {
  if (role === "ADMIN") {
    return { canEdit: true };
  }

  if (role === "CONTENT_MANAGER") {
    if (status === "DRAFT" || status === "REJECTED") {
      return { canEdit: true };
    }
    return {
      canEdit: false,
      disabledReason: `Content Manager শুধুমাত্র Draft বা Rejected অবস্থায় audio পরিবর্তন করতে পারে (বর্তমান অবস্থা: ${status ?? "অজানা"})। Content Manager can only modify audio when entity is in Draft or Rejected status.`,
    };
  }

  return {
    canEdit: false,
    disabledReason: "আপনার এই entity-তে audio পরিবর্তন করার অনুমতি নেই। (You do not have permission to modify audio)",
  };
}
