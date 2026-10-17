"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlannerMember } from "@/data/planner";
import PlannerDate from "@/components/planner/PlannerDate";
import { DashHero } from "@/components/planner/planner-look";
import { P_BTN, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

export default function MeetingCreate({ me, person }: { me: PlannerMember; person: PlannerMember }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startsAt, setStartsAt] = useState("");

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          starts_at: startsAt || null,
          attendee_ids: [...new Set([person.id, me.id])],
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Create failed");
      router.push(`/planner/people/${person.slug}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <DashHero eyebrow={person.display_name} title="New meeting" text="It shows on this person's page, with the time and what happened." />
      <section className="rounded-[28px] border border-white/25 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl sm:p-8">
        <label className={P_LABEL}>Title</label>
        <input className={P_FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className={`${P_LABEL} mt-4`}>When</label>
        <PlannerDate withTime value={startsAt} onChange={setStartsAt} placeholder="Pick a date and time" />
        <label className={`${P_LABEL} mt-4`}>Notes</label>
        <textarea className={`${P_FIELD} min-h-28`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" disabled={busy || !title.trim()} onClick={() => void create()} className={P_BTN}>
            Add meeting
          </button>
          <button type="button" className="text-[14px] text-white/60 hover:text-white" onClick={() => router.push(`/planner/people/${person.slug}`)}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
