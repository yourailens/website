import type { Metadata } from "next";
import PackageDetailExperience from "./PackageDetailExperience";
import { loadPublicService } from "@/lib/services/load";
import { serviceCardImage } from "@/data/services";
import { pickOgImageForShare } from "@/lib/seo/og-image";

type Props = { params: Promise<{ slug: string }> };

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await loadPublicService(slug);
  if (!service) return { title: "Package | YourAI Lens Studio" };

  const title = `${service.name} | Pricing · YourAI Lens Studio`;
  const description = service.tagline ?? service.description ?? `${service.name} package details.`;
  const pageUrl = `${siteUrl()}/pricing/${service.slug}`;
  const cover = serviceCardImage(service);
  const og = pickOgImageForShare(siteUrl(), cover ?? "/images/og-home.jpeg");

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: og.url,
          alt: service.name,
          type: og.type,
          ...(og.width != null && og.height != null ? { width: og.width, height: og.height } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: og.url, alt: service.name }],
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

export default function PackageDetailPage() {
  return <PackageDetailExperience />;
}
