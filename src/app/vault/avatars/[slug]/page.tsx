import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultAvatarExperience from "@/components/vault/VaultAvatarExperience";
import { collectFilmmakingGenres } from "@/lib/yail-vault/genres";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getPublishedVaultEntriesForAvatar,
  getVaultAvatarBySlug,
} from "@/lib/yail-vault/load";
import { canonicalPublicUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) return { title: "AI Avatar | YAIL Vault" };

  const title = `${avatar.name} | YAIL Vault`;
  const description =
    avatar.tagline ?? avatar.bio ?? `${avatar.name} — AI Avatar character file from YAIL Vault.`;
  const pageUrl = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}`);
  const image = avatar.portrait_url?.trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: "website",
      ...(image ? { images: [{ url: image, alt: `${avatar.name} — YAIL Vault AI Avatar` }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function VaultAvatarPage({ params }: Props) {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) notFound();

  const [cuts, filmmaking, ads, directory] = await Promise.all([
    getPublishedVaultEntriesForAvatar(avatar.id),
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
    <VaultAvatarExperience
      avatar={avatar}
      cuts={cuts}
      counts={counts}
      genres={collectFilmmakingGenres(filmmaking)}
    />
  );
}
