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
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { ensureVaultAvatarOgImage } from "@/lib/seo/vault-avatar-og";
import { canonicalPublicUrl, siteOriginForMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) return { title: "AI Avatar | YAIL Vault" };

  const origin = siteOriginForMetadata();
  const title = `${avatar.name} | YAIL Vault`;
  const description =
    avatar.tagline ?? avatar.bio ?? `${avatar.name} — AI Avatar character file from YAIL Vault.`;

  // Bake to S3 on first share if missing — WhatsApp needs a small public JPEG, not the huge DP.
  const stored = await ensureVaultAvatarOgImage(avatar);
  const bust = encodeURIComponent(avatar.updated_at || avatar.id);
  const pageUrl = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}?v=${bust}`);

  // Prefer static S3 JPEG. Also list same-origin API that returns raw JPEG bytes (no redirects).
  const s3Image = stored
    ? `${stored}${stored.includes("?") ? "&" : "?"}v=${bust}`
    : null;
  const apiImage = `${origin}/api/og/vault-avatar/${encodeURIComponent(avatar.slug)}?v=${bust}`;
  const primary = s3Image ?? apiImage;

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
          url: primary,
          secureUrl: primary,
          alt: `${avatar.name} — YAIL Vault AI Avatar`,
          type: "image/jpeg",
          width: OG_THUMB_WIDTH,
          height: OG_THUMB_HEIGHT,
        },
        ...(s3Image
          ? [
              {
                url: apiImage,
                secureUrl: apiImage,
                alt: `${avatar.name} — YAIL Vault AI Avatar`,
                type: "image/jpeg" as const,
                width: OG_THUMB_WIDTH,
                height: OG_THUMB_HEIGHT,
              },
            ]
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

export default async function VaultAvatarPage({ params }: Props) {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) notFound();

  // Warm the share thumb when someone opens the page (covers admin bake skips).
  void ensureVaultAvatarOgImage(avatar);

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
