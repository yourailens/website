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
      <p className="font-mono text-[10px] tracking-[0.2em] text-white/40">
        Showing {start} to {end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <PaginationButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </PaginationButton>

        <ul className="flex items-center gap-1" role="list">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <li key={`ellipsis-${i}`} className="px-2 text-sm text-white/25" aria-hidden>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`min-h-9 min-w-9 border px-3 py-1.5 text-sm font-semibold tabular-nums transition ${
                    p === page
                      ? "border-blue-400/60 bg-blue-500/20 text-blue-200"
                      : "border-white/15 bg-transparent text-white/60 hover:border-white/35 hover:text-white"
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
          Next
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
      className="border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition enabled:hover:border-white/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
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
