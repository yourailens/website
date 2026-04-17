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

export const metadata: Metadata = {
  title: "Yourailens Studios | AI-Powered Ad, Media & Marketing Agency",
  description:
    "Premium AI-based creative agency specializing in advertising, media production, and brand marketing. Where creativity meets intelligence.",
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
