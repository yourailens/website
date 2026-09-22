"use client";

import type { ReactNode } from "react";

/** Shared OTT filter chip for library list pages */
export function OttFilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
        active
          ? "border-blue-400/60 bg-blue-500/15 text-blue-200"
          : "border-white/12 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
}

export function OttSearchInput({
  value,
  onChange,
  placeholder,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onClear?: () => void;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/35"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-white/12 bg-white/[0.03] py-3.5 pl-12 pr-12 text-sm font-light text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white/70"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export function OttLibraryCardShell({
  href,
  children,
  footer,
}: {
  href: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <a
      href={href}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      {children}
      <div className="p-3">{footer}</div>
    </a>
  );
}
