"use client";

import { useRef, useState } from "react";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import {
  ADMIN_BTN,
  ADMIN_BTN_DANGER,
  ADMIN_BTN_GHOST,
  ADMIN_FIELD,
  ADMIN_KICKER,
  ADMIN_LABEL,
  ADMIN_ROW,
} from "@/components/admin/admin-ui";
import { MODULE_COVER_ASPECTS } from "@/data/module-covers";
import type { StudioModuleAspect, StudioModuleMediaType } from "@/data/studio-modules";

const DISPLAY_ASPECTS: { id: StudioModuleAspect; label: string }[] = [
  { id: "natural", label: "Auto" },
  ...MODULE_COVER_ASPECTS.map((a) => ({ id: a.id as StudioModuleAspect, label: a.label })),
];

export type ModuleGalleryItemDraft = {
  media_type: StudioModuleMediaType;
  image_url: string;
  video_url: string;
  poster_url: string;
  aspect_ratio: StudioModuleAspect;
  caption: string;
  prompt: string;
};

export const emptyGalleryItem = (): ModuleGalleryItemDraft => ({
  media_type: "image",
  image_url: "",
  video_url: "",
  poster_url: "",
  aspect_ratio: "natural",
  caption: "",
  prompt: "",
});

type Props = {
  items: ModuleGalleryItemDraft[];
  onChange: (items: ModuleGalleryItemDraft[]) => void;
  uploadSlug: string;
  showPromptField?: boolean;
  allowUrlPaste?: boolean;
  uploadPath?: string;
};

async function uploadBlob(blob: Blob, slug: string, uploadPath: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, "crop.jpg");
  fd.append("slug", slug);
  const res = await fetch(uploadPath, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return ((await res.json()) as { url?: string }).url ?? "";
}

async function uploadFile(
  file: File,
  slug: string,
  uploadPath: string
): Promise<{ url: string; media_type: StudioModuleMediaType }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch(uploadPath, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = (await res.json()) as { url?: string; media_type?: StudioModuleMediaType };
  return { url: json.url ?? "", media_type: json.media_type ?? "image" };
}

function cropLockAspect(aspectId: StudioModuleAspect): number | undefined {
  if (aspectId === "natural") return undefined;
  const ratio = MODULE_COVER_ASPECTS.find((a) => a.id === aspectId)?.ratio;
  return ratio ?? undefined;
}

