const ADMIN_ROLES = new Set(["ADMIN", "CONTENT_MANAGER"]);

export function getPostLoginRedirect(role?: string): string {
  return role && ADMIN_ROLES.has(role) ? "/admin/arabic-entities" : "/";
}
