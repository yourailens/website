/**
 * Accepts http(s) URLs for gallery media. Rejects dangerous schemes.
 */
export function parsePublicHttpUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}
