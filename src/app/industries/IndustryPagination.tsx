"use client";

import type { ReactNode } from "react";

/** Industries hub: 2 rows × 3 columns on large screens */
export const INDUSTRIES_HUB_PAGE_SIZE = 6;

export function IndustryPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "Industries",
  className = "",
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      className={`flex flex-col items-center gap-4 sm:flex-row sm:justify-between ${className}`.trim()}
      aria-label={`${label} pagination`}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
        Showing {start} to {end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <PaginationButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </PaginationButton>

        <ul className="flex items-center gap-1" role="list">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <li key={`ellipsis-${i}`} className="px-2 text-sm text-slate-300" aria-hidden>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`min-h-9 min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold tabular-nums transition ${
                    p === page
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border-blue-100/90 bg-white/90 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                  }`}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ul>

        <PaginationButton
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next →
        </PaginationButton>
      </div>
    </nav>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="rounded-full border border-blue-100/90 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm shadow-blue-100/20 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-50/60 enabled:hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const list: (number | "ellipsis")[] = [1];
  if (current > 3) list.push("ellipsis");

  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);
  for (let p = windowStart; p <= windowEnd; p++) list.push(p);

  if (current < total - 2) list.push("ellipsis");
  list.push(total);
  return list;
}
