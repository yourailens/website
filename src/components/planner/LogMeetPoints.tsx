"use client";

import { useEffect, useRef, useState } from "react";
import { P_BTN_FANCY } from "@/components/planner/planner-ui";

function cleanPoints(points: string[]) {
  return points.map((p) => p.trim()).filter(Boolean);
}

export function pointsToBody(points: string[]) {
  return cleanPoints(points)
    .map((point) => `• ${point}`)
    .join("\n");
}

export default function LogMeetPoints({
  onSubmit,
  busy,
  err,
  submitLabel = "Add to the timeline",
}: {
  onSubmit: (body: string) => Promise<void> | void;
  busy?: boolean;
  err?: string;
  submitLabel?: string;
}) {
  const [points, setPoints] = useState([""]);
  const lastRef = useRef<HTMLInputElement>(null);
  const ready = cleanPoints(points).length > 0;

  useEffect(() => {
    lastRef.current?.focus();
  }, [points.length]);

  function setPoint(index: number, value: string) {
    setPoints((list) => list.map((point, i) => (i === index ? value : point)));
  }

  function addPoint(after = points.length - 1) {
    setPoints((list) => {
      const next = [...list];
      next.splice(after + 1, 0, "");
      return next;
    });
  }

  function removePoint(index: number) {
    setPoints((list) => {
      if (list.length === 1) return [""];
      return list.filter((_, i) => i !== index);
    });
  }

  async function submit() {
    const body = pointsToBody(points);
    if (!body) return;
    await onSubmit(body);
    setPoints([""]);
  }

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">What happened</p>
      <p className="mt-1 text-[13px] text-white/45">One point per line. Add as many as you need.</p>
      <ul className="mt-4 space-y-0">
        {points.map((point, index) => {
          const isLast = index === points.length - 1;
          return (
            <li key={index} className="group relative flex items-start gap-3 py-1.5">
              <span className="mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#2f6cff]/70 bg-[#2f6cff]/15 text-[10px] font-bold text-[#9ec1ff]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < points.length - 1 || points.length > 1 ? (
                <span className="absolute left-[0.6rem] top-8 h-[calc(100%-0.5rem)] w-px bg-white/10" aria-hidden />
              ) : null}
              <input
                ref={isLast ? lastRef : undefined}
                value={point}
                onChange={(e) => setPoint(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (point.trim()) addPoint(index);
                  }
                  if (e.key === "Backspace" && !point && points.length > 1) {
                    e.preventDefault();
                    removePoint(index);
                  }
                }}
                placeholder={index === 0 ? "First thing from the meet" : "Next point"}
                className="min-h-11 w-full rounded-[18px] border border-white/12 bg-white/[0.05] px-4 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-[#2f6cff]/50"
              />
              {points.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove point"
                  onClick={() => removePoint(index)}
                  className="mt-2 shrink-0 rounded-full px-2 py-1 text-[13px] text-white/35 hover:text-white/70"
                >
                  ×
                </button>
              ) : (
                <span className="w-7" aria-hidden />
              )}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => addPoint()}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-white/20 px-3.5 py-2 text-[13px] font-medium text-white/60 hover:border-white/40 hover:text-white"
      >
        <span className="text-[16px] leading-none">+</span>
        Add another point
      </button>
      {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
      <div className="mt-5">
        <button type="button" disabled={busy || !ready} onClick={() => void submit()} className={`${P_BTN_FANCY} px-5 py-2.5`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[16px] leading-none">+</span>
          {busy ? "Saving" : submitLabel}
        </button>
      </div>
    </div>
  );
}
