import { uploadObjectToS3 } from "@/lib/s3/client";

/**
 * Fetch a JPEG from an existing same-origin OG route and store it on S3.
 * Keeps rebuild-og admin functions free of sharp (which blows the 250MB limit).
 */
export async function persistOgJpegFromApiRoute(args: {
  /** Absolute origin of this deployment, e.g. from `new URL(req.url).origin`. */
  origin: string;
  /** Path like `/api/og/ott-cut/my-slug`. */
  apiPath: string;
  s3Prefix: string;
  slug: string;
}): Promise<string> {
  const origin = args.origin.replace(/\/+$/, "");
  const path = args.apiPath.startsWith("/") ? args.apiPath : `/${args.apiPath}`;
  const url = `${origin}${path}${path.includes("?") ? "&" : "?"}persist=1`;

  const res = await fetch(url, {
    headers: { Accept: "image/jpeg,image/*" },
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) {
    throw new Error(`OG route returned ${res.status}`);
  }

  const ab = await res.arrayBuffer();
  if (!ab.byteLength) throw new Error("Empty OG image");
  const jpeg = Buffer.from(ab);

  const safe = args.slug.replace(/[^a-z0-9\-]/gi, "").toLowerCase() || "cut";
  const prefix = args.s3Prefix.replace(/\/+$/, "") || "yail-vault";
  const type = res.headers.get("content-type") || "image/png";
  const ext = type.includes("jpeg") || type.includes("jpg") ? "jpg" : "png";
  const key = `${prefix}/og-${safe}.${ext}`;
  const { publicUrl } = await uploadObjectToS3(key, jpeg, type.startsWith("image/") ? type : "image/png");
  return publicUrl;
}
