import { tagsOfKind, type YailVaultEntry } from "@/data/yail-vault";

export const VAULT_UNCATEGORIZED_GENRE_SLUG = "uncategorized";
export const VAULT_UNCATEGORIZED_GENRE_NAME = "Uncategorized";

export type VaultGenreNavItem = {
  slug: string;
  name: string;
  count: number;
};

export type VaultGenreRail = {
  slug: string;
  title: string;
  entries: YailVaultEntry[];
};

function slugifyGenreName(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

/** Genre slug for an entry — tag slug, or uncategorized when missing. */
export function entryGenreSlug(entry: YailVaultEntry): string {
  const tag = tagsOfKind(entry, "genre")[0];
  const fromTag = tag?.slug?.trim() || (tag?.name ? slugifyGenreName(tag.name) : "");
  return fromTag || VAULT_UNCATEGORIZED_GENRE_SLUG;
}

export function entryGenreName(entry: YailVaultEntry): string {
  return tagsOfKind(entry, "genre")[0]?.name?.trim() || VAULT_UNCATEGORIZED_GENRE_NAME;
}

/** Group lab cuts into genre rails (A→Z, Uncategorized last). */
export function groupEntriesByGenre(entries: YailVaultEntry[]): VaultGenreRail[] {
  const bySlug = new Map<string, VaultGenreRail>();

  for (const entry of entries) {
    const slug = entryGenreSlug(entry);
    const title = entryGenreName(entry);
    const existing = bySlug.get(slug);
    if (existing) {
      existing.entries.push(entry);
    } else {
      bySlug.set(slug, { slug, title, entries: [entry] });
    }
  }

  const named = Array.from(bySlug.values())
    .filter((g) => g.slug !== VAULT_UNCATEGORIZED_GENRE_SLUG)
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

  const uncategorized = bySlug.get(VAULT_UNCATEGORIZED_GENRE_SLUG);
  return uncategorized ? [...named, uncategorized] : named;
}

/** Sidebar genre list derived from published filmmaking cuts. */
export function collectFilmmakingGenres(entries: YailVaultEntry[]): VaultGenreNavItem[] {
  return groupEntriesByGenre(entries).map((g) => ({
    slug: g.slug,
    name: g.title,
    count: g.entries.length,
  }));
}

export function filterEntriesByGenreSlug(entries: YailVaultEntry[], genreSlug: string): YailVaultEntry[] {
  return entries.filter((e) => entryGenreSlug(e) === genreSlug);
}

export function genreHref(slug: string) {
  return `/vault/filmmaking/${encodeURIComponent(slug)}`;
}

export function filmmakingHubHref() {
  return "/vault/filmmaking";
}
