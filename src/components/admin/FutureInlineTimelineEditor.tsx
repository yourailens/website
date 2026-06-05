"use client";

import { useRef, useState } from "react";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import type { FutureFrameDraft } from "@/components/admin/FutureSequenceFrameFields";
import { emptyFrame } from "@/components/admin/FutureSequenceFrameFields";
import { FUTURE_COPY } from "@/data/the-future-copy";
import { MODULE_COVER_ASPECTS, type ModuleCoverAspectId } from "@/data/module-covers";

type Props = {
  frames: FutureFrameDraft[];
  onChange: (frames: FutureFrameDraft[]) => void;
  uploadSlug: string;
  uploadBlob: (blob: Blob, slug: string) => Promise<string>;
  uploadFile: (file: File, slug: string) => Promise<{ url: string; media_type: "image" | "video" }>;
};

export default function FutureInlineTimelineEditor({ frames, onChange, uploadSlug, uploadBlob, uploadFile }: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function patch(i: number, p: Partial<FutureFrameDraft>) {
    onChange(frames.map((f, idx) => (idx === i ? { ...f, ...p } : f)));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= frames.length) return;
    const next = [...frames];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  async function onCropComplete(blob: Blob) {
    if (!cropSrc) return;
    setBusy(true);
    try {
      const url = await uploadBlob(blob, uploadSlug);
      patch(cropIndex, { image_url: url, media_type: "image", video_url: "" });
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const cropRatio = MODULE_COVER_ASPECTS.find((a) => a.id === frames[cropIndex]?.aspect_ratio)?.ratio ?? 16 / 9;

  return (
    <div className="relative">
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          title={`Crop frame ${cropIndex + 1}`}
          lockAspect={cropRatio}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={onCropComplete}
        />
      ) : null}

      <div
        className="pointer-events-none absolute left-[1.15rem] top-4 bottom-4 hidden w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-transparent md:block"
        aria-hidden
      />

      <ol className="space-y-12 md:space-y-14">
        {frames.map((frame, i) => (
          <li key={i} className="relative md:pl-14">
            <span
              className="absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-600 bg-white font-mono text-[11px] font-black text-blue-700 shadow-sm"
              aria-hidden
            >
              {i + 1}
            </span>

            <article className="overflow-hidden rounded-2xl border-2 border-dashed border-blue-200/90 bg-white shadow-sm ring-1 ring-blue-50">
              <div className="border-b border-blue-50 bg-blue-50/40 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Frame {i + 1}
                </span>
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === frames.length - 1}
                    onClick={() => move(i, 1)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(frames.filter((_, idx) => idx !== i))}
                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {MODULE_COVER_ASPECTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => patch(i, { aspect_ratio: a.id })}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        frame.aspect_ratio === a.id ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                <FutureMediaBlock
                  mediaType={frame.media_type}
                  imageUrl={frame.image_url}
                  videoUrl={frame.video_url}
                  posterUrl={frame.poster_url}
                  aspectRatio={frame.aspect_ratio}
                  alt={frame.label || `Frame ${i + 1}`}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setCropIndex(i);
                      setTimeout(() => imageRef.current?.click(), 0);
                    }}
                    className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {frame.media_type === "image" && frame.image_url ? "Replace image (crop)" : "Add image (crop)"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setCropIndex(i);
                      setTimeout(() => videoRef.current?.click(), 0);
                    }}
                    className="rounded-full border border-blue-200 px-4 py-2 text-xs font-bold text-blue-800"
                  >
                    {frame.video_url ? "Replace video" : "Add video"}
                  </button>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  <label className="block">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Label (public headline)
                    </span>
                    <input
                      value={frame.label}
                      onChange={(e) => patch(i, { label: e.target.value })}
                      placeholder="e.g. First light on the horizon"
                      className="mt-1 w-full border-0 border-b-2 border-dashed border-slate-200 bg-transparent py-2 font-heading text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-400 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Caption
                    </span>
                    <textarea
                      value={frame.caption}
                      onChange={(e) => patch(i, { caption: e.target.value })}
                      rows={3}
                      placeholder="Supporting line shown under the media on the live page."
                      className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm leading-relaxed text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  {frame.media_type === "video" ? (
                    <label className="block text-xs font-bold text-slate-600">
                      Video poster URL (optional)
                      <input
                        value={frame.poster_url}
                        onChange={(e) => patch(i, { poster_url: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => onChange([...frames, emptyFrame()])}
        className="mt-10 w-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 py-8 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
      >
        + {FUTURE_COPY.addMoment}
      </button>

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
            patch(cropIndex, { video_url: url, image_url: "", media_type, poster_url: "" });
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {err ? <p className="mt-4 text-sm font-semibold text-red-600">{err}</p> : null}
    </div>
  );
}
