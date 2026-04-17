const DEFAULT_ADMIN = "sushmith.thuluva@gmail.com";

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function getAdminEmail(): string {
  return normalizeEmail(process.env.ADMIN_EMAIL) || DEFAULT_ADMIN;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === getAdminEmail();
}
