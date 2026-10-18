"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlannerMember, PlannerTask, PlannerTaskLog, PlannerTaskLogKind } from "@/data/planner";
import { plannerTaskBoardLabel, plannerTaskBoardTone } from "@/data/planner";
import PlannerConfirm from "@/components/planner/PlannerConfirm";
import PlannerDate from "@/components/planner/PlannerDate";
import PlannerMore from "@/components/planner/PlannerMore";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_BTN, P_BTN_FANCY, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

function isoDay(offset: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pretty(deadline: string | null) {
  if (!deadline) return "No date";
  const d = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function TaskEdit({
  me,
  members,
  task,
  entries,
  startEditing,
}: {
  me: PlannerMember;
  members: PlannerMember[];
  task: PlannerTask;
  entries: PlannerTaskLog[];
  startEditing: boolean;
}) {
  const router = useRouter();
  const canEdit = task.created_by === me.id;
  const [editing, setEditing] = useState(startEditing && canEdit);
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [dropEntry, setDropEntry] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [log, setLog] = useState(entries);
  const [kind, setKind] = useState<PlannerTaskLogKind>("progress");
  const [note, setNote] = useState("");
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

  const who = people.find((m) => m.id === (editing ? draft.assignee_id : task.assignee_id))?.display_name ?? "Unassigned";
  const tone = plannerTaskBoardTone(task);
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
      setEditing(false);
      router.replace(`/planner/tasks/${task.id}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
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
      setAskDelete(false);
    }
  }

  async function addLog() {
    const body = note.trim();
    if (!body) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/tasks/${task.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, body }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.id) {
      setErr(data.error || (res.ok ? "The log did not save." : "Could not add that."));
      return;
    }
    setLog((list) => [
      {
        id: data.id!,
        task_id: task.id,
        kind,
        body,
        resolved_at: null,
        created_by: me.id,
        created_at: new Date().toISOString(),
        creator: me,
      },
      ...list,
    ]);
    setNote("");
    router.refresh();
  }

  async function sortRoadblock(entryId: string) {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/tasks/${task.id}/entries?entry_id=${entryId}`, { method: "PATCH" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not mark that sorted.");
      return;
    }
    setLog((list) => list.map((entry) => (entry.id === entryId ? { ...entry, resolved_at: new Date().toISOString() } : entry)));
    router.refresh();
  }

  async function removeEntry() {
    if (!dropEntry) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/tasks/${task.id}/entries?entry_id=${dropEntry}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not delete that.");
      setDropEntry(null);
      return;
    }
    setLog((list) => list.filter((entry) => entry.id !== dropEntry));
    setDropEntry(null);
    router.refresh();
  }

  return (
    <div className={`${P_PAGE} max-w-[820px]`}>
      <div className="flex items-center gap-2">
        <Link
          href="/planner/tasks"
          className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white"
        >
          Back
        </Link>
        {canEdit ? (
          <div className="ml-auto">
            <PlannerMore label="Delete task" disabled={busy} onSelect={() => setAskDelete(true)} />
          </div>
        ) : null}
      </div>

      {task.milestone ? (
        <Link
          href={`/planner/milestones/${task.milestone.id}`}
          className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/15 px-3.5 py-1.5 text-[13px] font-semibold text-[#f5c16c]"
        >
          <span aria-hidden>◆</span>
          <span className="truncate">Under {task.milestone.title}</span>
        </Link>
      ) : null}

      {canEdit && editing ? (
        <section className="rounded-[32px] border border-white/15 bg-white/[0.05] p-6 sm:p-8">
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
                    on ? "border-[#6d28d9] bg-[#6d28d9]/25 text-white" : "border-white/15 bg-white/[0.04] text-white/60"
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
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"}`}
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
            className={`${P_FIELD} mt-3 min-h-28 resize-y`}
            placeholder="Anything the person should know"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" disabled={busy || !draft.title.trim()} onClick={() => void save()} className={`${P_BTN_FANCY} px-5 py-2.5`}>
              {busy ? "Saving" : "Save task"}
            </button>
            <button type="button" className="text-[14px] text-white/50" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </section>
      ) : (
        <header className="border-b border-white/10 pb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">{plannerTaskBoardLabel(tone)}</p>
          <h2 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-bold leading-[0.95] tracking-tight">{task.title}</h2>
          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-[17px] leading-relaxed text-white/70">{task.notes || "No notes yet."}</p>
          {task.completion_note ? (
            <p className="mt-4 max-w-2xl border-l-2 border-[#34c759] pl-4 text-[15px] text-white/80">
              <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86efac]">Finished</span>
              {task.completion_note}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[14px] text-white/55">
            <span className="flex items-center gap-2">
              <PlannerFace name={who} size={28} />
              {who}
            </span>
            <span>{pretty(task.deadline)}</span>
            {canEdit ? (
              <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                Edit
              </button>
            ) : null}
          </div>
        </header>
      )}

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

      <section className="rounded-[32px] border border-[#6d28d9]/30 bg-[#6d28d9]/10 p-5 sm:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#c4b5fd]">Log</p>
        <h3 className="mt-1 text-[22px] font-bold leading-none">Progress or a roadblock</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["progress", "Progress"],
              ["roadblock", "Roadblock"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`rounded-full px-3 py-1 text-[13px] ${
                kind === id ? "bg-white font-semibold text-[#111]" : "bg-white/10 text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="mt-3 block">
          <span className={P_LABEL}>{kind === "roadblock" ? "What is in the way" : "What moved"}</span>
          <textarea className={`${P_FIELD} min-h-[88px] resize-y`} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="button" className={`${P_BTN} mt-3`} disabled={busy || !note.trim()} onClick={() => void addLog()}>
          {busy ? "Adding" : "Add to the timeline"}
        </button>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Timeline</p>
            <h3 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none tracking-tight">On this task</h3>
          </div>
          <p className="text-[13px] text-white/40">{log.length ? `${log.length} on the log` : "Nothing logged yet"}</p>
        </div>
        {log.length ? (
          <ol className="relative border-l-2 border-white/15 pl-8 sm:pl-10">
            {log.map((entry, index) => {
              const openBlock = entry.kind === "roadblock" && !entry.resolved_at;
              return (
                <li key={entry.id} className="relative pb-10 last:pb-0">
                  <span
                    className={`absolute top-0 left-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-[#161618] text-[12px] font-bold text-white ${
                      openBlock ? "border-[#f5c16c]" : entry.kind === "progress" ? "border-[#6d28d9]" : "border-white/30"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="rounded-[28px] border border-white/12 bg-white/[0.05] px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`text-[13px] font-semibold ${openBlock ? "text-[#f5c16c]" : "text-[#c4b5fd]"}`}>
                        {entry.kind === "roadblock" ? (entry.resolved_at ? "Roadblock sorted" : "Roadblock") : "Progress"}
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-[12px] text-white/40">{stamp(entry.created_at)}</p>
                        <PlannerMore label="Delete log" disabled={busy} onSelect={() => setDropEntry(entry.id)} />
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[16px] leading-[1.55]">{entry.body}</p>
                    {openBlock ? (
                      <button type="button" className={`${P_BTN} mt-3`} disabled={busy} onClick={() => void sortRoadblock(entry.id)}>
                        Mark sorted
                      </button>
                    ) : null}
                    {entry.creator ? <p className="mt-3 text-[12px] text-white/35">{entry.creator.display_name}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-[16px] text-white/55">Nothing on the timeline yet.</p>
            <p className="mt-2 text-[13px] text-white/35">Log progress when the work is long, or a roadblock when it is stuck.</p>
          </div>
        )}
      </section>

      <PlannerConfirm
        open={askDelete}
        title="Delete this task?"
        body="This removes the task and its log from the planner."
        confirmLabel="Delete task"
        busy={busy}
        onCancel={() => setAskDelete(false)}
        onConfirm={() => void remove()}
      />
      <PlannerConfirm
        open={Boolean(dropEntry)}
        title="Delete this log?"
        body="This removes that one mark. The task stays."
        busy={busy}
        onCancel={() => setDropEntry(null)}
        onConfirm={() => void removeEntry()}
      />
    </div>
  );
}
