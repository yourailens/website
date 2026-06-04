"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import AvatarCropModal from "@/components/avatars/AvatarCropModal";
import {
  MODULE_COVER_ASPECTS,
  type CoverVariantEntry,
  type ModuleCoverAspectId,
  type ModuleCoverVariants,
} from "@/data/module-covers";

type Props = {
  slug: string;
  variants: ModuleCoverVariants;
  primaryAspect: ModuleCoverAspectId;
  onVariantsChange: (v: ModuleCoverVariants) => void;
  onPrimaryAspectChange: (id: ModuleCoverAspectId) => void;
  uploadBlob: (blob: Blob, slug: string, aspectId: ModuleCoverAspectId) => Promise<string>;
  uploadMediaFile: (file: File, slug: string, aspectId: ModuleCoverAspectId) => Promise<CoverVariantEntry>;
};

export default function ModuleCoverFields({
  slug,
  variants,
  primaryAspect,
  onVariantsChange,
  onPrimaryAspectChange,
  uploadBlob,
  uploadMediaFile,
}: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [activeAspect, setActiveAspect] = useState<ModuleCoverAspectId>(primaryAspect);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function setVariant(id: ModuleCoverAspectId, entry: CoverVariantEntry) {
    onVariantsChange({ ...variants, [id]: entry });
    if (!variants[primaryAspect]) onPrimaryAspectChange(id);
  }

  function onImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setCropSrc(URL.createObjectURL(f));
  }

  async function onCropComplete(blob: Blob) {
    if (!cropSrc) return;
    setBusy(true);
    setErr("");
    try {
      const url = await uploadBlob(blob, slug, activeAspect);
      setVariant(activeAspect, { url, media_type: "image" });
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const entry = await uploadMediaFile(f, slug, activeAspect);
      setVariant(activeAspect, entry);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function removeAspect(id: ModuleCoverAspectId) {
    const next = { ...variants };
    delete next[id];
    onVariantsChange(next);
  }

  const activeMeta = MODULE_COVER_ASPECTS.find((a) => a.id === activeAspect)!;
  const active = variants[activeAspect];

  return (
    <div className="mt-4 space-y-4">
      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          title={`Crop cover — ${activeMeta.label}`}
          lockAspect={activeMeta.ratio}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={onCropComplete}
        />
      ) : null}

      <p className="text-xs text-slate-500">
        Per ratio: upload a cropped <strong>image</strong> or a full <strong>video</strong> (no crop). Great for trailer / motion modules.
      </p>

      <div className="flex flex-wrap gap-2">
        {MODULE_COVER_ASPECTS.map((a) => {
          const has = Boolean(variants[a.id]?.url);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveAspect(a.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeAspect === a.id
                  ? "bg-blue-600 text-white shadow-md"
                  : has
                    ? "border border-blue-200 bg-blue-50 text-blue-800"
                    : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {a.label}
              {has ? (variants[a.id]?.media_type === "video" ? " ▶" : " ✓") : ""}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/40 to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-heading text-sm font-bold text-slate-900">
            {activeMeta.label} — {activeMeta.hint}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={busy}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {active?.media_type === "image" ? "Re-crop image" : "Upload image"}
            </button>
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              disabled={busy}
              className="rounded-full border-2 border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-50 disabled:opacity-60"
            >
              {active?.media_type === "video" ? "Replace video" : "Upload video"}
            </button>
            {active ? (
              <button type="button" onClick={() => removeAspect(activeAspect)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600">
                Remove
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={`relative mx-auto mt-4 max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${activeMeta.className}`}
        >
          {active?.media_type === "video" ? (
            <video src={active.url} controls className="h-full w-full object-cover" />
          ) : active?.url ? (
            <Image src={active.url} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center text-sm font-semibold text-slate-400">
              No media yet
            </div>
          )}
        </div>

        <fieldset className="mt-4">
          <legend className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Default card ratio
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODULE_COVER_ASPECTS.map((a) => (
              <label
                key={a.id}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold ${
                  primaryAspect === a.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
                } ${!variants[a.id]?.url ? "opacity-40" : ""}`}
              >
                <input
                  type="radio"
                  name="cover-primary"
                  className="sr-only"
                  disabled={!variants[a.id]?.url}
                  checked={primaryAspect === a.id}
                  onChange={() => onPrimaryAspectChange(a.id)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={onImagePick} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={onVideoPick} />
      {err ? <p className="text-sm font-semibold text-red-600">{err}</p> : null}
    </div>
  );
}
