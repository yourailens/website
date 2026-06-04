"use client";

import type {
  SampleBrandAspectRatio,
  SampleBrandMediaType,
} from "@/data/sample-brands";
import {
  SAMPLE_BRAND_ASPECT_RATIOS,
} from "@/data/sample-brands";

export type SampleBrandSlotValue = {
  url: string;
  mediaType: SampleBrandMediaType;
  aspectRatio: SampleBrandAspectRatio;
  posterUrl: string;
  caption: string;
};

const MEDIA_TYPES: { value: SampleBrandMediaType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

export function SampleBrandMediaSlotFields({
  label,
  hint,
  value,
  onChange,
  onUpload,
  onAfterUpload,
  showCaption = true,
}: {
  label: string;
  hint?: string;
  value: SampleBrandSlotValue;
  onChange: (v: SampleBrandSlotValue) => void;
  onUpload: (file: File) => Promise<{ url: string; media_type: SampleBrandMediaType }>;
  onAfterUpload?: (v: SampleBrandSlotValue) => void | Promise<void>;
  showCaption?: boolean;
}) {
  const set = <K extends keyof SampleBrandSlotValue>(key: K, v: SampleBrandSlotValue[K]) =>
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
            {MEDIA_TYPES.map((opt) => (
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
            {SAMPLE_BRAND_ASPECT_RATIOS.map((opt) => (
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
          Poster frame URL
          <input
            value={value.posterUrl}
            onChange={(e) => set("posterUrl", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}

      {showCaption ? (
        <label className="mt-3 block text-[10px] font-medium text-slate-600">
          Caption (optional, subtle on site)
          <input
            value={value.caption}
            onChange={(e) => set("caption", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}
    </div>
  );
}
