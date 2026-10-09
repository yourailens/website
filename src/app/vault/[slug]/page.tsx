import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultCutExperience from "@/components/vault/VaultCutExperience";
import { collectFilmmakingGenres } from "@/lib/yail-vault/genres";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getVaultAvatarsByIds,
  getVaultEntryBySlug,
} from "@/lib/yail-vault/load";
import { canonicalPublicUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function entryPreviewImage(entry: {
  media_type: string;
  media_url: string;
  poster_url: string | null;
}): string | undefined {
  if (entry.poster_url?.trim()) return entry.poster_url.trim();
  if (entry.media_type === "image" && entry.media_url?.trim()) return entry.media_url.trim();
  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) return { title: "YAIL Vault" };

  const title = `${entry.title} | YAIL Vault`;
  const description = entry.caption ?? entry.notes ?? "GenAI lab cut from YAIL Vault.";
  const pageUrl = canonicalPublicUrl(`/vault/${encodeURIComponent(entry.slug)}`);
  const image = entryPreviewImage(entry);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: entry.media_type === "video" ? "video.other" : "website",
      ...(image ? { images: [{ url: image, alt: entry.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function VaultEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) notFound();

  const [taggedAvatars, filmmaking, ads, directory] = await Promise.all([
    getVaultAvatarsByIds(entry.avatar_ids ?? []),
    getPublishedVaultEntries("filmmaking"),
    getPublishedVaultEntries("ads"),
    getPublishedVaultAvatars(),
  ]);

  const allIds = new Set([...filmmaking, ...ads].map((e) => e.id));
  const counts = {
    all: allIds.size,
    filmmaking: filmmaking.length,
    ads: ads.length,
    avatars: directory.length,
  };

  return (
    <VaultCutExperience
      entry={entry}
      avatars={taggedAvatars}
      counts={counts}
      genres={collectFilmmakingGenres(filmmaking)}
    />
  );
}
