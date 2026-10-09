import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultFilmmakingExperience from "@/components/vault/VaultFilmmakingExperience";
import {
  collectFilmmakingGenres,
  filterEntriesByGenreSlug,
} from "@/lib/yail-vault/genres";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ genre: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre: genreSlug } = await params;
  const filmmaking = await getPublishedVaultEntries("filmmaking");
  const genres = collectFilmmakingGenres(filmmaking);
  const meta = genres.find((g) => g.slug === genreSlug);
  const title = meta ? `${meta.name} | YAIL Vault` : "Genre | YAIL Vault";
  return {
    title,
    description: meta
      ? `${meta.count} AI filmmaking lab${meta.count === 1 ? "" : "s"} in ${meta.name}.`
      : "AI filmmaking genre in YAIL Vault.",
    openGraph: {
      title,
      url: `/vault/filmmaking/${encodeURIComponent(genreSlug)}`,
    },
  };
}

export default async function VaultGenrePage({ params }: Props) {
  const { genre: genreSlug } = await params;
  if (!genreSlug?.trim()) notFound();

  const [filmmaking, ads, avatars] = await Promise.all([
    getPublishedVaultEntries("filmmaking"),
    getPublishedVaultEntries("ads"),
    getPublishedVaultAvatars(),
  ]);

  const genres = collectFilmmakingGenres(filmmaking);
  const known = genres.some((g) => g.slug === genreSlug);
  const entries = filterEntriesByGenreSlug(filmmaking, genreSlug);
  // Allow deep links even before tags settle — only 404 when unknown and empty.
  if (!known && !entries.length) notFound();

  return (
    <VaultFilmmakingExperience
      filmmaking={filmmaking}
      ads={ads}
      avatars={avatars}
      genreSlug={genreSlug}
    />
  );
}
