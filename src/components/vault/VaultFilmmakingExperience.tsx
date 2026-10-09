"use client";

import VaultShell from "@/components/vault/VaultShell";
import { EmptyVault, VaultOttHero, VaultRail } from "@/components/vault/vault-browse-ui";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import { YAIL_VAULT_CATEGORIES, pickVaultHero, type YailVaultEntry } from "@/data/yail-vault";
import {
  collectFilmmakingGenres,
  filmmakingHubHref,
  filterEntriesByGenreSlug,
  genreHref,
  groupEntriesByGenre,
} from "@/lib/yail-vault/genres";

function padScene(n: number) {
  return String(n).padStart(2, "0");
}

type Props = {
  filmmaking: YailVaultEntry[];
  ads: YailVaultEntry[];
  avatars: YailVaultAvatar[];
  /** When set, show a single-genre page. */
  genreSlug?: string | null;
};

export default function VaultFilmmakingExperience({
  filmmaking,
  ads,
  avatars,
  genreSlug = null,
}: Props) {
  const genres = collectFilmmakingGenres(filmmaking);
  const allIds = new Set([...filmmaking, ...ads].map((e) => e.id));
  const counts = {
    all: allIds.size,
    filmmaking: filmmaking.length,
    ads: ads.length,
    avatars: avatars.length,
  };

  const genreEntries = genreSlug ? filterEntriesByGenreSlug(filmmaking, genreSlug) : [];
  const genreMeta = genreSlug
    ? genres.find((g) => g.slug === genreSlug) ?? {
        slug: genreSlug,
        name: genreSlug,
        count: genreEntries.length,
      }
    : null;

  const hero = genreSlug
    ? pickVaultHero(genreEntries, "genre")
    : pickVaultHero(filmmaking, "category");
  const railEntries = genreSlug
    ? genreEntries.filter((e) => e.id !== hero?.id)
    : filmmaking.filter((e) => e.id !== hero?.id);
  const genreRails = genreSlug ? [] : groupEntriesByGenre(railEntries);

  const headerTitle = genreMeta ? genreMeta.name : YAIL_VAULT_CATEGORIES[0].label;
  const headerMeta = genreMeta
    ? `${genreMeta.count} ${genreMeta.count === 1 ? "cut" : "cuts"}`
    : `${filmmaking.length} cuts`;

  return (
    <VaultShell
      counts={counts}
      genres={genres}
      activeView="filmmaking"
      activeGenreSlug={genreSlug}
      headerKicker="GenAI labs"
      headerTitle={headerTitle}
      headerMeta={headerMeta}
      headerMode="overlay"
    >
      {!filmmaking.length ? (
        <EmptyVault />
      ) : genreSlug && !genreEntries.length ? (
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300/80">Genre</p>
          <h1 className="mt-3 font-body text-3xl font-semibold tracking-tight text-white">
            No cuts in this genre yet
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/55">
            Tag a filmmaking cut with this Genre in the vault admin desk.
          </p>
        </section>
      ) : (
        <div className="pb-14">
          {hero ? <VaultOttHero entry={hero} /> : null}
          <div className="relative z-10 -mt-6 space-y-8 sm:-mt-8 sm:space-y-10">
            {genreSlug ? (
              railEntries.length ? (
                <VaultRail
                  title={genreMeta?.name ?? "Genre"}
                  scene="01"
                  entries={railEntries}
                  titleHref={filmmakingHubHref()}
                />
              ) : null
            ) : (
              genreRails.map((rail, index) => (
                <VaultRail
                  key={rail.slug}
                  title={rail.title}
                  scene={padScene(index + 1)}
                  entries={rail.entries}
                  titleHref={genreHref(rail.slug)}
                />
              ))
            )}
            {!genreSlug && !genreRails.length ? (
              <p className="px-5 text-sm text-white/40 sm:px-8 lg:px-10">
                More cuts will show in the rails once you publish additional labs.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </VaultShell>
  );
}
