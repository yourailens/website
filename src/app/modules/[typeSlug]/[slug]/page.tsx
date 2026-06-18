import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModuleGalleryExperience from "../../ModuleGalleryExperience";
import { getStudioModuleBySlug } from "@/lib/studio-modules/load";
import {
  studioModuleShareImageUrl,
  studioModuleTypeFromSlug,
  studioModuleTypeSlug,
} from "@/data/studio-modules";
import { pickOgImageForShare } from "@/lib/seo/og-image";

type Props = { params: Promise<{ typeSlug: string; slug: string }> };

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeSlug, slug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) return { title: "Module" };

  const mod = await getStudioModuleBySlug(type, slug);
  if (!mod) return { title: "Module" };

  const origin = siteUrl();
  const pageUrl = `${origin}/modules/${studioModuleTypeSlug(type)}/${encodeURIComponent(slug)}`;
  const title = `${mod.title} | YourAI Lens Studio`;
  const description = mod.description ?? `Gallery: ${mod.title}`;
  const shareSrc = studioModuleShareImageUrl(mod, mod.items);

  if (!shareSrc) {
    return { title, description, alternates: { canonical: pageUrl } };
  }

  const og = pickOgImageForShare(origin, shareSrc);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      images: [
        {
          url: og.url,
          secureUrl: og.url.startsWith("https://") ? og.url : undefined,
          alt: mod.title,
          type: og.type,
          ...(og.width != null && og.height != null
            ? { width: og.width, height: og.height }
            : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: og.url, alt: mod.title }],
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

export default async function ModuleDetailPage({ params }: Props) {
  const { typeSlug, slug } = await params;
  const type = studioModuleTypeFromSlug(typeSlug);
  if (!type) notFound();

  const mod = await getStudioModuleBySlug(type, slug);
  if (!mod) notFound();

  return <ModuleGalleryExperience mod={mod} />;
}