export default function ModuleGalleryEditor({
  items,
  onChange,
  uploadSlug,
  showPromptField = true,
  allowUrlPaste = false,
  uploadPath = "/api/admin/studio-modules/upload-media",
}: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const multiRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function patch(i: number, p: Partial<ModuleGalleryItemDraft>) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...p } : item)));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  async function uploadImageAt(index: number, file: File) {
    const { url } = await uploadFile(file, uploadSlug, uploadPath);
    patch(index, { image_url: url, media_type: "image", video_url: "", aspect_ratio: "natural" });
  }

  async function onCropComplete(blob: Blob) {
    if (!cropSrc) return;
    setBusy(true);
    setErr("");
    try {
      const url = await uploadBlob(blob, uploadSlug, uploadPath);
      patch(cropIndex, { image_url: url, media_type: "image", video_url: "" });
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const cropRatio = cropLockAspect(items[cropIndex]?.aspect_ratio ?? "natural");

  return (
    <div className="space-y-6">
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          title={`Crop item ${cropIndex + 1}`}
          lockAspect={cropRatio}
          onCancel={() => {
            if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={onCropComplete}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={ADMIN_KICKER}>Gallery items ({items.length})</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onChange([...items, emptyGalleryItem()])} className={`${ADMIN_BTN_GHOST} !py-1.5 text-xs`}>
            + Empty slot
          </button>
          <button type="button" onClick={() => multiRef.current?.click()} className={`${ADMIN_BTN} !py-1.5 text-xs`}>
            Upload multiple
          </button>
        </div>
      </div>

      <p className="text-xs text-white/40">
        Uploads keep the original image/video ratio. Use display ratio chips or crop only when you want to change it.
      </p>

      <input
        ref={multiRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          setErr("");
          try {
            const newItems = [...items];
            for (const f of files) {
              const slot = emptyGalleryItem();
              const { url, media_type } = await uploadFile(f, uploadSlug, uploadPath);
              if (media_type === "video") {
                slot.media_type = "video";
                slot.video_url = url;
              } else {
                slot.media_type = "image";
                slot.image_url = url;
              }
              slot.aspect_ratio = "natural";
              newItems.push(slot);
            }
            onChange(newItems);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />

      {err ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-200">{err}</p> : null}
      {busy ? <p className="text-sm font-semibold text-emerald-300">Uploading…</p> : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-12 text-center">
          <p className="text-sm text-white/45">No gallery items yet. Upload images or videos above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className={`${ADMIN_ROW} !p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className={ADMIN_KICKER}>Item {i + 1}</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/65 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/65 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => remove(i)} className={ADMIN_BTN_DANGER}>✕</button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="self-center text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  Display ratio
                </span>
                {DISPLAY_ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => patch(i, { aspect_ratio: a.id })}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      item.aspect_ratio === a.id
                        ? "bg-white text-black"
                        : "border border-white/15 text-white/55"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[200px_1fr]">
                <div className="overflow-hidden rounded-2xl bg-black/50">
                  {item.media_type === "video" && item.video_url ? (
                    <video src={item.video_url} className="max-h-56 w-full object-contain" muted playsInline controls />
                  ) : item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="max-h-56 w-full object-contain" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-white/35">No media</div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCropIndex(i);
                        imageRef.current?.click();
                      }}
                      className={`${ADMIN_BTN_GHOST} !py-1.5 text-xs`}
                    >
                      {item.image_url ? "Replace image" : "Add image"}
                    </button>
                    {item.image_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCropIndex(i);
                          setCropSrc(item.image_url);
                        }}
                        className={`${ADMIN_BTN_GHOST} !py-1.5 text-xs`}
                      >
                        Crop image
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setCropIndex(i);
                        videoRef.current?.click();
                      }}
                      className={`${ADMIN_BTN_GHOST} !py-1.5 text-xs`}
                    >
                      {item.video_url ? "Replace video" : "Add video"}
                    </button>
                  </div>

                  <div>
                    <label className={ADMIN_LABEL}>Caption</label>
                    <textarea
                      value={item.caption}
                      onChange={(e) => patch(i, { caption: e.target.value })}
                      rows={2}
                      placeholder="Optional caption…"
                      className={ADMIN_FIELD}
                    />
                  </div>

                  {allowUrlPaste ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className={ADMIN_LABEL}>Image URL</label>
                        <input
                          type="url"
                          value={item.image_url}
                          onChange={(e) =>
                            patch(i, { image_url: e.target.value, media_type: e.target.value ? "image" : item.media_type })
                          }
                          placeholder="https://…"
                          className={ADMIN_FIELD}
                        />
                      </div>
                      <div>
                        <label className={ADMIN_LABEL}>Video URL</label>
                        <input
                          type="url"
                          value={item.video_url}
                          onChange={(e) =>
                            patch(i, {
                              video_url: e.target.value,
                              media_type: e.target.value ? "video" : item.media_type,
                            })
                          }
                          placeholder="https://… or pasted upload link"
                          className={ADMIN_FIELD}
                        />
                      </div>
                    </div>
                  ) : null}

                  {showPromptField ? (
                    <div>
                      <label className={ADMIN_LABEL}>Prompt (optional)</label>
                      <textarea
                        value={item.prompt}
                        onChange={(e) => patch(i, { prompt: e.target.value })}
                        rows={4}
                        placeholder="Paste generation prompt here…"
                        className={`${ADMIN_FIELD} font-mono text-[12px]`}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setErr("");
          try {
            await uploadImageAt(cropIndex, f);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const { url } = await uploadFile(f, uploadSlug, uploadPath);
            patch(cropIndex, { video_url: url, image_url: "", media_type: "video", aspect_ratio: "natural" });
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
