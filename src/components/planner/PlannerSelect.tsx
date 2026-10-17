"use client";

import { useEffect, useRef, useState } from "react";

export type PlannerOption = { value: string; label: string };

export default function PlannerSelect({
  value,
  options,
  onChange,
  disabled,
  placeholder = "Choose",
  compact = false,
}: {
  value: string;
  options: PlannerOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${compact ? "min-w-[9.5rem]" : ""}`}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white/[0.06] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl disabled:opacity-40 ${
          open ? "border-white/35" : "border-white/10"
        } ${compact ? "px-3 py-1.5 text-[13px]" : "px-3.5 py-2.5 text-[14px]"}`}
      >
        <span className={current ? "truncate text-white" : "truncate text-white/35"}>
          {current?.label ?? placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-white/45 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          aria-hidden
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <ul className="absolute z-50 mt-1.5 max-h-64 w-full min-w-[12rem] overflow-auto rounded-[22px] border border-white/25 bg-white/10 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl">
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[14px] transition ${
                    on ? "bg-[#2f6cff] font-semibold text-white" : "text-white/80"
                  }`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{o.label}</span>
                  {on ? <span aria-hidden className="text-[12px]">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
