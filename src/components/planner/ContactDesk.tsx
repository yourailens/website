"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { PlannerContact, PlannerMember } from "@/data/planner";
import { PLANNER_CONTACT_STATUSES, plannerContactStatusLabel, plannerEntryKindLabel } from "@/data/planner";
import MeetBook from "@/components/planner/MeetBook";
import PlannerMore from "@/components/planner/PlannerMore";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_BTN, P_FIELD, P_GLASS, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

const SOFT =
  "w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30";
const AREA = `${SOFT} min-h-28 resize-none leading-[1.5]`;

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ContactDesk({
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
  const timeline = [...(contact.entries ?? [])].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const line = [contact.role_title, contact.company].filter(Boolean).join(", ");

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

  async function remove() {
    if (!confirm("Delete this contact and the whole timeline?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Delete failed");
      }
      window.location.href = "/planner/follow-ups";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  const people = members.filter((m) => m.active);

  return (
    <div className={P_PAGE}>
      <Link href="/planner/follow-ups" className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white">
        Back
      </Link>
      <section className={`${P_GLASS} px-6 py-8 sm:px-10`}>
        <div className="flex justify-end">
          <PlannerMore label="Delete contact" disabled={busy} onSelect={() => void remove()} />
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <PlannerFace name={contact.name} size={56} />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">{plannerContactStatusLabel(contact.status)}</p>
              <h2 className="mt-1 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none">{contact.name}</h2>
              <p className="mt-2 text-[15px] text-white/70">{line || "No company yet"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[40px] font-bold leading-none">{contact.meet_count}</p>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {contact.meet_count === 1 ? "meet so far" : "meets so far"}
            </p>
          </div>
        </div>
        <label className={`${P_LABEL} mt-8`}>Right now</label>
        <textarea
          className={`${P_FIELD} min-h-20`}
          placeholder="What they need immediately"
          value={contact.immediate_need ?? contact.requirement ?? ""}
          onChange={(e) => setContact({ ...contact, immediate_need: e.target.value })}
          onBlur={() => void saveContact({ immediate_need: contact.immediate_need })}
        />
        <div className="mt-4 max-w-md">
          <MeetBook
            booked={contact.follow_up_booked}
            when={contact.next_follow_up_at}
            onBooked={(next) => {
              setContact({ ...contact, follow_up_booked: next, next_follow_up_at: next ? contact.next_follow_up_at : null });
              void saveContact({ follow_up_booked: next });
            }}
            onWhen={(iso) => {
              setContact({ ...contact, follow_up_booked: true, next_follow_up_at: iso });
              void saveContact({ follow_up_booked: true, next_follow_up_at: iso });
            }}
          />
        </div>
        <Link href={`/planner/follow-ups/${contact.id}/log/new`} className={`${P_BTN} mt-5`}>
          Log a meet
        </Link>
      </section>

      <section>
        <h3 className="mb-4 text-[20px] font-bold">Timeline</h3>
        {timeline.length ? (
          <ol className="relative border-l border-white/15 pl-8">
            {timeline.map((entry, index) => (
              <li key={entry.id} className="relative pb-8 last:pb-0">
                <span className="absolute top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#2f6cff] bg-[#161618] text-[11px] font-bold text-white" style={{ left: "-2rem" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-[12px] font-semibold tracking-[0.04em] text-white/40">{stamp(entry.created_at)}</p>
                <p className="mt-1 text-[13px] font-semibold text-[#9ec1ff]">{plannerEntryKindLabel(entry.kind)}</p>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.5] text-white">{entry.body}</p>
                {entry.scheduled_at ? <p className="mt-2 text-[13px] text-white/55">Set for {stamp(entry.scheduled_at)}</p> : null}
                {entry.creator ? <p className="mt-2 text-[12px] text-white/40">{entry.creator.display_name}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-white/50">No meets logged yet.</p>
        )}
      </section>

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

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
      </section>
      <p className="text-xs text-white/25">Signed in as {me.display_name}</p>
    </div>
  );
}
