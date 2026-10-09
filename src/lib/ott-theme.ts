/** Public routes use the dark OTT chrome (nav/footer/body). Admin stays light. */
export function isOttPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !pathname.startsWith("/admin");
}

/** Homepage hero nav is a transparent overlay on the hero. Vault uses its own sidebar shell. */
export function isOttOverlayPath(pathname: string | null | undefined): boolean {
  return pathname === "/";
}
