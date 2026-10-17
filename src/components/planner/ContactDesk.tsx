"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { PlannerContact, PlannerMember } from "@/data/planner";
import { plannerContactStatusLabel, plannerEntryKindLabel } from "@/data/planner";
import LogMeetPoints from "@/components/planner/LogMeetPoints";
import MeetBook from "@/components/planner/MeetBook";
import PlannerMore from "@/components/planner/PlannerMore";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_PAGE } from "@/components/planner/planner-ui";

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function shortStamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function ContactDesk({
  me,
  initial,
}: {
  me: PlannerMember;
  initial: PlannerContact;
}) {
  const [contact, setContact] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [logging, setLogging] = useState(false);
  const [err, setErr] = useState("");
  const [logErr, setLogErr] = useState("");
  const saveSeq = useRef(0);
  const timeline = [...(contact.entries ?? [])].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const line = [contact.role_title, contact.company].filter(Boolean).join(", ");
  const need = contact.immediate_need?.trim() || contact.requirement?.trim() || "";

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

  async function logMeet(body: string) {
    setLogging(true);
    setLogErr("");
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "meet", body }),
      });
      const j = (await res.json().catch(() => ({}))) as { contact?: PlannerContact; error?: string };
      if (!res.ok) throw new Error(j.error || "Could not log the meet");
      if (j.contact) setContact(j.contact);
    } catch (e) {
      setLogErr(e instanceof Error ? e.message : "Could not log the meet");
      throw e;
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/planner/follow-ups" className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white">
          Back
        </Link>
        <Link
          href={`/planner/follow-ups/${contact.id}/file`}
          className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[14px] text-white/55 hover:text-white"
        >
          Their file
        </Link>
        <div className="ml-auto">
          <PlannerMore label="Delete contact" disabled={busy} onSelect={() => void remove()} />
        </div>
      </div>

      <header className="pt-2">
        <div className="flex flex-wrap items-start gap-4">
          <PlannerFace name={contact.name} size={48} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-none tracking-tight">{contact.name}</h2>
            <p className="mt-2 text-[14px] text-white/55">{line || "No company yet"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/40">
              <span>{plannerContactStatusLabel(contact.status)}</span>
              <span className="text-white/20">·</span>
              <span>
                {contact.meet_count} {contact.meet_count === 1 ? "meet" : "meets"}
              </span>
              {contact.follow_up_booked ? (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[#c4b5fd]">
                    Booked{contact.next_follow_up_at ? ` ${shortStamp(contact.next_follow_up_at)}` : ""}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[#ff8a8a]">Not booked</span>
                </>
              )}
              {contact.owner ? (
                <>
                  <span className="text-white/20">·</span>
                  <span>Kept by {contact.owner.display_name}</span>
                </>
              ) : null}
            </div>
            {need ? <p className="mt-3 max-w-2xl text-[13px] leading-[1.45] text-white/50 line-clamp-2">{need}</p> : null}
          </div>
        </div>

        <details className="mt-5 max-w-md rounded-[22px] border border-white/10 bg-white/[0.03] open:bg-white/[0.04]">
          <summary className="cursor-pointer list-none px-4 py-3 text-[13px] text-white/55 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-white/70">Next meet</span>
            <span className="text-white/30"> · </span>
            {contact.follow_up_booked
              ? contact.next_follow_up_at
                ? shortStamp(contact.next_follow_up_at)
                : "Booked"
              : "Not booked"}
          </summary>
          <div className="border-t border-white/10 p-3">
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
        </details>
      </header>

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}

      <section className="rounded-[32px] border border-[#2f6cff]/25 bg-[#2f6cff]/[0.07] p-5 shadow-[inset_0_1px_0_rgba(126,176,255,0.25)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9ec1ff]">Log a meet</p>
            <h3 className="mt-1 text-[22px] font-bold leading-none">Add what happened</h3>
          </div>
          <Link href={`/planner/follow-ups/${contact.id}/log/new`} className="text-[13px] text-white/45 hover:text-white/70">
            Open full page
          </Link>
        </div>
        <div className="mt-5">
          <LogMeetPoints
            busy={logging}
            err={logErr}
            submitLabel="Add to the timeline"
            onSubmit={async (body) => {
              await logMeet(body);
            }}
          />
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Timeline</p>
            <h3 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none tracking-tight">
              Every meet so far
            </h3>
          </div>
          <p className="text-[13px] text-white/40">
            {timeline.length ? `${timeline.length} on the log` : "Nothing logged yet"}
          </p>
        </div>

        {timeline.length ? (
          <ol className="relative border-l-2 border-[#2f6cff]/40 pl-8 sm:pl-10">
            {timeline.map((entry, index) => (
              <li key={entry.id} className="relative pb-10 last:pb-0">
                <span className="absolute top-0 left-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#2f6cff] bg-[#161618] text-[12px] font-bold text-white shadow-[0_0_0_4px_rgba(47,108,255,0.12)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="rounded-[28px] border border-white/12 bg-white/[0.05] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:px-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#9ec1ff]">{plannerEntryKindLabel(entry.kind)}</p>
                    <p className="text-[12px] tracking-[0.02em] text-white/40">{stamp(entry.created_at)}</p>
                  </div>
                  <div className="mt-3 space-y-2 whitespace-pre-wrap text-[16px] leading-[1.55] text-white">
                    {entry.body.split("\n").map((lineText, lineIndex) => (
                      <p key={lineIndex} className={lineText.trim().startsWith("•") ? "pl-0" : ""}>
                        {lineText}
                      </p>
                    ))}
                  </div>
                  {entry.scheduled_at ? <p className="mt-3 text-[13px] text-white/55">Set for {stamp(entry.scheduled_at)}</p> : null}
                  {entry.creator ? <p className="mt-3 text-[12px] text-white/35">{entry.creator.display_name}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-[16px] text-white/55">No meets logged yet.</p>
            <p className="mt-2 text-[13px] text-white/35">Use the points above to start the timeline.</p>
          </div>
        )}
      </section>

      <p className="text-xs text-white/25">Signed in as {me.display_name}</p>
    </div>
  );
}
