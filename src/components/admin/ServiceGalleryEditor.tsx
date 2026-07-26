"use client";

import { useRef, useState } from "react";
import type { ServiceHeroMediaType } from "@/data/services";

export type ServiceGalleryDraft = {
  media_type: ServiceHeroMediaType;
  image_url: string;
  video_url: string;
  poster_url: string;
  caption: string;
};

export const emptyServiceGalleryItem = (): ServiceGalleryDraft => ({
  media_type: "image",
  image_url: "",
  video_url: "",
  poster_url: "",
  caption: "",
});

async function uploadFile(
  file: File,
  slug: string
): Promise<{ url: string; media_type: ServiceHeroMediaType }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/services/upload-media", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = (await res.json()) as { url?: string; media_type?: ServiceHeroMediaType };
  return { url: json.url ?? "", media_type: json.media_type ?? "image" };
}

export default function ServiceGalleryEditor({
  items,
  onChange,
  uploadSlug,
}: {
  items: ServiceGalleryDraft[];
  onChange: (items: ServiceGalleryDraft[]) => void;
  uploadSlug: string;
}) {
  const multiRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (i: number, partial: Partial<ServiceGalleryDraft>) => {
    const next = [...items];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const added: ServiceGalleryDraft[] = [];
      for (const file of Array.from(files)) {
        const { url, media_type } = await uploadFile(file, uploadSlug);
        added.push({
          media_type,
          image_url: media_type === "image" ? url : "",
          video_url: media_type === "video" ? url : "",
          poster_url: "",
          caption: "",
        });
      }
      onChange([...items, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (multiRef.current) multiRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Package gallery</p>
          <p className="text-xs text-slate-500">
            Images and videos shown on the package page. Upload multiple at once.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => multiRef.current?.click()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {busy ? "Uploading…" : "+ Add media"}
        </button>
        <input
          ref={multiRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
          No gallery items yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex gap-3">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item.media_type === "video" && item.video_url ? (
                    <video src={item.video_url} className="h-full w-full object-cover" muted />
                  ) : item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.media_type} · #{i + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <input
                    value={item.caption}
                    onChange={(e) => patch(i, { caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
