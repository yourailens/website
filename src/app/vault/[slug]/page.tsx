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
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { ensureVaultEntryOgImage, mediaSourceForOg } from "@/lib/seo/bake-og-image";
import { canonicalPublicUrl, siteOriginForMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) return { title: "YAIL Vault" };

  const origin = siteOriginForMetadata();
  const title = `${entry.title} | YAIL Vault`;
  const description = entry.caption ?? entry.notes ?? "GenAI lab cut from YAIL Vault.";
  const stored = await ensureVaultEntryOgImage(entry);
  const bust = encodeURIComponent(entry.updated_at || entry.id);
  const pageUrl = canonicalPublicUrl(`/vault/${encodeURIComponent(entry.slug)}`);
  const s3Image = stored ? `${stored}${stored.includes("?") ? "&" : "?"}v=${bust}` : null;
  const apiImage = `${origin}/api/og/vault-cut/${encodeURIComponent(entry.slug)}?v=${bust}`;
  const primary = s3Image ?? apiImage;
  const fallbackSource = mediaSourceForOg({
    poster_url: entry.poster_url,
    media_url: entry.media_url,
    media_type: entry.media_type,
  });

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
      images: [
        {
          url: primary,
          secureUrl: primary,
          alt: `${entry.title} — YAIL Vault`,
          type: "image/jpeg",
          width: OG_THUMB_WIDTH,
          height: OG_THUMB_HEIGHT,
        },
        ...(s3Image
          ? [
              {
                url: apiImage,
                secureUrl: apiImage,
                alt: `${entry.title} — YAIL Vault`,
                type: "image/jpeg" as const,
                width: OG_THUMB_WIDTH,
                height: OG_THUMB_HEIGHT,
              },
            ]
          : fallbackSource
            ? []
            : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primary],
    },
  };
}

export default async function VaultEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) notFound();

  void ensureVaultEntryOgImage(entry);

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
