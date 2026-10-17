"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlannerContact } from "@/data/planner";
import LogMeetPoints from "@/components/planner/LogMeetPoints";
import { P_PAGE } from "@/components/planner/planner-ui";

export default function LogCreate({ contact }: { contact: PlannerContact }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create(body: string) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "meet", body }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error || "Add failed");
      router.push(`/planner/follow-ups/${contact.id}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Add failed");
      setBusy(false);
      throw e;
    }
  }

  return (
    <div className={P_PAGE}>
      <Link
        href={`/planner/follow-ups/${contact.id}`}
        className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white"
      >
        Back
      </Link>

      <section className="rounded-[36px] border border-white/20 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">{contact.name}</p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Log this meet</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-[1.5] text-white/55">
          Break it into points. What they said, what you promised, what comes next.
        </p>
        <div className="mt-8">
          <LogMeetPoints busy={busy} err={err} submitLabel="Add to the timeline" onSubmit={create} />
        </div>
        <button
          type="button"
          className="mt-4 text-[14px] text-white/50 hover:text-white"
          onClick={() => router.push(`/planner/follow-ups/${contact.id}`)}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}
