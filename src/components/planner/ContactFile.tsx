"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { PlannerContact, PlannerMember } from "@/data/planner";
import { PLANNER_CONTACT_STATUSES, plannerContactStatusLabel } from "@/data/planner";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_PAGE } from "@/components/planner/planner-ui";

const SOFT =
  "w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30";
const AREA = `${SOFT} min-h-28 resize-none leading-[1.5]`;

export default function ContactFile({
  me,
  members,
  initial,
}: {
  me: PlannerMember;
  members: PlannerMember[];
  initial: PlannerContact;
}) {
  const [contact, setContact] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const saveSeq = useRef(0);
  const people = members.filter((m) => m.active);

  async function saveContact(patch: Record<string, unknown>) {
    const previous = contact;
    const mine = ++saveSeq.current;
    setErr("");
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok && mine === saveSeq.current) {
        setContact(previous);
        setErr(j.error || "Save failed");
      }
    } catch {
      if (mine === saveSeq.current) {
        setContact(previous);
        setErr("Save failed");
      }
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
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">Their file</p>
        <input
          className="mt-3 w-full bg-transparent text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-white outline-none placeholder:text-white/25"
          placeholder="Their name"
          value={contact.name}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          onBlur={() => void saveContact({ name: contact.name })}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={SOFT}
            placeholder="Company"
            value={contact.company ?? ""}
            onChange={(e) => setContact({ ...contact, company: e.target.value })}
            onBlur={() => void saveContact({ company: contact.company })}
          />
          <input
            className={SOFT}
            placeholder="Role"
            value={contact.role_title ?? ""}
            onChange={(e) => setContact({ ...contact, role_title: e.target.value })}
            onBlur={() => void saveContact({ role_title: contact.role_title })}
          />
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Right now</p>
        <textarea
          className={`${AREA} mt-3`}
          placeholder="What they need immediately"
          value={contact.immediate_need ?? ""}
          onChange={(e) => setContact({ ...contact, immediate_need: e.target.value })}
          onBlur={() => void saveContact({ immediate_need: contact.immediate_need })}
        />

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Where it stands</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLANNER_CONTACT_STATUSES.map((status) => {
            const on = contact.status === status;
            return (
              <button
                key={status}
                type="button"
                disabled={busy}
                aria-pressed={on}
                onClick={() => {
                  setContact({ ...contact, status });
                  void saveContact({ status });
                }}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"}`}
              >
                {plannerContactStatusLabel(status)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={busy}
          aria-pressed={contact.contacted}
          onClick={() => {
            const contacted = !contact.contacted;
            setContact({ ...contact, contacted });
            void saveContact({ contacted });
          }}
          className={`mt-3 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${contact.contacted ? "bg-[#2f6cff] text-white" : "bg-white/10 text-white/70"}`}
        >
          {contact.contacted ? "Spoken to" : "Not spoken to yet"}
        </button>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Kept by</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {people.map((m) => {
            const on = m.id === contact.owner_id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={busy}
                onClick={() => {
                  setContact({ ...contact, owner_id: m.id });
                  void saveContact({ owner_id: m.id });
                }}
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

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Reach</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            className={SOFT}
            placeholder="Phone"
            value={contact.phone ?? ""}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            onBlur={() => void saveContact({ phone: contact.phone })}
          />
          <input
            className={SOFT}
            placeholder="Email"
            value={contact.email ?? ""}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            onBlur={() => void saveContact({ email: contact.email })}
          />
          <input
            className={`${SOFT} sm:col-span-2`}
            placeholder="Website"
            value={contact.website ?? ""}
            onChange={(e) => setContact({ ...contact, website: e.target.value })}
            onBlur={() => void saveContact({ website: contact.website })}
          />
        </div>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">The work</p>
        <textarea
          className={`${AREA} mt-3`}
          placeholder="What they need from us"
          value={contact.requirement ?? ""}
          onChange={(e) => setContact({ ...contact, requirement: e.target.value })}
          onBlur={() => void saveContact({ requirement: contact.requirement })}
        />
        <textarea
          className={`${AREA} mt-3`}
          placeholder="How we pitch it"
          value={contact.pitch ?? ""}
          onChange={(e) => setContact({ ...contact, pitch: e.target.value })}
          onBlur={() => void saveContact({ pitch: contact.pitch })}
        />
        <textarea
          className={`${AREA} mt-3`}
          placeholder="Notes for the team"
          value={contact.notes ?? ""}
          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
          onBlur={() => void saveContact({ notes: contact.notes })}
        />

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
      </section>
      <p className="text-xs text-white/25">Signed in as {me.display_name}</p>
    </div>
  );
}
