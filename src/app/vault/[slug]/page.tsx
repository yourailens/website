import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultCutExperience from "@/components/vault/VaultCutExperience";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getVaultAvatarsByIds,
  getVaultEntryBySlug,
} from "@/lib/yail-vault/load";
import { canonicalPublicUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) return { title: "YAIL Vault" };
  const url = canonicalPublicUrl(`/vault/${encodeURIComponent(entry.slug)}`);
  return {
    title: `${entry.title} | YAIL Vault`,
    description: entry.caption ?? entry.notes ?? "GenAI lab cut from YAIL Vault.",
    openGraph: {
      title: `${entry.title} | YAIL Vault`,
      description: entry.caption ?? "GenAI lab cut from YAIL Vault.",
      url,
      type: "video.other",
      images: entry.poster_url
        ? [{ url: entry.poster_url }]
        : entry.media_type === "image"
          ? [{ url: entry.media_url }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.title} | YAIL Vault`,
      description: entry.caption ?? "GenAI lab cut from YAIL Vault.",
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

  const shareUrl = canonicalPublicUrl(`/vault/${encodeURIComponent(entry.slug)}`);

  return (
    <VaultCutExperience
      entry={entry}
      avatars={taggedAvatars}
      counts={counts}
      shareUrl={shareUrl}
    />
  );
}
