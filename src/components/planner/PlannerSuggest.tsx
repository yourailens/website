"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function PlannerSuggest({
  value,
  options,
  onChange,
  placeholder = "Type or pick",
  soft = false,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  soft?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    const pool = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return pool.slice(0, 8);
  }, [options, value]);

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
    <div ref={root} className="relative">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={
          soft
            ? "w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-white/40"
            : "w-full rounded-xl border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/35 caret-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] outline-none focus:border-white/45"
        }
      />
      {open && matches.length ? (
        <ul className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-[22px] border border-white/20 bg-[#161618] p-1.5 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)]">
          {matches.map((option) => {
            const on = option.toLowerCase() === value.trim().toLowerCase();
            return (
              <li key={option}>
                <button
                  type="button"
                  className={`flex w-full rounded-xl px-3 py-2 text-left text-[14px] ${
                    on ? "bg-[#2f6cff] font-semibold text-white" : "text-white/80"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
