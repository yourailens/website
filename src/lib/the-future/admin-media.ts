import type { FutureMediaType } from "@/data/the-future";

export async function uploadFutureMedia(file: File, slug: string) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("slug", slug);
  const res = await fetch("/api/admin/the-future/upload-media", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; media_type?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return { url: data.url, media_type: (data.media_type ?? "image") as FutureMediaType };
}

export async function uploadFutureCropBlob(blob: Blob, slug: string) {
  const file = new File([blob], `frame-${Date.now()}.jpg`, { type: "image/jpeg" });
  const { url } = await uploadFutureMedia(file, slug);
  return url;
}

export function slugifyFuture(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
