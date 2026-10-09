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
  {
    protocol: "https",
    hostname: "i.ytimg.com",
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

const s3Bucket = process.env.AWS_S3_BUCKET?.trim();
const s3Region = (process.env.AWS_S3_REGION ?? process.env.AWS_REGION)?.trim();
if (s3Bucket && s3Region) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${s3Bucket}.s3.${s3Region}.amazonaws.com`,
    pathname: "/**",
  });
} else {
  // Public industry/gallery assets (virtual-hosted style)
  remotePatterns.push({
    protocol: "https",
    hostname: "yourailens.s3.ap-south-1.amazonaws.com",
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  // Native binaries (ffmpeg) must resolve from node_modules at runtime on Vercel.
  serverExternalPackages: ["ffmpeg-static", "sharp"],
  // Keep huge static media + unused native binaries out of serverless function traces
  // (homepage was packing ~1GB of public/videos into the index function via fs tracing).
  // ffmpeg-static alone is ~70MB+; sharp ships multi-platform libvips (~200MB+).
  outputFileTracingExcludes: {
    "*": [
      "./public/videos/**/*.mp4",
      "./public/videos/**/*.mov",
      "./public/videos/**/*.webm",
      "node_modules/ffmpeg-static/**/*",
      "node_modules/@img/sharp-libvips-darwin*/**/*",
      "node_modules/@img/sharp-libvips-linuxmusl*/**/*",
      "node_modules/@img/sharp-libvips-linux-arm*/**/*",
      "node_modules/@img/sharp-darwin*/**/*",
      "node_modules/@img/sharp-win32*/**/*",
      "node_modules/@img/sharp-wasm32*/**/*",
      "node_modules/@img/sharp-linux-arm*/**/*",
      "node_modules/@img/sharp-linuxmusl*/**/*",
    ],
  },
  // Only poster-extraction routes need the ffmpeg binary traced in.
  outputFileTracingIncludes: {
    "/api/admin/ott-cuts/upload-media": ["./node_modules/ffmpeg-static/**/*"],
    "/api/admin/yail-vault/upload-media": ["./node_modules/ffmpeg-static/**/*"],
    "/api/admin/upload-film": ["./node_modules/ffmpeg-static/**/*"],
    "/api/admin/regenerate-film-poster": ["./node_modules/ffmpeg-static/**/*"],
  },
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/world-of-ai",
        destination: "/ai-verse",
        permanent: true,
      },
      // Industries, modules, libraries, and avatars are retired from the public site.
      { source: "/avatars", destination: "/", permanent: true },
      { source: "/avatars/:path*", destination: "/", permanent: true },
      { source: "/industries", destination: "/", permanent: true },
      { source: "/industries/:path*", destination: "/", permanent: true },
      { source: "/modules", destination: "/", permanent: true },
      { source: "/modules/:path*", destination: "/", permanent: true },
      { source: "/resources", destination: "/", permanent: true },
      { source: "/resources/:path*", destination: "/", permanent: true },
      { source: "/character-sheets", destination: "/", permanent: true },
      { source: "/character-sheets/:path*", destination: "/", permanent: true },
      { source: "/outfits", destination: "/", permanent: true },
      { source: "/outfits/:path*", destination: "/", permanent: true },
      { source: "/props", destination: "/", permanent: true },
      { source: "/props/:path*", destination: "/", permanent: true },
      { source: "/scenarios", destination: "/", permanent: true },
      { source: "/scenarios/:path*", destination: "/", permanent: true },
      { source: "/locations", destination: "/", permanent: true },
      { source: "/locations/:path*", destination: "/", permanent: true },
      { source: "/mood-boards", destination: "/", permanent: true },
      { source: "/mood-boards/:path*", destination: "/", permanent: true },
      { source: "/prompts", destination: "/", permanent: true },
      { source: "/prompts/:path*", destination: "/", permanent: true },
      { source: "/lighting-presets", destination: "/", permanent: true },
      { source: "/lighting-presets/:path*", destination: "/", permanent: true },
      { source: "/color-grades", destination: "/", permanent: true },
      { source: "/color-grades/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
