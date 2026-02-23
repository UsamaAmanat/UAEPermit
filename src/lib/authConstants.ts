// Single source for admin allowlist; used for role-based redirect after login.
export const ALLOWED_ADMINS = ["admin@uaepermit.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ALLOWED_ADMINS.includes(email.trim()));
}
