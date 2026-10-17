"use client";

import { useEffect } from "react";
import { P_BTN_GHOST } from "@/components/planner/planner-ui";

export default function PlannerConfirm({
  open,
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Keep it",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [busy, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="planner-confirm-title"
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[28px] border border-white/20 bg-[#161618] p-5 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.18)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff8a8a]/80">Confirm</p>
        <h2 id="planner-confirm-title" className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-3 text-[14px] leading-[1.5] text-white/55">{body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-md border border-[#e50914]/45 bg-[#e50914]/15 px-4 py-2.5 text-[14px] font-semibold text-[#ffb4b4] transition hover:bg-[#e50914]/25 disabled:opacity-40"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
          <button type="button" disabled={busy} onClick={onCancel} className={`${P_BTN_GHOST} !py-2.5`}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
