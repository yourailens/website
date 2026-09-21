"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { getCroppedImageBlob, type PixelCrop } from "@/lib/avatar-crop/get-cropped-blob";

const ASPECT_PRESETS: { id: string; label: string; value: number }[] = [
  { id: "story", label: "9:16", value: 9 / 16 },
  { id: "portrait", label: "3:4", value: 3 / 4 },
  { id: "square", label: "1:1", value: 1 },
  { id: "landscape", label: "16:9", value: 16 / 9 },
  { id: "wide", label: "21:9", value: 21 / 9 },
];

type Props = {
  imageSrc: string;
  title: string;
  onCancel: () => void;
  onComplete: (blob: Blob, filename: string) => void | Promise<void>;
  /** When set, crop frame is fixed to this ratio (hides aspect picker). */
  lockAspect?: number;
  tone?: "light" | "dark";
};

/** Drag to pan, scroll wheel to zoom, slider for zoom — output matches the frame (aspect you pick). */
export default function AvatarCropModal({ imageSrc, title, onCancel, onComplete, lockAspect, tone = "light" }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(lockAspect ?? 3 / 4);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels({
      x: areaPixels.x,
      y: areaPixels.y,
      width: areaPixels.width,
      height: areaPixels.height,
    });
  }, []);

  async function apply() {
    if (!croppedAreaPixels) {
      setErr("Wait for the image to finish loading, then try again.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const name = `avatar-crop-${Date.now()}.jpg`;
      await onComplete(blob, name);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not crop image");
    } finally {
      setBusy(false);
    }
  }

  const dark = tone === "dark";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="avatar-crop-title"
        className={`flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col overflow-hidden ${
          dark ? "border border-white/20 bg-black text-white" : "rounded-2xl border border-slate-200 bg-white shadow-2xl"
        }`}
      >
        <div className={`px-5 py-4 ${dark ? "border-b border-white/15" : "border-b border-slate-100"}`}>
          <h2 id="avatar-crop-title" className={`font-heading text-lg ${dark ? "text-white" : "font-bold text-slate-900"}`}>
            {title}
          </h2>
          <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-slate-600"}`}>
            Drag to move the image. Scroll or pinch on the image to zoom (or use the slider). Pick the output shape, then save.
          </p>
          {lockAspect == null ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`mr-1 self-center text-[11px] font-semibold uppercase tracking-wide ${
                  dark ? "text-white/45" : "text-slate-500"
                }`}
              >
                Frame
              </span>
              {ASPECT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAspect(p.value)}
                  className={`px-3 py-1.5 text-xs font-bold transition ${
                    Math.abs(aspect - p.value) < 0.001
                      ? dark
                        ? "bg-[#fafafa] text-black"
                        : "rounded-full bg-blue-600 text-white shadow-md shadow-blue-200"
                      : dark
                        ? "border border-white/25 text-white/80 hover:border-white"
                        : "rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative h-[min(52vh,420px)] w-full bg-black sm:h-[min(56vh,480px)]">
          <Cropper
            key={aspect}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
            minZoom={1}
            maxZoom={4}
            zoomWithScroll={true}
          />
        </div>

        <div className={`space-y-3 px-5 py-4 ${dark ? "border-t border-white/15" : "border-t border-slate-100"}`}>
          <label className={`flex items-center gap-3 text-sm ${dark ? "text-white/80" : "text-slate-700"}`}>
            <span className="w-14 shrink-0 font-medium">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={`h-2 w-full cursor-pointer ${dark ? "accent-white" : "accent-blue-600"}`}
            />
            <span className={`w-10 shrink-0 text-right font-mono text-xs ${dark ? "text-white/45" : "text-slate-500"}`}>
              {zoom.toFixed(2)}×
            </span>
          </label>
          {err ? <p className={`text-sm ${dark ? "text-red-300" : "text-red-700"}`}>{err}</p> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className={
                dark
                  ? "border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-white disabled:opacity-50"
                  : "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              }
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void apply()}
              disabled={busy}
              className={
                dark
                  ? "bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100 disabled:opacity-50"
                  : "rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
              }
            >
              {busy ? "Saving…" : "Use this crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
