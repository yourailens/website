import type { Metadata } from "next";
import { Unica_One, Comfortaa } from "next/font/google";
import "./globals.css";

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

/** Dedicated social preview asset (smaller JPEG than hero PNG — better for WhatsApp / OG crawlers). */
const OG_HOME_IMAGE_PATH = "/images/og-home.jpeg";
/** Actual dimensions of `public/images/og-home.jpeg` */
const OG_HOME_WIDTH = 1179;
const OG_HOME_HEIGHT = 1372;

function siteOrigin(): string {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

const ogHomeImageAbsolute = `${siteOrigin()}${OG_HOME_IMAGE_PATH}`;

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
    siteName: "YourAILens Studio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: OG_HOME_IMAGE_PATH,
        width: OG_HOME_WIDTH,
        height: OG_HOME_HEIGHT,
        alt: "YourAILens Studio",
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
        url: OG_HOME_IMAGE_PATH,
        alt: "YourAILens Studio",
      },
    ],
  },
  other: {
    "og:image:secure_url": ogHomeImageAbsolute,
    "og:image:type": "image/jpeg",
    "og:image:width": String(OG_HOME_WIDTH),
    "og:image:height": String(OG_HOME_HEIGHT),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${unicaOne.variable} ${comfortaa.variable}`}>
      <head />
      <body className="antialiased">{children}</body>
    </html>
  );
}
