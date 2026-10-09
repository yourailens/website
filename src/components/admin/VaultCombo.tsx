"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Fixed list only — no free typing (e.g. category). */
  locked?: boolean;
  optionValues?: { value: string; label: string }[];
};

/** Dark searchable combobox — pick existing or type a new name. */
export default function VaultCombo({
  label,
  value,
  options,
  onChange,
  placeholder = "Pick or type…",
  locked = false,
  optionValues,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const items = useMemo(() => {
    if (optionValues?.length) {
      const q = query.trim().toLowerCase();
      return optionValues.filter((o) => !q || o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
    }
    const q = query.trim().toLowerCase();
    const unique = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
    return unique
      .filter((o) => !q || o.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b))
      .map((o) => ({ value: o, label: o }));
  }, [options, optionValues, query]);

  const showCreate =
    !locked &&
    query.trim().length > 0 &&
    !items.some((i) => i.label.toLowerCase() === query.trim().toLowerCase());

  function pick(next: string) {
    onChange(next);
    setQuery(next);
    setOpen(false);
  }

  function commitTyped() {
    const next = query.trim();
    if (locked) {
      const match = items.find((i) => i.label.toLowerCase() === next.toLowerCase() || i.value === next);
      if (match) pick(match.value);
      else {
        setQuery(value);
        setOpen(false);
      }
      return;
    }
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <div className="relative">
        <input
          className={`${FIELD} pr-10`}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          readOnly={locked && open === false ? false : locked ? false : false}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            if (locked) {
              setQuery(e.target.value);
              setOpen(true);
              return;
            }
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (showCreate) pick(query.trim());
              else if (items[0]) pick(items[0].value);
              else commitTyped();
            }
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") setOpen(true);
          }}
          onBlur={() => {
            // blur after click on option — delay so pick can fire
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) commitTyped();
            }, 120);
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
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-white/15 bg-[#101014] p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)]"
        >
          {items.map((item) => {
            const active = item.value === value || item.label === value;
            return (
              <li key={item.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item.value)}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-white/[0.12] text-white"
                      : "text-white/75 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
          {showCreate ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(query.trim())}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-300/90 transition hover:bg-emerald-400/10"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400/70">New</span>
                {query.trim()}
              </button>
            </li>
          ) : null}
          {!items.length && !showCreate ? (
            <li className="px-3 py-3 text-sm text-white/35">No matches</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
