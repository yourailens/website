"use client";

import { useRef, useState } from "react";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import { MODULE_COVER_ASPECTS, type ModuleCoverAspectId } from "@/data/module-covers";
import type { FutureMediaType } from "@/data/the-future";

export type FutureFrameDraft = {
  label: string;
  caption: string;
  media_type: FutureMediaType;
  image_url: string;
  video_url: string;
  poster_url: string;
  aspect_ratio: ModuleCoverAspectId;
};

export const emptyFrame = (): FutureFrameDraft => ({
  label: "",
  caption: "",
  media_type: "image",
  image_url: "",
  video_url: "",
  poster_url: "",
  aspect_ratio: "landscape",
});

type Props = {
  frames: FutureFrameDraft[];
  onChange: (frames: FutureFrameDraft[]) => void;
  uploadSlug: string;
  uploadBlob: (blob: Blob, slug: string) => Promise<string>;
  uploadFile: (file: File, slug: string) => Promise<{ url: string; media_type: FutureMediaType }>;
};

export default function FutureSequenceFrameFields({
  frames,
  onChange,
  uploadSlug,
  uploadBlob,
  uploadFile,
}: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function updateFrame(i: number, patch: Partial<FutureFrameDraft>) {
    onChange(frames.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function moveFrame(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= frames.length) return;
    const next = [...frames];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function removeFrame(i: number) {
    onChange(frames.filter((_, idx) => idx !== i));
  }

  async function onCropComplete(blob: Blob) {
    if (!cropSrc) return;
    setBusy(true);
    setErr("");
    try {
      const url = await uploadBlob(blob, uploadSlug);
      updateFrame(cropIndex, { image_url: url, media_type: "image", video_url: "" });
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const cropAspect = MODULE_COVER_ASPECTS.find((a) => a.id === frames[cropIndex]?.aspect_ratio)?.ratio ?? 16 / 9;

  return (
    <div className="space-y-6">
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          title={`Crop frame ${cropIndex + 1} — ${frames[cropIndex]?.aspect_ratio}`}
          lockAspect={cropAspect}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={onCropComplete}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
          Moments ({frames.length})
        </p>
        <button
          type="button"
          onClick={() => onChange([...frames, emptyFrame()])}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          + Add frame
        </button>
      </div>

      {frames.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          No moments yet. Add image or video steps visitors will scroll through.
        </p>
      ) : null}

      {frames.map((frame, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">#{String(i + 1).padStart(2, "0")}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveFrame(i, -1)} disabled={i === 0} className="rounded-lg border px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30">
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveFrame(i, 1)}
                disabled={i === frames.length - 1}
                className="rounded-lg border px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30"
              >
                ↓
              </button>
              <button type="button" onClick={() => removeFrame(i)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600">
                Remove
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Label
                <input
                  value={frame.label}
                  onChange={(e) => updateFrame(i, { label: e.target.value })}
                  placeholder="e.g. Opening hypothesis"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Caption
                <textarea
                  value={frame.caption}
                  onChange={(e) => updateFrame(i, { caption: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Aspect ratio</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {MODULE_COVER_ASPECTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => updateFrame(i, { aspect_ratio: a.id })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        frame.aspect_ratio === a.id ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setCropIndex(i);
                    setTimeout(() => imageRef.current?.click(), 0);
                  }}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {frame.media_type === "image" && frame.image_url ? "Re-crop image" : "Upload + crop image"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setCropIndex(i);
                    videoRef.current?.click();
                  }}
                  className="rounded-full border border-blue-200 px-4 py-2 text-xs font-bold text-blue-800 disabled:opacity-60"
                >
                  Upload video
                </button>
              </div>
              {frame.media_type === "video" ? (
                <label className="block text-xs font-bold text-slate-700">
                  Poster URL (optional)
                  <input
                    value={frame.poster_url}
                    onChange={(e) => updateFrame(i, { poster_url: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              ) : null}
            </div>
            <FutureMediaBlock
              mediaType={frame.media_type}
              imageUrl={frame.image_url}
              videoUrl={frame.video_url}
              posterUrl={frame.poster_url}
              aspectRatio={frame.aspect_ratio}
              alt={frame.label || `Frame ${i + 1}`}
            />
          </div>
        </div>
      ))}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setCropSrc(URL.createObjectURL(f));
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
            const { url, media_type } = await uploadFile(f, uploadSlug);
            updateFrame(cropIndex, { video_url: url, image_url: "", media_type, poster_url: "" });
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {err ? <p className="text-sm font-semibold text-red-600">{err}</p> : null}
    </div>
  );
}
