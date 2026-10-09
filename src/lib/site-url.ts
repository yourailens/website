/** Public marketing origin used for share / OG links (not Vercel preview hosts). */
export const CANONICAL_SITE_ORIGIN = "https://yourailens.studio";

/** Absolute https URL on the public domain. */
export function canonicalPublicUrl(path: string) {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      return `${CANONICAL_SITE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
    } catch {
      /* fall through */
    }
  }
  const pathPart = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${CANONICAL_SITE_ORIGIN}${pathPart}`;
}

/**
 * Origin for server-side metadata. Prefer the real domain when env points at
 * a preview host so crawlers and share sheets get stable URLs.
 */
export function siteOriginForMetadata() {
  const env = process.env.PUBLIC_SITE_URL?.trim();
  if (env) {
    try {
      const u = new URL(env);
      if (u.hostname === "yourailens.studio" || u.hostname === "www.yourailens.studio") {
        return u.origin.replace(/\/+$/, "");
      }
    } catch {
      /* ignore */
    }
  }
  return CANONICAL_SITE_ORIGIN;
}
