"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PlannerDate from "@/components/planner/PlannerDate";
import { P_BTN, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";
import {
  PLANNER_MILESTONE_HORIZONS,
  PLANNER_MILESTONE_STATUSES,
  plannerMilestoneHorizonLabel,
  plannerMilestoneStatusLabel,
  type PlannerMember,
  type PlannerMilestoneHorizon,
  type PlannerMilestoneLink,
  type PlannerMilestoneRole,
  type PlannerMilestoneStatus,
} from "@/data/planner";

export default function MilestoneForm({
  members,
  others,
}: {
  members: PlannerMember[];
  others: PlannerMilestoneLink[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [intent, setIntent] = useState("");
  const [doneWhen, setDoneWhen] = useState("");
  const [status, setStatus] = useState<PlannerMilestoneStatus>("moving");
  const [horizon, setHorizon] = useState<PlannerMilestoneHorizon>("quarter");
  const [targetOn, setTargetOn] = useState("");
  const [crew, setCrew] = useState<{ id: string; role: PlannerMilestoneRole }[]>([]);
  const [waiting, setWaiting] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function cycle(id: string) {
    setCrew((list) => {
      const current = list.find((person) => person.id === id);
      const rest = list.filter((person) => person.id !== id);
      if (!current) return [...rest, { id, role: "helper" }];
      if (current.role === "helper") {
        return [...rest.map((person) => ({ ...person, role: "helper" as const })), { id, role: "owner" }];
      }
      return rest;
    });
  }

  async function submit() {
    if (!title.trim()) {
      setErr("Name the target.");
      return;
    }
    setBusy(true);
    setErr("");
    const res = await fetch("/api/planner/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        intent,
        done_when: doneWhen,
        status,
        horizon,
        target_on: targetOn,
        crew: crew.map((person) => ({ member_id: person.id, role: person.role })),
        blocked_by_ids: waiting,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.id) {
      setErr(data.error || "Could not save the milestone.");
      return;
    }
    router.push(`/planner/milestones/${data.id}`);
    router.refresh();
  }

  return (
    <div className={`${P_PAGE} max-w-2xl`}>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#f5c16c]">New target</p>
        <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none tracking-tight">Put a stake in the ground</h2>
      </div>

      <label className="block">
        <span className={P_LABEL}>Target</span>
        <input className={P_FIELD} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trademark YAIL logo" />
      </label>

      <label className="block">
        <span className={P_LABEL}>Why it matters</span>
        <input className={P_FIELD} value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="The name has to be ours before we print it" />
      </label>

      <label className="block">
        <span className={P_LABEL}>Done when</span>
        <input className={P_FIELD} value={doneWhen} onChange={(e) => setDoneWhen(e.target.value)} placeholder="Filing receipt is in the drive" />
      </label>

      <div>
        <span className={P_LABEL}>Season</span>
        <div className="flex flex-wrap gap-2">
          {PLANNER_MILESTONE_HORIZONS.map((item) => {
            const on = horizon === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setHorizon(item)}
                className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-[#f5c16c] font-semibold text-[#1a1408]" : "bg-white/10 text-white/70"}`}
              >
                {plannerMilestoneHorizonLabel(item)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className={P_LABEL}>Where it stands</span>
        <div className="flex flex-wrap gap-2">
          {PLANNER_MILESTONE_STATUSES.map((item) => {
            const on = status === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1 text-[13px] ${on ? "bg-[#f5c16c] font-semibold text-[#1a1408]" : "bg-white/10 text-white/70"}`}
              >
                {plannerMilestoneStatusLabel(item)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className={P_LABEL}>Aim for</span>
        <PlannerDate value={targetOn} onChange={setTargetOn} placeholder="Pick a day" />
      </div>

      <div>
        <span className={P_LABEL}>Who is on it</span>
        <p className="mb-2 text-[12px] text-white/35">Tap once to put them on it. Tap again to make them the owner. Tap a third time to clear them. One owner.</p>
        <div className="flex flex-wrap gap-2">
          {members.map((person) => {
            const role = crew.find((item) => item.id === person.id)?.role;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => cycle(person.id)}
                className={`rounded-full px-3 py-1.5 text-[13px] ${
                  role === "owner"
                    ? "bg-[#f5c16c] font-semibold text-[#1a1408]"
                    : role === "helper"
                      ? "bg-white font-semibold text-[#111]"
                      : "border border-white/15 bg-white/[0.04] text-white/70"
                }`}
              >
                {person.display_name}
                {role === "owner" ? " · Owner" : role === "helper" ? " · On it" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {others.length ? (
        <div>
          <span className={P_LABEL}>Waiting on</span>
          <div className="flex flex-wrap gap-2">
            {others.map((item) => {
              const on = waiting.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWaiting((list) => (on ? list.filter((id) => id !== item.id) : [...list, item.id]))}
                  className={`rounded-full px-3 py-1.5 text-[13px] ${on ? "bg-white font-semibold text-[#111]" : "border border-white/15 text-white/60"}`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

      <div>
        <button type="button" className={P_BTN} disabled={busy} onClick={() => void submit()}>
          {busy ? "Saving" : "Open the thread"}
        </button>
      </div>
    </div>
  );
}
