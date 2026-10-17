"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  PLANNER_DIRECTORY_KINDS,
  plannerDirectoryKindLabel,
  type PlannerDirectoryItem,
  type PlannerDirectoryKind,
} from "@/data/planner";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

type Board = "all" | PlannerDirectoryKind;

const KIND_TONE: Record<PlannerDirectoryKind, string> = {
  drive: "#5b8cff",
  instagram: "#c084fc",
  website: "#34c759",
  doc: "#f5a524",
  other: "#a1a1aa",
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function DirectoryDesk({
  items,
  missing,
}: {
  items: PlannerDirectoryItem[];
  missing: boolean;
}) {
  const [board, setBoard] = useState<Board>("all");
  const [query, setQuery] = useState("");
  useSetPlannerHeader({ kind: "links", count: items.length });

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (board !== "all" && item.kind !== board) return false;
      if (!q) return true;
      const hay = [item.title, item.blurb, item.url, item.label, item.notes, plannerDirectoryKindLabel(item.kind)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [board, items, query]);

  const counts = useMemo(() => {
    const base = { all: items.length } as Record<Board, number>;
    for (const kind of PLANNER_DIRECTORY_KINDS) {
      base[kind] = items.filter((item) => item.kind === kind).length;
    }
    return base;
  }, [items]);

  return (
    <div className={P_PAGE}>
      {missing ? (
        <p className={`${P_GLASS} px-5 py-4 text-[14px] text-white/75`}>
          Run supabase/migrations/095_planner_directory.sql in the Supabase SQL editor, then refresh.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a title, link, or note"
          className="w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/35 sm:max-w-md"
        />
        <p className="text-[13px] text-white/40">
          {pool.length} {pool.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5">
        {(["all", ...PLANNER_DIRECTORY_KINDS] as Board[]).map((id) => {
          const on = board === id;
          const label = id === "all" ? "All" : plannerDirectoryKindLabel(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setBoard(id)}
              className={`min-h-12 shrink-0 rounded-[16px] px-4 text-[13px] font-semibold ${
                on ? "bg-[#f4f4f5] text-[#111]" : "text-white/70"
              }`}
            >
              {label}
              <span className={`ml-2 text-[12px] ${on ? "text-[#2458e6]" : "text-white/35"}`}>{counts[id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pool.map((item) => {
          const tone = KIND_TONE[item.kind];
          return (
            <li key={item.id}>
              <article className={`${P_GLASS} flex h-full flex-col p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ background: `${tone}22`, color: tone, boxShadow: `inset 0 0 0 1px ${tone}55` }}
                  >
                    {plannerDirectoryKindLabel(item.kind)}
                  </span>
                  <Link href={`/planner/directory/${item.id}`} className="text-[12px] text-white/40 hover:text-white/70">
                    Edit
                  </Link>
                </div>
                <h3 className="mt-4 text-[22px] font-bold leading-[1.15]">{item.title}</h3>
                {item.blurb ? <p className="mt-2 line-clamp-3 text-[14px] leading-[1.45] text-white/60">{item.blurb}</p> : null}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-5 text-[14px] font-medium text-[#9ec1ff] hover:text-white"
                >
                  {item.label?.trim() || hostOf(item.url)}
                </a>
                {item.creator ? <p className="mt-3 text-[12px] text-white/35">Added by {item.creator.display_name}</p> : null}
              </article>
            </li>
          );
        })}
      </ol>
      {!pool.length && !missing ? <p className="text-sm text-white/50">Nothing here yet. Add a link card.</p> : null}
    </div>
  );
}
