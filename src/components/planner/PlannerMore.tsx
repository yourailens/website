"use client";

import { useEffect, useRef, useState } from "react";

export default function PlannerMore({
  label,
  onSelect,
  disabled,
}: {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (btn.current?.contains(t) || menu.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    setBox({ top: r.bottom + 6, left: Math.max(8, r.right - 160) });
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-label="More"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {open ? (
        <div
          ref={menu}
          style={{ top: box.top, left: box.left }}
          className="fixed z-50 w-40 overflow-hidden rounded-[18px] border border-white/25 bg-white/10 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl"
        >
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[13px] text-[#ffb4b4] hover:bg-white/5"
            onClick={() => {
              setOpen(false);
              onSelect();
            }}
          >
            {label}
          </button>
        </div>
      ) : null}
    </>
  );
}
