"use client";

import { useCallback } from "react";

export type PastedImage = { url: string; label: string };

async function uploadBlob(blob: Blob, filename: string) {
  const fd = new FormData();
  fd.append("file", blob, filename);
  const res = await fetch("/api/planner/upload", { method: "POST", body: fd });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !j.url) throw new Error(j.error || "Upload failed");
  return j.url;
}

/** Paste images from clipboard (tweet-style) into a list with optional labels. */
export function usePasteImages(
  images: PastedImage[],
  setImages: (next: PastedImage[]) => void,
  onError?: (msg: string) => void
) {
  return useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (!files.length) return;
      e.preventDefault();
      try {
        const uploaded: PastedImage[] = [];
        for (const file of files) {
          const url = await uploadBlob(file, file.name || `paste-${Date.now()}.png`);
          uploaded.push({ url, label: "" });
        }
        setImages([...images, ...uploaded]);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Paste upload failed");
      }
    },
    [images, setImages, onError]
  );
}

export async function uploadPlannerImage(file: File) {
  return uploadBlob(file, file.name);
}
