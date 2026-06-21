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
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      {
        source: "/modules/products-visuals",
        destination: "/modules/subjects-visuals",
        permanent: true,
      },
      {
        source: "/modules/products-visuals/:slug",
        destination: "/modules/subjects-visuals/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
