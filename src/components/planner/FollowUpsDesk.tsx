"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlannerContact, PlannerMember } from "@/data/planner";
import { plannerContactStatusLabel, plannerFirstTouchLine } from "@/data/planner";
import MeetBook from "@/components/planner/MeetBook";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

type View = "all" | "mine" | "won";

function isDue(contact: PlannerContact) {
  if (!contact.follow_up_booked || !contact.next_follow_up_at) return false;
  const t = Date.parse(contact.next_follow_up_at);
  return Number.isFinite(t) && t <= Date.now() + 1000 * 60 * 60 * 48;
}

function soonness(contact: PlannerContact) {
  if (contact.follow_up_booked && contact.next_follow_up_at) {
    const t = Date.parse(contact.next_follow_up_at);
    if (Number.isFinite(t)) return t;
  }
  if (contact.follow_up_booked) return Number.MAX_SAFE_INTEGER - 1;
  return Number.MAX_SAFE_INTEGER;
}

function FollowCard({ contact, index }: { contact: PlannerContact; index: number }) {
  const router = useRouter();
  const [booked, setBooked] = useState(contact.follow_up_booked);
  const [when, setWhen] = useState(contact.next_follow_up_at);
  const [err, setErr] = useState("");
  const saveSeq = useRef(0);
  const want = useRef<{ booked: boolean; when: string | null } | null>(null);
  const need = contact.immediate_need?.trim() || contact.requirement?.trim() || "";
  const firstTouch = plannerFirstTouchLine({
    side: contact.first_touch_side,
    channel: contact.first_touch_channel,
    note: contact.first_touch_note,
  });
  const line = [contact.role_title, contact.company].filter(Boolean).join(", ");

  useEffect(() => {
    const pending = want.current;
    if (pending && (contact.follow_up_booked !== pending.booked || (contact.next_follow_up_at ?? null) !== pending.when)) return;
    want.current = null;
    setBooked(contact.follow_up_booked);
    setWhen(contact.next_follow_up_at);
  }, [contact.follow_up_booked, contact.next_follow_up_at]);

  async function patch(body: Record<string, unknown>, rollback: () => void) {
    const mine = ++saveSeq.current;
    setErr("");
    try {
      const res = await fetch(`/api/planner/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok && mine === saveSeq.current) {
        rollback();
        setErr(j.error || "Could not save");
      } else if (res.ok && mine === saveSeq.current) router.refresh();
    } catch {
      if (mine === saveSeq.current) {
        rollback();
        setErr("Could not save");
      }
    }
  }

  return (
    <article className={`${P_GLASS} relative flex h-full flex-col p-5 focus-within:z-30`}>
      <Link href={`/planner/follow-ups/${contact.id}`} className="flex gap-4">
        <span className="w-10 shrink-0 pt-1 text-[28px] font-bold leading-none text-white/25">{String(index).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="block truncate text-[22px] font-bold leading-none">{contact.name}</span>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {plannerContactStatusLabel(contact.status)}
            </span>
          </span>
          {line ? <span className="mt-2 block truncate text-[14px] text-white/55">{line}</span> : null}
          {firstTouch ? (
            <span className="mt-2 block truncate text-[13px] text-[#b8d0ff]/85">{firstTouch}</span>
          ) : null}
          <span className="mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-t border-white/10 pt-4">
            <span>
              <span className="block text-[28px] font-bold leading-none">{contact.meet_count}</span>
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                {contact.meet_count === 1 ? "meet" : "meets"}
              </span>
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Right now</span>
              <span className={`mt-1 line-clamp-3 block text-[14px] leading-[1.45] ${need ? "text-white" : "text-white/35"}`}>
                {need || "Nothing urgent"}
              </span>
            </span>
          </span>
        </span>
      </Link>
      <div className="mt-auto pt-4 sm:pl-14">
        <MeetBook
          booked={booked}
          when={when}
          onBooked={(next) => {
            const prevBooked = booked;
            const prevWhen = when;
            const nextWhen = next ? when : null;
            want.current = { booked: next, when: nextWhen };
            setBooked(next);
            if (!next) setWhen(null);
            void patch({ follow_up_booked: next }, () => {
              want.current = null;
              setBooked(prevBooked);
              setWhen(prevWhen);
            });
          }}
          onWhen={(iso) => {
            const prev = when;
            want.current = { booked: true, when: iso };
            setWhen(iso);
            setBooked(true);
            void patch({ follow_up_booked: true, next_follow_up_at: iso }, () => {
              want.current = { booked: true, when: prev };
              setWhen(prev);
            });
          }}
        />
        {err ? <p className="mt-2 text-[13px] text-rose-300">{err}</p> : null}
      </div>
    </article>
  );
}

export default function FollowUpsDesk({ me, initialContacts }: { me: PlannerMember; initialContacts: PlannerContact[] }) {
  const [view, setView] = useState<View>("all");

  const shown = useMemo(() => {
    const pool = initialContacts.filter((contact) => {
      if (view === "mine" && contact.owner_id !== me.id) return false;
      if (view === "won" && contact.status !== "won") return false;
      return true;
    });
    return pool.slice().sort((a, b) => soonness(a) - soonness(b) || a.name.localeCompare(b.name));
  }, [initialContacts, me.id, view]);

  const due = useMemo(() => initialContacts.filter(isDue).length, [initialContacts]);
  useSetPlannerHeader({ kind: "followups", due, won: initialContacts.filter((c) => c.status === "won").length });

  return (
    <div className={P_PAGE}>
      <div className="grid grid-cols-3 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        {(
          [
            ["all", "All", initialContacts.length],
            ["mine", "Mine", initialContacts.filter((c) => c.owner_id === me.id).length],
            ["won", "Signed", initialContacts.filter((c) => c.status === "won").length],
          ] as const
        ).map(([id, label, count]) => {
          const on = view === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setView(id)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-[16px] ${
                on
                  ? id === "won"
                    ? "bg-[#34c759] text-white"
                    : "bg-[#f4f4f5] text-[#111]"
                  : "text-white/70"
              }`}
            >
              <span className="text-[18px] font-bold leading-none">{count}</span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</span>
            </button>
          );
        })}
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((contact, index) => (
          <li key={contact.id}>
            <FollowCard contact={contact} index={index + 1} />
          </li>
        ))}
      </ol>
      {!shown.length ? <p className="text-sm text-white/50">Nothing here yet.</p> : null}
    </div>
  );
}
