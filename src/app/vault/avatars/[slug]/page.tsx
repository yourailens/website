import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultAvatarExperience from "@/components/vault/VaultAvatarExperience";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getPublishedVaultEntriesForAvatar,
  getVaultAvatarBySlug,
} from "@/lib/yail-vault/load";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { canonicalPublicUrl, siteOriginForMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) return { title: "AI Avatar | YAIL Vault" };

  const origin = siteOriginForMetadata();
  // Cache-bust WhatsApp's aggressive link preview cache when the DP changes.
  const bust = encodeURIComponent(avatar.updated_at || avatar.id);
  const pageUrl = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}?v=${bust}`);
  const title = `${avatar.name} | YAIL Vault`;
  const description =
    avatar.tagline ?? avatar.bio ?? `${avatar.name} — AI Avatar character file from YAIL Vault.`;

  // Prefer the pre-baked S3 JPEG (static, fast — WhatsApp-friendly).
  // Fall back to colocated opengraph-image / API only if bake hasn't run yet.
  const stored = avatar.og_image_url?.trim();
  const ogImage = stored
    ? `${stored}${stored.includes("?") ? "&" : "?"}v=${bust}`
    : `${origin}/vault/avatars/${encodeURIComponent(avatar.slug)}/opengraph-image?v=${bust}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}`) },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: "website",
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          alt: `${avatar.name} — YAIL Vault AI Avatar`,
          type: "image/jpeg",
          width: OG_THUMB_WIDTH,
          height: OG_THUMB_HEIGHT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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

  // Share link includes ?v= so WhatsApp re-scrapes instead of showing a blank cached card.
  const bust = encodeURIComponent(avatar.updated_at || avatar.id);
  const shareUrl = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}?v=${bust}`);

  return (
    <VaultAvatarExperience avatar={avatar} cuts={cuts} counts={counts} shareUrl={shareUrl} />
  );
}
