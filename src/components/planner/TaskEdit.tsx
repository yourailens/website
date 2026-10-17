"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlannerMember, PlannerTask } from "@/data/planner";
import PlannerDate from "@/components/planner/PlannerDate";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_BTN_FANCY, P_PAGE } from "@/components/planner/planner-ui";

function isoDay(offset: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pretty(deadline: string) {
  if (!deadline) return "No date";
  const d = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function TaskEdit({
  me,
  members,
  task,
}: {
  me: PlannerMember;
  members: PlannerMember[];
  task: PlannerTask;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState({
    title: task.title,
    notes: task.notes ?? "",
    deadline: task.deadline ?? "",
    assignee_id: task.assignee_id,
  });

  const people = useMemo(() => {
    return members
      .filter((m) => m.active)
      .slice()
      .sort((a, b) => {
        if (a.id === me.id) return -1;
        if (b.id === me.id) return 1;
        return a.display_name.localeCompare(b.display_name);
      });
  }, [members, me.id]);

  const who = people.find((m) => m.id === draft.assignee_id)?.display_name ?? "Unassigned";
  const done = task.status === "done";
  const quick = [
    { id: "", label: "No date" },
    { id: isoDay(0), label: "Today" },
    { id: isoDay(1), label: "Tomorrow" },
    { id: isoDay(7), label: "In a week" },
  ];

  async function save() {
    if (!draft.title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/planner/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Save failed");
      router.push("/planner/tasks");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this task?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Delete failed");
      }
      router.push("/planner/tasks");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className={`${P_PAGE} lg:grid lg:max-w-[1100px] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6 lg:space-y-0`}>
      <Link href="/planner/tasks" className="mb-2 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white lg:col-span-2">
        Back
      </Link>
      <section className="rounded-[36px] border border-white/20 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">Edit task</p>
        <input
          className="mt-3 w-full bg-transparent text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-white outline-none placeholder:text-white/25"
          placeholder="What needs doing"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Who has it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {people.map((m) => {
            const on = m.id === draft.assignee_id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setDraft({ ...draft, assignee_id: m.id })}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                  on ? "border-[#2f6cff] bg-[#2f6cff]/20 text-white" : "border-white/15 bg-white/[0.04] text-white/60"
                }`}
              >
                <PlannerFace name={m.display_name} size={26} />
                <span className="text-[13px] font-medium">{m.id === me.id ? `${m.display_name} (you)` : m.display_name}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">When</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map((q) => {
            const on = draft.deadline === q.id;
            return (
              <button
                key={q.label}
                type="button"
                onClick={() => setDraft({ ...draft, deadline: q.id })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 max-w-xs">
          <PlannerDate value={draft.deadline} onChange={(deadline) => setDraft({ ...draft, deadline })} placeholder="Or pick a date" />
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Notes</p>
        <textarea
          className="mt-3 min-h-28 w-full resize-none rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] leading-[1.5] text-white outline-none placeholder:text-white/30"
          placeholder="Anything the person should know"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" disabled={busy || !draft.title.trim()} onClick={() => void save()} className={`${P_BTN_FANCY} px-5 py-2.5`}>
            {busy ? "Saving" : "Save task"}
          </button>
          <button type="button" className="text-[14px] text-white/50" onClick={() => router.push("/planner/tasks")}>
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={() => void remove()} className="ml-auto text-[14px] text-[#ffb4b4]">
            Delete
          </button>
        </div>
      </section>

      <aside className="mt-6 lg:mt-0">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">On the board</p>
        <article className="flex aspect-square flex-col overflow-hidden rounded-[32px] border border-white/18 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl">
          <div
            className={`flex items-center justify-center gap-2 px-4 py-3 text-[15px] font-semibold text-white ${
              done ? "bg-[#34c759]" : "bg-[#ff3b30]"
            }`}
          >
            {done ? "Done" : "Not done"}
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
            <h3 className={`line-clamp-3 text-[22px] font-bold leading-[1.15] ${draft.title.trim() ? "text-white" : "text-white/30"}`}>
              {draft.title.trim() || "Your task"}
            </h3>
            <p className={`mt-2 line-clamp-3 text-[14px] leading-[1.5] ${draft.notes.trim() ? "text-white/70" : "text-white/30"}`}>
              {draft.notes.trim() || "Notes show up here"}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <span className="flex min-w-0 items-center gap-2">
                <PlannerFace name={who} size={28} />
                <span className="truncate text-[13px] text-white/55">{who}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[12px] text-white/55">{pretty(draft.deadline)}</span>
            </div>
          </div>
        </article>
      </aside>
    </div>
  );
}
