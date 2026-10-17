"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANNER_ENTRY_KINDS, plannerEntryKindLabel, type PlannerContact, type PlannerEntryKind } from "@/data/planner";
import PlannerDate from "@/components/planner/PlannerDate";
import PlannerSelect from "@/components/planner/PlannerSelect";
import { DashHero } from "@/components/planner/planner-look";
import { P_BTN, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

export default function LogCreate({ contact }: { contact: PlannerContact }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [kind, setKind] = useState<PlannerEntryKind>("meet");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  async function create() {
    if (!body.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          body,
          scheduled_at: scheduledAt || null,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Add failed");
      router.push(`/planner/follow-ups/${contact.id}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Add failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <Link href={`/planner/follow-ups/${contact.id}`} className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white">
        Back
      </Link>
      <DashHero eyebrow={contact.name} title="Log this meet" text="What happened, what they asked, or what you set up next." />
      <section className="rounded-[28px] border border-white/25 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl sm:p-8">
        <label className={P_LABEL}>Kind</label>
        <PlannerSelect
          value={kind}
          onChange={(value) => setKind(value as PlannerEntryKind)}
          options={PLANNER_ENTRY_KINDS.map((k) => ({ value: k, label: plannerEntryKindLabel(k) }))}
        />
        <label className={`${P_LABEL} mt-4`}>What happened</label>
        <textarea className={`${P_FIELD} min-h-32`} value={body} onChange={(e) => setBody(e.target.value)} />
        {kind === "scheduled" ? (
          <div className="mt-4">
            <label className={P_LABEL}>When</label>
            <PlannerDate withTime value={scheduledAt} onChange={setScheduledAt} placeholder="Pick a date and time" />
          </div>
        ) : null}
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex gap-3">
          <button type="button" disabled={busy || !body.trim()} onClick={() => void create()} className={P_BTN}>
            Add to the timeline
          </button>
          <button type="button" className="text-[14px] text-white/60 hover:text-white" onClick={() => router.push(`/planner/follow-ups/${contact.id}`)}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
