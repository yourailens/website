"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlannerBio, PlannerContact, PlannerMember } from "@/data/planner";
import PlannerSelect from "@/components/planner/PlannerSelect";
import { PlannerFace } from "@/components/planner/planner-look";
import { P_BTN, P_FIELD, P_LABEL, P_PAGE } from "@/components/planner/planner-ui";

function personName(person: PlannerBio) {
  return person.preferred_name?.trim() || person.full_name;
}

function samePerson(contact: PlannerContact, person: PlannerBio) {
  if (contact.bio_id && contact.bio_id === person.id) return true;
  if (person.email && contact.email && person.email.toLowerCase() === contact.email.toLowerCase()) return true;
  const names = [person.full_name, person.preferred_name].map((value) => value?.trim().toLowerCase()).filter(Boolean);
  if (!names.includes(contact.name.trim().toLowerCase())) return false;
  if (person.company && contact.company) return person.company.trim().toLowerCase() === contact.company.trim().toLowerCase();
  return true;
}

export default function ContactCreate({
  me,
  members,
  people,
  existing,
}: {
  me: PlannerMember;
  members: PlannerMember[];
  people: PlannerBio[];
  existing: PlannerContact[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const [picked, setPicked] = useState<PlannerBio | null>(null);
  const [making, setMaking] = useState(false);
  const [ownerId, setOwnerId] = useState(me.id);
  const [immediateNeed, setImmediateNeed] = useState("");
  const [fresh, setFresh] = useState({ company: "", role_title: "", phone: "", email: "" });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .filter((person) => {
        if (!q) return true;
        const hay = [person.full_name, person.preferred_name, person.company, person.email].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 24);
  }, [people, query]);

  const prior = picked ? existing.find((contact) => samePerson(contact, picked)) : undefined;

  function choose(person: PlannerBio) {
    setPicked(person);
    setMaking(false);
    setQuery(personName(person));
    setOpen(false);
    setErr("");
  }

  function clearPick() {
    setPicked(null);
    setMaking(false);
    setQuery("");
    setOpen(true);
  }

  async function startFollowUp(body: Record<string, unknown>) {
    const res = await fetch("/api/planner/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok) throw new Error(j.error || "Could not start the follow up");
    router.push(j.id ? `/planner/follow-ups/${j.id}` : "/planner/follow-ups");
    router.refresh();
  }

  async function create() {
    if (!picked || prior) return;
    setBusy(true);
    setErr("");
    try {
      await startFollowUp({
        name: personName(picked),
        company: picked.company,
        role_title: picked.role_title,
        phone: picked.phone,
        email: picked.email,
        website: picked.website,
        notes: picked.notes,
        immediate_need: immediateNeed,
        owner_id: ownerId,
        bio_id: picked.id,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start the follow up");
      setBusy(false);
    }
  }

  async function createPerson() {
    const fullName = query.trim();
    if (!fullName) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/planner/bios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          company: fresh.company,
          role_title: fresh.role_title,
          phone: fresh.phone,
          email: fresh.email,
          category: "misc",
          owner_id: ownerId,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !j.id) throw new Error(j.error || "Could not add them to contacts");
      await startFollowUp({
        name: fullName,
        company: fresh.company,
        role_title: fresh.role_title,
        phone: fresh.phone,
        email: fresh.email,
        immediate_need: immediateNeed,
        owner_id: ownerId,
        bio_id: j.id,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not add them to contacts");
      setBusy(false);
    }
  }

  return (
    <div className={P_PAGE}>
      <Link href="/planner/follow-ups" className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-[14px] text-white/70 hover:text-white">
        Follow ups
      </Link>
      <section className="rounded-[28px] border border-white/25 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">New follow up</p>
        <h2 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Who is this</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-[1.5] text-white/55">Pick someone from contacts. If they are not there yet, add them here.</p>

        <label className={`${P_LABEL} mt-8`}>Contacts</label>
        <div className="relative">
          <input
            className={P_FIELD}
            placeholder="Search a name or company"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
              setMaking(false);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open && !picked ? (
            <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-[22px] border border-white/15 bg-[#161618] p-1.5 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)]">
              {matches.map((person) => {
                const line = [person.role_title, person.company].filter(Boolean).join(", ");
                return (
                  <li key={person.id}>
                    <button type="button" onClick={() => choose(person)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10">
                      <PlannerFace name={personName(person)} size={32} />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">{personName(person)}</span>
                        {line ? <span className="block truncate text-[12px] text-white/45">{line}</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
              {query.trim() && !matches.some((person) => personName(person).toLowerCase() === query.trim().toLowerCase()) ? (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMaking(true);
                      setOpen(false);
                      setPicked(null);
                    }}
                    className="w-full rounded-xl px-3 py-3 text-left text-[14px] font-semibold text-[#9ec1ff] hover:bg-white/10"
                  >
                    Add {query.trim()} to contacts
                  </button>
                </li>
              ) : null}
              {!matches.length && !query.trim() ? <li className="px-3 py-3 text-[14px] text-white/40">No contacts yet.</li> : null}
            </ul>
          ) : null}
        </div>

        {picked ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <PlannerFace name={personName(picked)} size={40} />
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-semibold">{personName(picked)}</span>
                <span className="block truncate text-[13px] text-white/45">{[picked.role_title, picked.company].filter(Boolean).join(", ") || "In contacts"}</span>
              </span>
            </span>
            <button type="button" className="shrink-0 text-[13px] text-white/50" onClick={clearPick}>
              Someone else
            </button>
          </div>
        ) : null}

        {making ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-[14px] text-white/60">{query.trim()} will be added to contacts, then the follow up starts.</p>
            <div>
              <label className={P_LABEL}>Company</label>
              <input className={P_FIELD} value={fresh.company} onChange={(e) => setFresh({ ...fresh, company: e.target.value })} />
            </div>
            <div>
              <label className={P_LABEL}>Role</label>
              <input className={P_FIELD} value={fresh.role_title} onChange={(e) => setFresh({ ...fresh, role_title: e.target.value })} />
            </div>
            <div>
              <label className={P_LABEL}>Phone</label>
              <input className={P_FIELD} value={fresh.phone} onChange={(e) => setFresh({ ...fresh, phone: e.target.value })} />
            </div>
            <div>
              <label className={P_LABEL}>Email</label>
              <input className={P_FIELD} value={fresh.email} onChange={(e) => setFresh({ ...fresh, email: e.target.value })} />
            </div>
          </div>
        ) : null}

        {picked || making ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={P_LABEL}>Right now</label>
              <input className={P_FIELD} placeholder="What they need immediately" value={immediateNeed} onChange={(e) => setImmediateNeed(e.target.value)} />
            </div>
            <div>
              <label className={P_LABEL}>Kept by</label>
              <PlannerSelect value={ownerId} onChange={setOwnerId} options={members.filter((m) => m.active).map((m) => ({ value: m.id, label: m.display_name }))} />
            </div>
          </div>
        ) : null}

        {prior ? <p className="mt-4 text-[14px] text-white/70">They already have a follow up.</p> : null}
        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {prior ? (
            <Link href={`/planner/follow-ups/${prior.id}`} className={P_BTN}>
              Open it
            </Link>
          ) : making ? (
            <button type="button" disabled={busy || !query.trim()} onClick={() => void createPerson()} className={P_BTN}>
              {busy ? "Saving" : "Add them and start"}
            </button>
          ) : (
            <button type="button" disabled={busy || !picked} onClick={() => void create()} className={P_BTN}>
              {busy ? "Saving" : "Start the follow up"}
            </button>
          )}
          <button type="button" className="text-[14px] text-white/50" onClick={() => router.push("/planner/follow-ups")}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
