"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  formatPlannerMoney,
  plannerFinanceKindLabel,
  plannerPaymentMethodLabel,
  type PlannerFinanceEntry,
  type PlannerFinanceKind,
} from "@/data/planner";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

type View = "all" | PlannerFinanceKind;

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function yearLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return String(d.getFullYear());
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function FinancesDesk({
  rows,
  expenseTotal,
  revenueTotal,
  net,
  missing,
}: {
  rows: PlannerFinanceEntry[];
  expenseTotal: number;
  revenueTotal: number;
  net: number;
  missing: boolean;
}) {
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  useSetPlannerHeader({ kind: "finances", net });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (view !== "all" && row.kind !== view) return false;
      if (!q) return true;
      const hay = [row.title, row.party, row.notes, plannerPaymentMethodLabel(row.payment_method), plannerFinanceKindLabel(row.kind)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, rows, view]);

  return (
    <div className={P_PAGE}>
      {missing ? (
        <p className={`${P_GLASS} px-5 py-4 text-[14px] text-white/75`}>
          Run supabase/migrations/096_planner_finances.sql in the Supabase SQL editor, then refresh.
        </p>
      ) : null}

      {/* Compact statement header */}
      <div className="overflow-hidden rounded-[24px] border border-white/15 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Studio ledger</p>
            <p className={`mt-2 text-[36px] font-bold leading-none tracking-tight ${net >= 0 ? "text-white" : "text-[#ffb4b4]"}`}>
              {formatPlannerMoney(net)}
            </p>
            <p className="mt-2 text-[13px] text-white/40">{net >= 0 ? "Net profit so far" : "Net loss so far"}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-right font-mono text-[13px]">
            <span className="text-white/35">In</span>
            <span className="text-white/85">{formatPlannerMoney(revenueTotal)}</span>
            <span className="text-white/35">Out</span>
            <span className="text-white/85">{formatPlannerMoney(expenseTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <div className="flex flex-1 gap-1 rounded-full border border-white/10 bg-black/20 p-1">
            {(
              [
                ["all", "All", rows.length],
                ["revenue", "In", rows.filter((r) => r.kind === "revenue").length],
                ["expense", "Out", rows.filter((r) => r.kind === "expense").length],
              ] as const
            ).map(([id, label, count]) => {
              const on = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setView(id)}
                  className={`flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition ${
                    on ? "bg-white text-[#111]" : "text-white/55 hover:text-white"
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 font-mono text-[11px] ${on ? "text-black/45" : "text-white/30"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search who, what, method…"
            className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/40 sm:max-w-[240px]"
          />
        </div>
      </div>

      {/* Ledger rows */}
      {shown.length ? (
        <div className="overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.03]">
          <div className="hidden grid-cols-[4.5rem_minmax(0,1.4fr)_minmax(0,1fr)_5.5rem_7.5rem] gap-3 border-b border-white/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 sm:grid sm:px-5">
            <span>When</span>
            <span>For</span>
            <span>Who</span>
            <span>Via</span>
            <span className="text-right">Amount</span>
          </div>

          <ul>
            {shown.map((row, i) => {
              const inMoney = row.kind === "revenue";
              return (
                <li key={row.id} className={i > 0 ? "border-t border-white/[0.07]" : undefined}>
                  <Link
                    href={`/planner/finances/${row.id}`}
                    className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.04] sm:grid-cols-[4.5rem_minmax(0,1.4fr)_minmax(0,1fr)_5.5rem_7.5rem] sm:gap-3 sm:px-5"
                  >
                    {/* Date */}
                    <div className="min-w-[3.25rem] sm:min-w-0">
                      <p className="text-[14px] font-semibold leading-none text-white/90">{dayLabel(row.paid_at)}</p>
                      <p className="mt-1 hidden text-[11px] text-white/30 sm:block">{yearLabel(row.paid_at)}</p>
                      <p className="mt-1 text-[10px] text-white/25 sm:hidden">{timeLabel(row.paid_at)}</p>
                    </div>

                    {/* Title + mobile who */}
                    <div className="min-w-0 sm:contents">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${inMoney ? "bg-[#86efac]" : "bg-[#ff8a8a]"}`}
                          />
                          <p className="truncate text-[15px] font-semibold text-white group-hover:text-white">
                            {row.title}
                          </p>
                        </div>
                        <p className="mt-1 truncate pl-3.5 text-[12px] text-white/40 sm:hidden">
                          {inMoney ? row.party : `Us → ${row.party}`} · {plannerPaymentMethodLabel(row.payment_method)}
                        </p>
                      </div>

                      <p className="hidden min-w-0 truncate text-[14px] text-white/55 sm:block">{row.party}</p>
                      <p className="hidden text-[12px] text-white/40 sm:block">
                        {plannerPaymentMethodLabel(row.payment_method)}
                      </p>
                    </div>

                    {/* Amount */}
                    <p
                      className={`text-right font-mono text-[15px] font-semibold tabular-nums leading-none sm:text-[16px] ${
                        inMoney ? "text-[#b7f5c8]" : "text-[#ffc0c0]"
                      }`}
                    >
                      {inMoney ? "+" : "−"}
                      {formatPlannerMoney(row.amount)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : !missing ? (
        <p className="px-1 text-sm text-white/45">No entries yet. Add the first one from the header.</p>
      ) : null}
    </div>
  );
}
