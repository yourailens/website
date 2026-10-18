"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PlannerConfirm from "@/components/planner/PlannerConfirm";
import PlannerDate from "@/components/planner/PlannerDate";
import PlannerMore from "@/components/planner/PlannerMore";
import { P_BTN, P_FIELD, P_LABEL } from "@/components/planner/planner-ui";
import {
  PLANNER_MILESTONE_ENTRY_KINDS,
  PLANNER_MILESTONE_HORIZONS,
  PLANNER_MILESTONE_STATUSES,
  plannerMilestoneEntryLabel,
  plannerMilestoneHorizonLabel,
  plannerMilestoneIsSlipping,
  plannerMilestoneStatusLabel,
  plannerTaskStatusLabel,
  type PlannerMember,
  type PlannerMilestone,
  type PlannerMilestoneEntry,
  type PlannerMilestoneEntryKind,
  type PlannerMilestoneLink,
  type PlannerMilestonePerson,
  type PlannerMilestoneStatus,
  type PlannerTask,
} from "@/data/planner";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function dayLabel(value: string | null) {
  if (!value) return "No date";
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function MilestoneThread({
  milestone,
  entries,
  tasks,
  looseTasks,
  others,
  members,
  meId,
}: {
  milestone: PlannerMilestone;
  entries: PlannerMilestoneEntry[];
  tasks: PlannerTask[];
  looseTasks: PlannerTask[];
  others: PlannerMilestoneLink[];
  members: PlannerMember[];
  meId: string;
}) {
  const router = useRouter();
  const [row, setRow] = useState(milestone);
  const [log, setLog] = useState(entries);
  const [work, setWork] = useState(tasks);
  const [pool, setPool] = useState(looseTasks);
  const [kind, setKind] = useState<PlannerMilestoneEntryKind>("move");
  const [body, setBody] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofRef, setProofRef] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(meId);
  const [attachId, setAttachId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [dropEntry, setDropEntry] = useState<string | null>(null);
  const [title, setTitle] = useState(milestone.title);
  const [intent, setIntent] = useState(milestone.intent ?? "");
  const [doneWhen, setDoneWhen] = useState(milestone.done_when ?? "");

  async function patch(payload: Record<string, unknown>, next: Partial<PlannerMilestone>) {
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setErr(data.error || "Could not save.");
      return;
    }
    setRow((current) => ({ ...current, ...next }));
    router.refresh();
  }

  async function setStatus(status: PlannerMilestoneStatus) {
    if (status === row.status) return;
    await patch({ status }, { status });
  }

  function cycleCrew(id: string) {
    const member = members.find((person) => person.id === id);
    if (!member) return;
    const current = row.crew.find((person) => person.id === id);
    let next: PlannerMilestonePerson[];
    if (!current) {
      next = [...row.crew, { ...member, milestone_role: "helper" }];
    } else if (current.milestone_role === "helper") {
      next = [
        ...row.crew.filter((person) => person.id !== id).map((person) => ({ ...person, milestone_role: "helper" as const })),
        { ...member, milestone_role: "owner" },
      ];
    } else {
      next = row.crew.filter((person) => person.id !== id);
    }
    void patch(
      { crew: next.map((person) => ({ member_id: person.id, role: person.milestone_role })) },
      { crew: next },
    );
  }

  async function saveDetails() {
    if (!title.trim()) {
      setErr("Name the target.");
      return;
    }
    await patch(
      { title, intent, done_when: doneWhen },
      { title: title.trim(), intent: intent.trim() || null, done_when: doneWhen.trim() || null },
    );
  }

  async function addEntry() {
    const text = body.trim();
    if (!text && !proofUrl.trim() && !proofRef.trim()) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, body: text, proof_url: proofUrl, proof_ref: proofRef }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.id) {
      setErr(data.error || "Could not add that.");
      return;
    }
    setLog((list) => [
      {
        id: data.id!,
        milestone_id: row.id,
        kind,
        body: text || proofRef.trim() || "Proof",
        proof_url: proofUrl.trim() || null,
        proof_ref: proofRef.trim() || null,
        created_by: "",
        created_at: new Date().toISOString(),
      },
      ...list,
    ]);
    if (kind === "blocker") setRow((current) => ({ ...current, status: "stuck" }));
    setBody("");
    setProofUrl("");
    setProofRef("");
    router.refresh();
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle, assignee_id: assigneeId }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.id) {
      setErr(data.error || "Could not add the task.");
      return;
    }
    const who = members.find((person) => person.id === assigneeId) ?? null;
    setWork((list) => [
      {
        id: data.id!,
        title: taskTitle.trim(),
        notes: null,
        deadline: null,
        status: "open",
        created_by: meId,
        assignee_id: assigneeId,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        milestone_id: row.id,
        completion_note: null,
        progress_count: 0,
        open_roadblocks: 0,
        assignee: who,
      },
      ...list,
    ]);
    setTaskTitle("");
    router.refresh();
  }

  async function attachTask() {
    if (!attachId) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: attachId }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not attach that task.");
      return;
    }
    const found = pool.find((task) => task.id === attachId);
    if (found) {
      setWork((list) => [{ ...found, milestone_id: row.id }, ...list.filter((task) => task.id !== found.id)]);
      setPool((list) => list.filter((task) => task.id !== found.id));
    }
    setAttachId("");
    router.refresh();
  }

  async function detachTask(taskId: string) {
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}/tasks?task_id=${taskId}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setErr(data.error || "Could not take that task off.");
      return;
    }
    const removed = work.find((task) => task.id === taskId);
    setWork((list) => list.filter((task) => task.id !== taskId));
    if (removed) setPool((list) => [...list, { ...removed, milestone_id: null }]);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/planner/milestones/${row.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(data.error || "Could not delete.");
      setConfirm(false);
      return;
    }
    router.push("/planner/milestones");
    router.refresh();
  }

  async function removeEntry() {
    if (!dropEntry) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/planner/milestones/${row.id}/entries?entry_id=${dropEntry}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not delete that log.");
      setDropEntry(null);
      return;
    }
    setLog((list) => list.filter((entry) => entry.id !== dropEntry));
    setDropEntry(null);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-10 text-white">
      <div className="flex items-center gap-2">
        <Link
          href="/planner/milestones"
          className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white"
        >
          Back
        </Link>
        <div className="ml-auto">
          <PlannerMore label="Delete milestone" disabled={busy} onSelect={() => setConfirm(true)} />
        </div>
      </div>

      <header className="border-b border-[#f5c16c]/25 pb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f5c16c]">Milestone</p>
        <h2 className="mt-3 text-[clamp(2.2rem,6vw,3.6rem)] font-bold leading-[0.95] tracking-tight">{row.title}</h2>
        {row.intent ? <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/60">{row.intent}</p> : null}
        {row.done_when ? (
          <p className="mt-5 border-l-2 border-[#f5c16c] pl-4 text-[15px] text-white/80">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5c16c]">Done when</span>
            {row.done_when}
          </p>
        ) : null}
        {plannerMilestoneIsSlipping(row) ? (
          <p className="mt-4 text-[14px] font-semibold text-[#ff8a8a]">Slipping. The date has passed and this has not landed.</p>
        ) : null}
        {row.waiting_on.some((item) => item.status !== "landed") ? (
          <p className="mt-2 text-[14px] text-[#ffb4b4]">
            Waiting on {row.waiting_on.filter((item) => item.status !== "landed").map((item) => item.title).join(", ")}
          </p>
        ) : null}
        <p className="mt-5 text-[13px] text-white/45">
          {plannerMilestoneIsSlipping(row) ? "Slipping" : plannerMilestoneStatusLabel(row.status)}
          {" · "}
          {plannerMilestoneHorizonLabel(row.horizon)}
          {" · "}
          {dayLabel(row.target_on)}
        </p>
        <p className="mt-1 text-[13px] text-white/45">
          {row.crew.find((person) => person.milestone_role === "owner")
            ? `Owner ${row.crew.find((person) => person.milestone_role === "owner")?.display_name}`
            : "No owner"}
          {row.crew.some((person) => person.milestone_role !== "owner")
            ? ` · On it ${row.crew
                .filter((person) => person.milestone_role !== "owner")
                .map((person) => person.display_name.split(" ")[0])
                .join(", ")}`
            : ""}
        </p>
      </header>

      <section className="rounded-[32px] border border-[#f5c16c]/25 bg-[#f5c16c]/[0.07] p-5 shadow-[inset_0_1px_0_rgba(245,193,108,0.25)] sm:p-7">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f5c16c]">Log a move</p>
          <h3 className="mt-1 text-[22px] font-bold leading-none">Add what happened</h3>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {PLANNER_MILESTONE_ENTRY_KINDS.map((item) => {
            const on = kind === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setKind(item)}
                className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-white font-semibold text-[#111]" : "bg-white/10 text-white/60"}`}
              >
                {plannerMilestoneEntryLabel(item)}
              </button>
            );
          })}
        </div>
        <textarea
          className={`${P_FIELD} mt-3 min-h-[88px] resize-y`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === "blocker" ? "What is in the way" : kind === "decision" ? "What we decided" : kind === "proof" ? "What the proof shows" : "What moved"}
        />
        {kind === "proof" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={P_LABEL}>Link</span>
              <input className={P_FIELD} value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </label>
            <label className="block">
              <span className={P_LABEL}>Filing number</span>
              <input className={P_FIELD} value={proofRef} onChange={(e) => setProofRef(e.target.value)} placeholder="TM-48291" />
            </label>
          </div>
        ) : null}
        <button
          type="button"
          className={`${P_BTN} mt-3`}
          disabled={busy || (!body.trim() && !proofUrl.trim() && !proofRef.trim())}
          onClick={() => void addEntry()}
        >
          {busy ? "Adding" : "Add to the timeline"}
        </button>
      </section>

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Timeline</p>
            <h3 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none tracking-tight">Every move so far</h3>
          </div>
          <p className="text-[13px] text-white/40">{log.length ? `${log.length} on the log` : "Nothing logged yet"}</p>
        </div>
        {log.length ? (
          <ol className="relative border-l-2 border-[#f5c16c]/40 pl-8 sm:pl-10">
            {log.map((entry, index) => (
              <li key={entry.id} className="relative pb-10 last:pb-0">
                <span className="absolute top-0 left-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#f5c16c] bg-[#161618] text-[12px] font-bold text-white shadow-[0_0_0_4px_rgba(245,193,108,0.12)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="rounded-[28px] border border-white/12 bg-white/[0.05] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#f5c16c]">{plannerMilestoneEntryLabel(entry.kind)}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-[12px] tracking-[0.02em] text-white/40">{stamp(entry.created_at)}</p>
                      <PlannerMore label="Delete log" disabled={busy} onSelect={() => setDropEntry(entry.id)} />
                    </div>
                  </div>
                  {entry.body ? (
                    <div className="mt-3 space-y-2 whitespace-pre-wrap text-[16px] leading-[1.55] text-white">
                      {entry.body.split("\n").map((lineText, lineIndex) => (
                        <p key={lineIndex}>{lineText}</p>
                      ))}
                    </div>
                  ) : null}
                  {entry.proof_ref ? <p className="mt-3 text-[13px] text-white/70">Ref {entry.proof_ref}</p> : null}
                  {entry.proof_url ? (
                    <a href={entry.proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] text-[#f5c16c] underline">
                      Open proof
                    </a>
                  ) : null}
                  {entry.creator ? <p className="mt-3 text-[12px] text-white/35">{entry.creator.display_name}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-[16px] text-white/55">Nothing on the timeline yet.</p>
            <p className="mt-2 text-[13px] text-white/35">Log a move, a decision, a blocker, or proof.</p>
          </div>
        )}
      </section>

      <section className="space-y-8 border-t border-white/10 pt-8">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">Under this target</p>
          <h3 className="mt-1 text-[22px] font-bold leading-none">Tasks, crew, and edits</h3>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/35">Where it stands</p>
          <div className="flex flex-wrap gap-2">
            {PLANNER_MILESTONE_STATUSES.map((item) => {
              const on = row.status === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => void setStatus(item)}
                  className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-[#f5c16c] font-semibold text-[#1a1408]" : "bg-white/10 text-white/60"}`}
                >
                  {plannerMilestoneStatusLabel(item)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLANNER_MILESTONE_HORIZONS.map((item) => {
              const on = row.horizon === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => void patch({ horizon: item }, { horizon: item })}
                  className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-white font-semibold text-[#111]" : "bg-white/10 text-white/55"}`}
                >
                  {plannerMilestoneHorizonLabel(item)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 max-w-xs">
            <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/35">Aim for</p>
            <PlannerDate
              value={row.target_on ?? ""}
              onChange={(value) => void patch({ target_on: value }, { target_on: value || null })}
              placeholder="No date"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/35">Crew · tap for on it, again for owner</p>
          <div className="flex flex-wrap gap-1.5">
            {members.map((person) => {
              const role = row.crew.find((member) => member.id === person.id)?.milestone_role;
              return (
                <button
                  key={person.id}
                  type="button"
                  title={person.display_name}
                  onClick={() => cycleCrew(person.id)}
                  className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[12px] ${
                    role === "owner"
                      ? "bg-[#f5c16c] font-semibold text-[#1a1408]"
                      : role === "helper"
                        ? "bg-white font-semibold text-[#111]"
                        : "bg-white/10 text-white/55"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${role ? "bg-[#1a1408] text-[#f5c16c]" : "bg-white/10"}`}>
                    {initials(person.display_name)}
                  </span>
                  {person.display_name.split(" ")[0]}
                  {role === "owner" ? " · Owner" : ""}
                </button>
              );
            })}
          </div>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-[13px] text-white/40 hover:text-white/70">Edit the target</summary>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className={P_LABEL}>Target</span>
              <input className={P_FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block">
              <span className={P_LABEL}>Why it matters</span>
              <input className={P_FIELD} value={intent} onChange={(e) => setIntent(e.target.value)} />
            </label>
            <label className="block">
              <span className={P_LABEL}>Done when</span>
              <input className={P_FIELD} value={doneWhen} onChange={(e) => setDoneWhen(e.target.value)} />
            </label>
            <button type="button" className={P_BTN} onClick={() => void saveDetails()}>
              Save
            </button>
          </div>
        </details>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/35">Waiting on</p>
          {others.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {others.map((item) => {
                const on = row.waiting_on.some((link) => link.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const ids = on
                        ? row.waiting_on.filter((link) => link.id !== item.id).map((link) => link.id)
                        : [...row.waiting_on.map((link) => link.id), item.id];
                      const waiting_on = others.filter((link) => ids.includes(link.id));
                      void patch({ blocked_by_ids: ids }, { waiting_on });
                    }}
                    className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-white font-semibold text-[#111]" : "bg-white/10 text-white/60"}`}
                  >
                    {item.title}
                    {item.status === "landed" ? " · landed" : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-[14px] text-white/35">Add another target before this one can wait on it.</p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/35">Tasks under this target</p>
            <Link href={`/planner/tasks/new?milestone=${row.id}`} className="text-[13px] text-white/45 hover:text-white/70">
              Full task form
            </Link>
          </div>
          {work.length ? (
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {work.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={`/planner/tasks/${task.id}`} className="text-[15px] font-semibold hover:text-[#f5c16c]">
                      {task.title}
                    </Link>
                    <p className="text-[12px] text-white/40">
                      {plannerTaskStatusLabel(task.status)}
                      {task.assignee ? ` · ${task.assignee.display_name}` : ""}
                    </p>
                  </div>
                  <button type="button" className="text-[12px] text-white/40 hover:text-white" onClick={() => void detachTask(task.id)}>
                    Take off
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-white/40">No tasks yet.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              className={`${P_FIELD} min-w-[220px] flex-1`}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a task"
            />
            <select className={`${P_FIELD} w-auto`} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              {members.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.display_name}
                </option>
              ))}
            </select>
            <button type="button" className={P_BTN} disabled={busy || !taskTitle.trim()} onClick={() => void addTask()}>
              Add
            </button>
          </div>
          {pool.filter((task) => !work.some((item) => item.id === task.id)).length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className={`${P_FIELD} w-auto min-w-[220px]`} value={attachId} onChange={(e) => setAttachId(e.target.value)}>
                <option value="">Attach an existing task</option>
                {pool
                  .filter((task) => !work.some((item) => item.id === task.id))
                  .map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </select>
              <button type="button" className={P_BTN} disabled={busy || !attachId} onClick={() => void attachTask()}>
                Attach
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <PlannerConfirm
        open={confirm}
        title="Delete this milestone?"
        body="The target and its log go away. Tasks stay on the planner. They just come off this target."
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void remove()}
      />
      <PlannerConfirm
        open={Boolean(dropEntry)}
        title="Delete this log?"
        body="This removes that one mark from the timeline. The target stays."
        busy={busy}
        onCancel={() => setDropEntry(null)}
        onConfirm={() => void removeEntry()}
      />
    </div>
  );
}
