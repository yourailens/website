/**
 * Extract S3 object key from a public URL for our bucket (virtual-hosted or path-style).
 */
export function tryS3ObjectKeyFromUrl(publicUrl: string, bucket: string): string | null {
  let u: URL;
  try {
    u = new URL(publicUrl.trim());
  } catch {
    return null;
  }
  const path = u.pathname.replace(/^\//, "");
  if (!path) return null;

  const host = u.hostname;

  if (host.startsWith(`${bucket}.`) && host.includes("amazonaws.com")) {
    return path
      .split("/")
      .map((seg) => {
        try {
          return decodeURIComponent(seg);
        } catch {
          return seg;
        }
      })
      .join("/");
  }

  if (host.startsWith("s3.") && host.includes("amazonaws.com")) {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === bucket) {
      return parts
        .slice(1)
        .map((seg) => {
          try {
            return decodeURIComponent(seg);
          } catch {
            return seg;
          }
        })
        .join("/");
    }
  }

  return null;
}

export function safeObjectFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}
