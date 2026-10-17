"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlannerMember, PlannerTask } from "@/data/planner";
import PlannerDate from "@/components/planner/PlannerDate";
import PlannerSelect from "@/components/planner/PlannerSelect";
import { DashHero } from "@/components/planner/planner-look";
import { P_BTN, P_BTN_DANGER, P_FIELD, P_GLASS, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

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
    <div className={P_PAGE}>
      <DashHero eyebrow="Edit task" title="Change this task" text="Owner, deadline, and notes live here. Done or not is the tick on the board." />
      <section className={`p-6 sm:p-8 ${P_GLASS}`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className={P_LABEL}>What needs doing</label>
            <input className={`${P_FIELD} text-[18px] font-semibold`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <label className={P_LABEL}>Assignee</label>
            <PlannerSelect
              value={draft.assignee_id}
              onChange={(assignee_id) => setDraft({ ...draft, assignee_id })}
              options={members
                .filter((m) => m.active)
                .map((m) => ({ value: m.id, label: m.id === me.id ? `${m.display_name} (you)` : m.display_name }))}
            />
          </div>
          <div>
            <label className={P_LABEL}>Deadline</label>
            <PlannerDate value={draft.deadline} onChange={(deadline) => setDraft({ ...draft, deadline })} placeholder="Pick a date" />
          </div>
          <div className="lg:col-span-2">
            <label className={P_LABEL}>Notes</label>
            <textarea className={`${P_FIELD} min-h-32`} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
        </div>
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy || !draft.title.trim()} onClick={() => void save()} className={P_BTN}>
            Save task
          </button>
          <button type="button" className="text-[14px] text-white/60" onClick={() => router.push("/planner/tasks")}>
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={() => void remove()} className={`${P_BTN_DANGER} ml-auto`}>
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}
