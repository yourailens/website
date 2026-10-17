"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  PLANNER_BIO_CATEGORY_COLOR,
  PLANNER_LEAD_LABELS,
  PLANNER_SPONSOR_LABELS,
  type PlannerBio,
  type PlannerBioCategory,
  type PlannerMember,
} from "@/data/planner";
import { BioKind, PlannerFace, bioAccent } from "@/components/planner/planner-look";
import { useSetPlannerHeader } from "@/components/planner/planner-header";
import { P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

type Board = "all" | PlannerBioCategory;

const BOARDS: { id: Board; title: string }[] = [
  { id: "all", title: "All" },
  { id: "lead", title: "Lead" },
  { id: "sponsor", title: "Sponsor" },
  { id: "misc", title: "Misc" },
];

export default function ContactsDesk({ me, bios, missing }: { me: PlannerMember; bios: PlannerBio[]; missing: boolean }) {
  const [board, setBoard] = useState<Board>("all");
  const [mine, setMine] = useState(false);
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  useSetPlannerHeader({ kind: "contacts", count: bios.length });

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bios.filter((bio) => {
      if (mine && bio.owner_id !== me.id) return false;
      if (!q) return true;
      const hay = [bio.full_name, bio.preferred_name, bio.company, bio.role_title, bio.city, bio.label, bio.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bios, me.id, mine, query]);

  const counts = useMemo(() => {
    return {
      all: pool.length,
      lead: pool.filter((bio) => bio.category === "lead").length,
      sponsor: pool.filter((bio) => bio.category === "sponsor").length,
      misc: pool.filter((bio) => bio.category === "misc").length,
    };
  }, [pool]);

  const inBoard = useMemo(() => (board === "all" ? pool : pool.filter((bio) => bio.category === board)), [board, pool]);

  const chips = useMemo(() => {
    if (board === "lead") return PLANNER_LEAD_LABELS;
    if (board === "sponsor") return PLANNER_SPONSOR_LABELS;
    if (board === "misc") {
      return [...new Set(inBoard.map((bio) => bio.label?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) =>
        a.localeCompare(b),
      );
    }
    return [];
  }, [board, inBoard]);

  const shown = useMemo(() => {
    const rows = label ? inBoard.filter((bio) => (bio.label ?? "").toLowerCase() === label.toLowerCase()) : inBoard;
    return rows.slice().sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [inBoard, label]);

  function pickBoard(next: Board) {
    setBoard(next);
    setLabel("");
  }

  const tone = board === "all" ? "#f4f4f5" : PLANNER_BIO_CATEGORY_COLOR[board];

  return (
    <div className={P_PAGE}>
      {missing ? (
        <p className={`${P_GLASS} px-5 py-4 text-[14px] text-white/75`}>
          Run supabase/migrations/090_planner_bios.sql in the Supabase SQL editor, then refresh. Contact cards save after that.
        </p>
      ) : null}

      <div className="grid grid-cols-4 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        {BOARDS.map((item) => {
          const on = board === item.id;
          const color = item.id === "all" ? "#f4f4f5" : PLANNER_BIO_CATEGORY_COLOR[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => pickBoard(item.id)}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[16px] px-1"
              style={
                on
                  ? {
                      background: color,
                      color: item.id === "all" ? "#111" : "#fff",
                      boxShadow: "0 10px 22px -14px rgba(0,0,0,0.8)",
                    }
                  : { color: "rgba(255,255,255,0.7)" }
              }
            >
              <span className="text-[18px] font-bold leading-none">{counts[item.id]}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-[12px]">{item.title}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a person, company, or city"
          className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none focus:border-white/45"
        />
        <button
          type="button"
          aria-pressed={mine}
          onClick={() => setMine((value) => !value)}
          className={`shrink-0 rounded-2xl px-4 text-[14px] font-semibold ${
            mine ? "bg-[#2f6cff] text-white" : "border border-white/15 bg-white/[0.06] text-white/70"
          }`}
        >
          Mine
        </button>
      </div>

      {chips.length ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const on = label.toLowerCase() === chip.toLowerCase();
            const n = inBoard.filter((bio) => (bio.label ?? "").toLowerCase() === chip.toLowerCase()).length;
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={on}
                onClick={() => setLabel(on ? "" : chip)}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                style={
                  on
                    ? { background: tone, color: board === "all" ? "#111" : "#fff" }
                    : { background: "rgba(255,255,255,0.1)", color: n ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }
                }
              >
                {chip} {n}
              </button>
            );
          })}
        </div>
      ) : null}

      {shown.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((bio) => (
            <ContactCard key={bio.id} bio={bio} />
          ))}
        </div>
      ) : (
        <p className="text-[15px] text-white/50">{bios.length ? "Nothing matches that." : "No contact cards yet. Add the first person from the header."}</p>
      )}
    </div>
  );
}

function ContactCard({ bio }: { bio: PlannerBio }) {
  const name = bio.full_name.trim();
  const called = bio.preferred_name?.trim();
  const showCalled = Boolean(called && called.toLowerCase() !== name.toLowerCase());
  const accent = bioAccent(bio.category, bio.label);
  const place = [bio.city, bio.country].filter(Boolean).join(", ");
  const phone = bio.phone?.trim();
  const email = bio.email?.trim();
  const facts = [
    ["Company", bio.company],
    ["Role", bio.role_title],
    ["Place", place],
    [phone ? "Phone" : "Email", phone || email],
  ].filter((row): row is [string, string] => Boolean(row[1]?.trim()));

  return (
    <Link
      href={`/planner/follow-ups/contacts/${bio.slug}`}
      className="flex h-full flex-col rounded-[28px] border bg-white/[0.05] p-5 backdrop-blur-2xl transition hover:bg-white/[0.07]"
      style={{
        borderColor: `${accent}55`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px ${accent}22, 0 18px 40px -28px ${accent}88`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[18px] font-bold text-white/90"
          style={{
            boxShadow: `inset 0 0 0 1.5px ${accent}aa, 0 0 18px -6px ${accent}`,
          }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-[20px] font-bold leading-[1.15] tracking-tight text-white">{name}</p>
            <BioKind category={bio.category} label={bio.label} />
          </div>
          {showCalled ? (
            <p className="mt-1 truncate text-[13px] text-white/40" title={called}>
              {called}
            </p>
          ) : null}
        </div>
      </div>

      {facts.length ? (
        <dl className="mt-5 border-t border-white/10">
          {facts.map(([name, value]) => (
            <div key={name} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 border-b border-white/10 py-2.5 last:border-b-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">{name}</dt>
              <dd className="truncate text-[14px] text-white">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {bio.bio?.trim() ? <p className="mt-4 line-clamp-2 text-[13px] leading-[1.45] text-white/55">{bio.bio}</p> : null}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <PlannerFace name={bio.owner?.display_name || "Team"} size={24} />
        <span className="truncate text-[12px] text-white/45">{bio.owner?.display_name ? `Kept by ${bio.owner.display_name}` : "Unassigned"}</span>
      </div>
    </Link>
  );
}
