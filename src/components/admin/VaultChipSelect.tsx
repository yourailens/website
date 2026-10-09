"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";

type Props = {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export default function VaultChipSelect({
  label,
  values,
  options,
  onChange,
  placeholder = "Type or pick a label…",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const remaining = useMemo(() => {
    const have = new Set(values.map((v) => v.toLowerCase()));
    const q = draft.trim().toLowerCase();
    return [...new Set(options)]
      .filter((o) => !have.has(o.toLowerCase()))
      .filter((o) => !q || o.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b));
  }, [options, values, draft]);

  const canCreate =
    draft.trim().length > 0 &&
    !values.some((v) => v.toLowerCase() === draft.trim().toLowerCase()) &&
    !remaining.some((o) => o.toLowerCase() === draft.trim().toLowerCase());

  function add(nameRaw: string) {
    const name = nameRaw.trim();
    if (!name) return;
    if (values.some((v) => v.toLowerCase() === name.toLowerCase())) {
      setDraft("");
      setOpen(false);
      return;
    }
    onChange([...values, name]);
    setDraft("");
    setOpen(false);
  }

  function remove(name: string) {
    onChange(values.filter((v) => v !== name));
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>

      {values.length ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => remove(v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/75 transition hover:border-rose-300/40 hover:text-rose-200"
              title="Remove"
            >
              {v}
              <span aria-hidden className="text-white/35">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <input
          className={`${FIELD} pr-10`}
          value={draft}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canCreate) add(draft);
              else if (remaining[0]) add(remaining[0]);
            }
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Toggle options"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open ? (
        <ul className="absolute left-0 right-0 z-40 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-white/15 bg-[#101014] p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)]">
          {remaining.map((item) => (
            <li key={item}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(item)}
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition hover:bg-white/[0.07] hover:text-white"
              >
                {item}
              </button>
            </li>
          ))}
          {canCreate ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(draft)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-300/90 transition hover:bg-emerald-400/10"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400/70">New</span>
                {draft.trim()}
              </button>
            </li>
          ) : null}
          {!remaining.length && !canCreate ? (
            <li className="px-3 py-3 text-sm text-white/35">No more labels</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
