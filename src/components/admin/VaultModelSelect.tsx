"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  YAIL_VAULT_AI_MODELS,
  getYailVaultAiModel,
  type YailVaultAiModel,
} from "@/data/yail-vault-models";

const FIELD =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 caret-white outline-none transition focus:border-white/40 focus:bg-white/[0.09]";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

function ModelRow({ model, active }: { model: YailVaultAiModel; active?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={model.logo}
        alt=""
        className="h-5 w-5 shrink-0 object-contain opacity-90"
        aria-hidden
      />
      <span className="min-w-0 text-left">
        <span className={`block truncate text-sm ${active ? "text-white" : "text-white/85"}`}>
          {model.name}
        </span>
        <span className="block truncate text-[11px] text-white/45">{model.company}</span>
      </span>
    </span>
  );
}

/** Locked catalog picker for AI models (logo + parent company). */
export default function VaultModelSelect({
  label = "AI Model",
  value,
  onChange,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getYailVaultAiModel(value);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return YAIL_VAULT_AI_MODELS.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
  }, [query]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    onChange("");
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={`${FIELD} flex items-center justify-between gap-3 text-left`}
      >
        {selected ? (
          <ModelRow model={selected} active />
        ) : (
          <span className="text-white/40">Pick the model used…</span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-white/45"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 overflow-hidden rounded-2xl border border-white/15 bg-[#101014] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.9)]"
        >
          <div className="border-b border-white/10 p-2">
            <input
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model or company…"
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && items[0]) {
                  e.preventDefault();
                  pick(items[0].id);
                }
              }}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            {selected ? (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clear}
                  className="mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-white/45 transition hover:bg-white/[0.06] hover:text-white/70"
                >
                  Clear selection
                </button>
              </li>
            ) : null}
            {items.map((model) => {
              const active = model.id === value;
              return (
                <li key={model.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(model.id)}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 transition ${
                      active ? "bg-white/[0.12]" : "hover:bg-white/[0.07]"
                    }`}
                  >
                    <ModelRow model={model} active={active} />
                  </button>
                </li>
              );
            })}
            {!items.length ? (
              <li className="px-3 py-3 text-sm text-white/35">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
