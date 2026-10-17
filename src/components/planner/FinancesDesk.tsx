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

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={`${P_GLASS} p-5`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Revenue</p>
          <p className="mt-2 text-[28px] font-bold leading-none text-[#86efac]">{formatPlannerMoney(revenueTotal)}</p>
        </div>
        <div className={`${P_GLASS} p-5`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Expenses</p>
          <p className="mt-2 text-[28px] font-bold leading-none text-[#ff8a8a]">{formatPlannerMoney(expenseTotal)}</p>
        </div>
        <div className={`${P_GLASS} p-5`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Net</p>
          <p className={`mt-2 text-[28px] font-bold leading-none ${net >= 0 ? "text-[#86efac]" : "text-[#ff8a8a]"}`}>
            {formatPlannerMoney(net)}
          </p>
          <p className="mt-2 text-[12px] text-white/40">{net >= 0 ? "Profit" : "Loss"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-3 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5">
          {(
            [
              ["all", "All", rows.length],
              ["revenue", "Revenue", rows.filter((r) => r.kind === "revenue").length],
              ["expense", "Expense", rows.filter((r) => r.kind === "expense").length],
            ] as const
          ).map(([id, label, count]) => {
            const on = view === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setView(id)}
                className={`flex min-h-12 flex-col items-center justify-center rounded-[16px] ${
                  on ? "bg-[#f4f4f5] text-[#111]" : "text-white/70"
                }`}
              >
                <span className="text-[16px] font-bold leading-none">{count}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</span>
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search who, what, or method"
          className="w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/35 sm:max-w-xs"
        />
      </div>

      <ol className="space-y-3">
        {shown.map((row) => {
          const inMoney = row.kind === "revenue";
          return (
            <li key={row.id}>
              <Link
                href={`/planner/finances/${row.id}`}
                className={`${P_GLASS} flex flex-wrap items-start justify-between gap-4 p-5 transition hover:border-white/30`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        inMoney ? "bg-[#34c759]/15 text-[#86efac]" : "bg-[#e50914]/15 text-[#ff8a8a]"
                      }`}
                    >
                      {plannerFinanceKindLabel(row.kind)}
                    </span>
                    <span className="text-[12px] text-white/35">{plannerPaymentMethodLabel(row.payment_method)}</span>
                  </div>
                  <p className="mt-3 text-[20px] font-bold leading-none">{row.title}</p>
                  <p className="mt-2 text-[14px] text-white/55">
                    {inMoney ? "Paid by" : "Paid by us"} {row.party}
                  </p>
                  <p className="mt-2 text-[12px] text-white/35">{stamp(row.paid_at)}</p>
                </div>
                <p className={`text-[24px] font-bold leading-none ${inMoney ? "text-[#86efac]" : "text-[#ff8a8a]"}`}>
                  {inMoney ? "+" : "−"}
                  {formatPlannerMoney(row.amount)}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
      {!shown.length && !missing ? <p className="text-sm text-white/50">No entries yet.</p> : null}
    </div>
  );
}
