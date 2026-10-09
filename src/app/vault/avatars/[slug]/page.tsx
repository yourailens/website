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

  const url = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}`);
  const title = `${avatar.name} | YAIL Vault`;
  const description =
    avatar.tagline ?? avatar.bio ?? `${avatar.name} — AI Avatar character file from YAIL Vault.`;
  // Short path on our origin — sharp compresses the DP to 1200×630 for WhatsApp.
  const ogImage = `${siteOriginForMetadata()}/api/og/vault-avatar/${encodeURIComponent(avatar.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
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
      images: [{ url: ogImage, alt: `${avatar.name} — YAIL Vault AI Avatar` }],
    },
    other: {
      "og:image:secure_url": ogImage,
      "og:image:type": "image/jpeg",
      "og:image:width": String(OG_THUMB_WIDTH),
      "og:image:height": String(OG_THUMB_HEIGHT),
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

  const shareUrl = canonicalPublicUrl(`/vault/avatars/${encodeURIComponent(avatar.slug)}`);

  return (
    <VaultAvatarExperience avatar={avatar} cuts={cuts} counts={counts} shareUrl={shareUrl} />
  );
}
