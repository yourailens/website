import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VaultAvatarExperience from "@/components/vault/VaultAvatarExperience";
import {
  getPublishedVaultAvatars,
  getPublishedVaultEntries,
  getPublishedVaultEntriesForAvatar,
  getVaultAvatarBySlug,
} from "@/lib/yail-vault/load";
import { pickOgImageForShare } from "@/lib/seo/og-image";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function siteOrigin() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar) return { title: "AI Avatar | YAIL Vault" };

  const url = `${siteOrigin()}/vault/avatars/${encodeURIComponent(avatar.slug)}`;
  const title = `${avatar.name} | YAIL Vault`;
  const description =
    avatar.tagline ?? avatar.bio ?? `${avatar.name} — AI Avatar character file from YAIL Vault.`;
  const og = pickOgImageForShare(siteOrigin(), avatar.portrait_url);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [
        {
          url: og.url,
          secureUrl: og.url.startsWith("https://") ? og.url : undefined,
          alt: `${avatar.name} — YAIL Vault AI Avatar`,
          type: og.type,
          ...(og.width != null && og.height != null ? { width: og.width, height: og.height } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: og.url, alt: `${avatar.name} — YAIL Vault AI Avatar` }],
    },
    other: {
      "og:image:secure_url": og.url,
      "og:image:type": og.type,
      ...(og.width != null && og.height != null
        ? { "og:image:width": String(og.width), "og:image:height": String(og.height) }
        : {}),
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

  const shareUrl = `${siteOrigin()}/vault/avatars/${encodeURIComponent(avatar.slug)}`;

  return (
    <VaultAvatarExperience avatar={avatar} cuts={cuts} counts={counts} shareUrl={shareUrl} />
  );
}
