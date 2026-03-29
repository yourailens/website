import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
