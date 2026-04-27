import type { Metadata } from "next";
import { Unica_One, Comfortaa } from "next/font/google";
import {
  OG_FALLBACK_IMAGE_HEIGHT,
  OG_FALLBACK_IMAGE_PATH,
  OG_FALLBACK_IMAGE_WIDTH,
} from "@/lib/seo/og-image";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";
import RouteLoadingOverlay from "@/components/RouteLoadingOverlay";

const unicaOne = Unica_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-unica-one",
  display: "swap",
});

const comfortaa = Comfortaa({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const DEFAULT_TITLE = "Yourailens Studios | AI-Powered Ad, Media & Marketing Agency";
const DEFAULT_DESCRIPTION =
  "Premium AI-based creative agency specializing in advertising, media production, and brand marketing. Where creativity meets intelligence.";

function siteOrigin(): string {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

const ogHomeImageAbsolute = `${siteOrigin()}${OG_FALLBACK_IMAGE_PATH}`;

export const metadata: Metadata = {
  metadataBase: process.env.PUBLIC_SITE_URL
    ? new URL(process.env.PUBLIC_SITE_URL)
    : undefined,
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: "YourAILens Studios",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: OG_FALLBACK_IMAGE_PATH,
        width: OG_FALLBACK_IMAGE_WIDTH,
        height: OG_FALLBACK_IMAGE_HEIGHT,
        alt: "YourAILens Studios",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_FALLBACK_IMAGE_PATH,
        alt: "YourAILens Studios",
      },
    ],
  },
  other: {
    "og:image:secure_url": ogHomeImageAbsolute,
    "og:image:type": "image/jpeg",
    "og:image:width": String(OG_FALLBACK_IMAGE_WIDTH),
    "og:image:height": String(OG_FALLBACK_IMAGE_HEIGHT),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const base = siteOrigin();
  const ldOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "YourAILens Studios",
    url: base,
    email: SITE_CONTACT_EMAIL,
    address: { "@type": "PostalAddress", addressLocality: SITE_LOCATION_LINE, addressCountry: "IN" },
    sameAs: ["https://instagram.com/yourailens"],
  };

  const ldWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "YourAILens Studios",
    url: base,
  };

  return (
    <html lang="en" className={`scroll-smooth ${unicaOne.variable} ${comfortaa.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldOrg) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWebsite) }}
        />
      </head>
      <body className="antialiased">
        <RouteLoadingOverlay />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
