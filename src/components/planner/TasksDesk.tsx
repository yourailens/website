"use client";

import { useMemo, useState } from "react";
import type { PlannerMember, PlannerTask } from "@/data/planner";
import TaskCard from "@/components/planner/TaskCard";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_PAGE } from "@/components/planner/planner-ui";

type View = "all" | "mine" | "completed";

export default function TasksDesk({
  me,
  initialTasks,
}: {
  me: PlannerMember;
  initialTasks: PlannerTask[];
}) {
  const [view, setView] = useState<View>("all");

  const pool = useMemo(() => {
    return view === "mine" ? initialTasks.filter((t) => t.assignee_id === me.id) : initialTasks;
  }, [initialTasks, view, me.id]);

  const open = useMemo(() => pool.filter((t) => t.status !== "done"), [pool]);
  const done = useMemo(
    () =>
      pool
        .filter((t) => t.status === "done")
        .slice()
        .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)),
    [pool],
  );

  useSetPlannerHeader({ kind: "tasks", open: open.length, done: done.length });

  return (
    <div className={P_PAGE}>
      <div className="grid grid-cols-3 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        {(
          [
            ["all", "All"],
            ["mine", "Mine"],
            ["completed", "Completed"],
          ] as const
        ).map(([id, label]) => {
          const on = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setView(id)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-2 text-[14px] font-semibold sm:text-[15px] ${
                on
                  ? id === "completed"
                    ? "bg-[#34c759] text-white shadow-[0_8px_18px_-10px_rgba(52,199,89,0.95)]"
                    : "bg-white text-[#111] shadow-[0_8px_18px_-12px_rgba(0,0,0,0.6)]"
                  : "text-white/70"
              }`}
            >
              {id === "all" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                  <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              ) : null}
              {id === "mine" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M6 18.5c.8-2.4 2.8-3.5 6-3.5s5.2 1.1 6 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : null}
              {id === "completed" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                  <path d="M6 12.5 10 16.5 18 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {label}
            </button>
          );
        })}
      </div>

      {view !== "completed" ? (
      <section>
        <h3 className="mb-3 text-[20px] font-bold">Open</h3>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {open.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} mine={t.assignee_id === me.id} />
            </li>
          ))}
        </ul>
        {!open.length ? <p className="text-sm text-white/50">Nothing open.</p> : null}
      </section>
      ) : null}

      <section id="completed">
        <h3 className="mb-3 text-[20px] font-bold">Completed</h3>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {done.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} mine={t.assignee_id === me.id} />
            </li>
          ))}
        </ul>
        {!done.length ? <p className="text-sm text-white/50">Nothing completed yet.</p> : null}
      </section>
    </div>
  );
}
