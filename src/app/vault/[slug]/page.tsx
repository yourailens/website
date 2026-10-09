import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultCutExperience from "@/components/vault/VaultCutExperience";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getVaultAvatarById,
  getVaultEntryBySlug,
} from "@/lib/yail-vault/load";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function siteOrigin() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getVaultEntryBySlug(slug);
  if (!entry) return { title: "YAIL Vault" };
  const url = `${siteOrigin()}/vault/${encodeURIComponent(entry.slug)}`;
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

  const [avatar, filmmaking, ads, avatars] = await Promise.all([
    entry.avatar_id ? getVaultAvatarById(entry.avatar_id) : Promise.resolve(null),
    getPublishedVaultEntries("filmmaking"),
    getPublishedVaultEntries("ads"),
    getPublishedVaultAvatars(),
  ]);

  const allIds = new Set([...filmmaking, ...ads].map((e) => e.id));
  const counts = {
    all: allIds.size,
    filmmaking: filmmaking.length,
    ads: ads.length,
    avatars: avatars.length,
  };

  const shareUrl = `${siteOrigin()}/vault/${encodeURIComponent(entry.slug)}`;

  return (
    <VaultCutExperience entry={entry} avatar={avatar} counts={counts} shareUrl={shareUrl} />
  );
}
