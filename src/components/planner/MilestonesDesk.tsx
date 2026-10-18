"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_PAGE } from "@/components/planner/planner-ui";
import {
  plannerMilestoneHorizonLabel,
  plannerMilestoneIsSlipping,
  plannerMilestoneStatusLabel,
  type PlannerMilestone,
  type PlannerMilestoneHorizon,
  type PlannerMilestoneStatus,
} from "@/data/planner";

const ORDER: PlannerMilestoneStatus[] = ["stuck", "moving", "queued", "landed"];

function dayLabel(value: string | null) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function tone(status: PlannerMilestoneStatus) {
  if (status === "landed") return "text-[#86efac]";
  if (status === "stuck") return "text-[#ff8a8a]";
  if (status === "moving") return "text-[#f5c16c]";
  return "text-white/45";
}

export default function MilestonesDesk({
  rows,
  missing,
}: {
  rows: PlannerMilestone[];
  missing: boolean;
}) {
  const [filter, setFilter] = useState<"all" | PlannerMilestoneStatus>("all");
  const [season, setSeason] = useState<"all" | PlannerMilestoneHorizon>("all");
  const moving = rows.filter((row) => row.status === "moving" || row.status === "stuck").length;
  const landed = rows.filter((row) => row.status === "landed").length;
  useSetPlannerHeader({ kind: "milestones", moving, landed });

  const shown = useMemo(() => {
    const list = rows.filter((row) => (filter === "all" || row.status === filter) && (season === "all" || row.horizon === season));
    return [...list].sort((a, b) => {
      const slip = Number(plannerMilestoneIsSlipping(b)) - Number(plannerMilestoneIsSlipping(a));
      if (slip !== 0) return slip;
      const rank = ORDER.indexOf(a.status) - ORDER.indexOf(b.status);
      if (rank !== 0) return rank;
      if (a.target_on && b.target_on) return a.target_on.localeCompare(b.target_on);
      if (a.target_on) return -1;
      if (b.target_on) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [filter, rows, season]);

  const filters: { id: "all" | PlannerMilestoneStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "moving", label: "In motion" },
    { id: "stuck", label: "Blocked" },
    { id: "queued", label: "Queued" },
    { id: "landed", label: "Landed" },
  ];

  return (
    <div className={P_PAGE}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f5c16c]">Horizon</p>
          <h2 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-bold leading-[0.95] tracking-tight">Studio targets</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/50">
            A milestone is a destination. Trademark the logo, close the first retainer, ship the site. Tasks are the work underneath.
          </p>
        </div>
      </div>

      {missing ? (
        <p className="rounded-2xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-3 text-[14px] text-[#f5c16c]">
          Run supabase/migrations/103_planner_milestones.sql in the Supabase SQL editor, then refresh.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const on = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-[13px] ${
                on ? "bg-[#f5c16c] font-semibold text-[#1a1408]" : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "Any season" },
            { id: "quarter", label: "This quarter" },
            { id: "someday", label: "Someday" },
          ] as const
        ).map((item) => {
          const on = season === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSeason(item.id)}
              className={`rounded-full border px-3 py-1 text-[13px] ${
                on ? "border-[#f5c16c] text-[#f5c16c]" : "border-white/15 text-white/55"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map((row) => {
            const when = dayLabel(row.target_on);
            const slipping = plannerMilestoneIsSlipping(row);
            const owner = row.crew.find((person) => person.milestone_role === "owner");
            const held = row.waiting_on.filter((item) => item.status !== "landed");
            const ring = slipping ? "#ff8a8a" : row.status === "landed" ? "#86efac" : row.status === "stuck" ? "#ff8a8a" : "#f5c16c";
            return (
              <li key={row.id} className="min-w-0">
                <Link
                  href={`/planner/milestones/${row.id}`}
                  className="group flex h-full min-w-0 gap-4 rounded-[28px] border border-white/12 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:border-[#f5c16c]/40"
                >
                  <span className="relative mt-1 flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden>
                    <span className="absolute h-14 w-14 rounded-full border" style={{ borderColor: ring, opacity: 0.35 }} />
                    <span className="absolute h-9 w-9 rounded-full border" style={{ borderColor: ring, opacity: 0.7 }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ring }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="min-w-0 break-words text-[20px] font-bold leading-tight tracking-tight group-hover:text-[#f5c16c]">{row.title}</h3>
                      <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${slipping ? "text-[#ff8a8a]" : tone(row.status)}`}>
                        {slipping ? "Slipping" : plannerMilestoneStatusLabel(row.status)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[12px] text-white/40">
                      {plannerMilestoneHorizonLabel(row.horizon)}
                      {when ? ` · ${when}` : ""}
                    </span>
                    {row.intent ? <span className="mt-2 block text-[14px] leading-relaxed text-white/55">{row.intent}</span> : null}
                    {row.done_when ? (
                      <span className="mt-2 block text-[13px] text-white/40">
                        Done when <span className="text-white/70">{row.done_when}</span>
                      </span>
                    ) : null}
                    {held.length ? (
                      <span className="mt-2 block text-[13px] text-[#ffb4b4]">Waiting on {held.map((item) => item.title).join(", ")}</span>
                    ) : null}
                    <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/40">
                      {owner ? <span className="text-[#f5c16c]">Owner {owner.display_name.split(" ")[0]}</span> : <span>No owner</span>}
                      {row.crew.filter((person) => person.milestone_role !== "owner").length ? (
                        <span>
                          On it{" "}
                          {row.crew
                            .filter((person) => person.milestone_role !== "owner")
                            .map((person) => person.display_name.split(" ")[0])
                            .join(", ")}
                        </span>
                      ) : null}
                      {row.open_tasks ? (
                        <span>
                          {row.open_tasks} task{row.open_tasks === 1 ? "" : "s"} open
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-[18px] font-semibold">No targets yet.</p>
          <p className="mt-2 text-[14px] text-white/45">Put one up. Name it, say when it is done, and tag who is carrying it.</p>
        </div>
      )}
    </div>
  );
}
