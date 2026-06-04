"use client";

import type { IndustryAspectRatio, IndustryMediaType } from "@/data/industries";
import { ASPECT_RATIO_OPTIONS, MEDIA_TYPE_OPTIONS } from "@/lib/industries/media";

export type MediaSlotValue = {
  url: string;
  mediaType: IndustryMediaType;
  aspectRatio: IndustryAspectRatio;
  posterUrl: string;
  caption: string;
};

export function MediaSlotFields({
  label,
  hint,
  value,
  onChange,
  onUpload,
  onAfterUpload,
}: {
  label: string;
  hint?: string;
  value: MediaSlotValue;
  onChange: (v: MediaSlotValue) => void;
  onUpload: (file: File) => Promise<{ url: string; media_type: IndustryMediaType }>;
  /** Called after a successful file upload (e.g. auto-save to DB) */
  onAfterUpload?: (v: MediaSlotValue) => void | Promise<void>;
}) {
  const set = <K extends keyof MediaSlotValue>(key: K, v: MediaSlotValue[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-bold text-slate-800">{label}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p> : null}

      <label className="mt-3 block text-[10px] font-medium text-slate-600">
        Media URL
        <input
          value={value.url}
          onChange={(e) => set("url", e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>

      <input
        type="file"
        accept="image/*,video/*"
        className="mt-2 w-full text-xs"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const { url, media_type } = await onUpload(f);
          const next = { ...value, url, mediaType: media_type };
          onChange(next);
          await onAfterUpload?.(next);
          e.target.value = "";
        }}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <fieldset>
          <legend className="text-[10px] font-medium text-slate-600">Type</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {MEDIA_TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  value.mediaType === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`${label}-type`}
                  className="sr-only"
                  checked={value.mediaType === opt.value}
                  onChange={() => set("mediaType", opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[10px] font-medium text-slate-600">Aspect ratio</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {ASPECT_RATIO_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                  value.aspectRatio === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={`${label}-aspect`}
                  className="sr-only"
                  checked={value.aspectRatio === opt.value}
                  onChange={() => set("aspectRatio", opt.value)}
                />
                {opt.label}
                <span className="ml-1 font-normal opacity-70">{opt.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {value.mediaType === "video" ? (
        <label className="mt-3 block text-[10px] font-medium text-slate-600">
          Video poster image URL (optional)
          <input
            value={value.posterUrl}
            onChange={(e) => set("posterUrl", e.target.value)}
            placeholder="Thumbnail before play"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}

      <label className="mt-3 block text-[10px] font-medium text-slate-600">
        Caption / description (shown under the visual on the live page)
        <textarea
          value={value.caption}
          onChange={(e) => set("caption", e.target.value)}
          rows={2}
          placeholder="What should the client notice in this visual?"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
    </div>
  );
}

export function MediaTypeAspectPickers({
  mediaType,
  aspectRatio,
  onMediaType,
  onAspectRatio,
  namePrefix,
}: {
  mediaType: IndustryMediaType;
  aspectRatio: IndustryAspectRatio;
  onMediaType: (t: IndustryMediaType) => void;
  onAspectRatio: (r: IndustryAspectRatio) => void;
  namePrefix: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <fieldset>
        <legend className="text-[10px] font-medium text-slate-600">Type</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {MEDIA_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-md border px-2 py-1 text-[10px] font-bold ${
                mediaType === opt.value
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <input
                type="radio"
                name={`${namePrefix}-type`}
                className="sr-only"
                checked={mediaType === opt.value}
                onChange={() => onMediaType(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[10px] font-medium text-slate-600">Ratio</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ASPECT_RATIO_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-md border px-2 py-1 text-[10px] font-bold ${
                aspectRatio === opt.value
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <input
                type="radio"
                name={`${namePrefix}-aspect`}
                className="sr-only"
                checked={aspectRatio === opt.value}
                onChange={() => onAspectRatio(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
