import type { Metadata } from "next";
import PricingExperience from "./PricingExperience";
import { loadPublicServices } from "@/lib/services/load";
import { serviceCardImage } from "@/data/services";
import { pickOgImageForShare } from "@/lib/seo/og-image";

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

const TITLE = "Pricing | YourAI Lens Studio";
const DESCRIPTION =
  "Five clear packages: Starter, Growth, and Signature AI commercials, plus Product Visuals and Campaign Stills. Fixed scope, clear deliverables.";

export async function generateMetadata(): Promise<Metadata> {
  const services = await loadPublicServices();
  // Prefer a popular/featured package so the shared thumbnail is representative.
  const representative =
    services.find((s) => s.is_popular) ?? services.find((s) => s.is_featured) ?? services[0];
  const cover = representative ? serviceCardImage(representative) : null;
  const og = pickOgImageForShare(siteUrl(), cover ?? "/images/og-home.jpeg");
  const pageUrl = `${siteUrl()}/pricing`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: og.url,
          alt: "YourAILens Studios pricing",
          type: og.type,
          ...(og.width != null && og.height != null ? { width: og.width, height: og.height } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: og.url, alt: "YourAILens Studios pricing" }],
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

export default function PricingPage() {
  return <PricingExperience />;
}
