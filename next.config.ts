import type { NextConfig } from "next";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "logo.clearbit.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "cdn.openai.com",
    pathname: "/**",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    if (hostname) {
      remotePatterns.push({
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Invalid NEXT_PUBLIC_SUPABASE_URL — skip Supabase image host
  }
}

const nextConfig: NextConfig = {
  // Native binaries (ffmpeg) must resolve from node_modules at runtime on Vercel.
  serverExternalPackages: ["ffmpeg-static", "sharp"],
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      { source: "/resources", destination: "/modules", permanent: true },
      { source: "/prompts", destination: "/modules", permanent: true },
      { source: "/prompts/:path*", destination: "/modules", permanent: true },
      { source: "/outfits", destination: "/modules", permanent: true },
      { source: "/outfits/:path*", destination: "/modules", permanent: true },
      { source: "/character-sheets", destination: "/modules", permanent: true },
      { source: "/character-sheets/:path*", destination: "/modules", permanent: true },
      { source: "/scenarios", destination: "/modules", permanent: true },
      { source: "/scenarios/:path*", destination: "/modules", permanent: true },
      { source: "/locations", destination: "/modules", permanent: true },
      { source: "/locations/:path*", destination: "/modules", permanent: true },
      { source: "/props", destination: "/modules", permanent: true },
      { source: "/props/:path*", destination: "/modules", permanent: true },
      { source: "/lighting-presets", destination: "/modules", permanent: true },
      { source: "/lighting-presets/:path*", destination: "/modules", permanent: true },
      { source: "/color-grades", destination: "/modules", permanent: true },
      { source: "/color-grades/:path*", destination: "/modules", permanent: true },
      { source: "/mood-boards", destination: "/modules", permanent: true },
      { source: "/mood-boards/:path*", destination: "/modules", permanent: true },
    ];
  },
};

export default nextConfig;
