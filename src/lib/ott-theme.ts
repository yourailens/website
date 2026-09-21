/** Public routes use the dark OTT chrome (nav/footer/body). Admin stays light. */
export function isOttPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !pathname.startsWith("/admin");
}

/** Full-bleed overlay nav (no spacer) — homepage hero only. */
export function isOttOverlayPath(pathname: string | null | undefined): boolean {
  return pathname === "/";
}
