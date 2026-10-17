"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PLANNER_LEAD_LABELS,
  PLANNER_SPONSOR_LABELS,
  plannerBioCategory,
  type PlannerBioCategory,
  type PlannerBioSuggestions,
  type PlannerMember,
} from "@/data/planner";
import PlannerDate from "@/components/planner/PlannerDate";
import PlannerSuggest from "@/components/planner/PlannerSuggest";
import { BioKind, PlannerFace } from "@/components/planner/planner-look";
import { P_BTN_FANCY, P_PAGE } from "@/components/planner/planner-ui";

export type BioDraft = {
  full_name: string;
  preferred_name: string;
  pronouns: string;
  company: string;
  role_title: string;
  department: string;
  industry: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  linkedin: string;
  instagram: string;
  city: string;
  country: string;
  languages: string;
  category: PlannerBioCategory;
  label: string;
  relationship: string;
  source: string;
  introduced_by: string;
  birthday: string;
  bio: string;
  notes: string;
  owner_id: string;
};

const EMPTY: BioDraft = {
  full_name: "",
  preferred_name: "",
  pronouns: "",
  company: "",
  role_title: "",
  department: "",
  industry: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  linkedin: "",
  instagram: "",
  city: "",
  country: "",
  languages: "",
  category: "lead",
  label: "",
  relationship: "",
  source: "",
  introduced_by: "",
  birthday: "",
  bio: "",
  notes: "",
  owner_id: "",
};

type Group = "reach" | "place" | "story";

const REACH: (keyof BioDraft)[] = ["email", "phone", "whatsapp", "website", "linkedin", "instagram"];
const PLACE: (keyof BioDraft)[] = ["city", "country", "languages"];
const STORY: (keyof BioDraft)[] = ["source", "introduced_by", "pronouns", "birthday", "department", "industry", "notes"];

function Chip({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${on ? "bg-white text-[#111]" : "bg-white/10 text-white/70"}`}
    >
      {children}
    </button>
  );
}

function picks(options: string[], value: string) {
  const shown = options.slice(0, 8);
  if (value.trim() && !shown.some((o) => o.toLowerCase() === value.trim().toLowerCase())) shown.push(value.trim());
  return shown;
}

export default function BioForm({
  me,
  members,
  suggestions,
  initial,
  bioId,
}: {
  me: PlannerMember;
  members: PlannerMember[];
  suggestions: PlannerBioSuggestions;
  initial?: BioDraft;
  bioId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [group, setGroup] = useState<Group>("reach");
  const [draft, setDraft] = useState<BioDraft>(initial ?? { ...EMPTY, owner_id: me.id });
  const [open, setOpen] = useState<string[]>(() => {
    const start = initial ?? EMPTY;
    return [...REACH, ...PLACE, ...STORY].filter((key) => String(start[key] ?? "").trim());
  });

  const people = useMemo(() => {
    return members
      .filter((m) => m.active)
      .slice()
      .sort((a, b) => {
        if (a.id === me.id) return -1;
        if (b.id === me.id) return 1;
        return a.display_name.localeCompare(b.display_name);
      });
  }, [members, me.id]);

  function set<K extends keyof BioDraft>(key: K, value: BioDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function reveal(key: string) {
    setOpen((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
  }

  function filled(keys: (keyof BioDraft)[]) {
    return keys.filter((key) => String(draft[key] ?? "").trim()).length;
  }

  async function save() {
    if (!draft.full_name.trim()) {
      setErr("Add a name first.");
      return;
    }
    if (draft.category !== "misc" && !draft.label.trim()) {
      setErr(draft.category === "lead" ? "Pick warm, hot, cold, or client." : "Pick big, small, or medium.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(bioId ? `/api/planner/bios/${bioId}` : "/api/planner/bios", {
        method: bioId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save");
      router.push(`/planner/follow-ups/contacts/${data.slug}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
      setBusy(false);
    }
  }

  async function remove() {
    if (!bioId) return;
    if (!window.confirm("Delete this contact card?")) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/planner/bios/${bioId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not delete");
      router.push("/planner/follow-ups/contacts");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete");
      setBusy(false);
    }
  }

  const who = people.find((m) => m.id === draft.owner_id);
  const title = draft.preferred_name.trim() || draft.full_name.trim() || "New person";
  const category = plannerBioCategory(draft.category);
  const place = [draft.city.trim(), draft.country.trim()].filter(Boolean).join(", ");
  const phone = draft.phone.trim();
  const email = draft.email.trim();
  const previewFacts = [
    ["Company", draft.company.trim()],
    ["Role", draft.role_title.trim()],
    ["Place", place],
    [phone ? "Phone" : "Email", phone || email],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const backHref = bioId && pathname.endsWith("/edit") ? pathname.replace(/\/edit$/, "") : "/planner/follow-ups/contacts";

  function leave() {
    router.push(backHref);
  }

  return (
    <div className={`${P_PAGE} lg:grid lg:max-w-[1100px] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6 lg:space-y-0`}>
      <Link href={backHref} className="mb-2 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] font-medium text-white lg:col-span-2">
        Back
      </Link>
      <section className="rounded-[36px] border border-white/20 bg-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">{bioId ? "Edit person" : "New person"}</p>
        <input
          className="mt-3 w-full bg-transparent text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-white outline-none placeholder:text-white/25"
          placeholder="Their name"
          value={draft.full_name}
          onChange={(e) => set("full_name", e.target.value)}
        />
        <input
          className="mt-2 w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/30"
          placeholder="What we call them"
          value={draft.preferred_name}
          onChange={(e) => set("preferred_name", e.target.value)}
        />

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Kept by</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {people.map((m) => {
            const on = m.id === draft.owner_id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => set("owner_id", m.id)}
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

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Category</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5">
          {(
            [
              ["lead", "Lead"],
              ["sponsor", "Sponsor"],
              ["misc", "Misc"],
            ] as const
          ).map(([id, name]) => (
            <button
              key={id}
              type="button"
              aria-pressed={draft.category === id}
              onClick={() => setDraft((d) => ({ ...d, category: id, label: d.category === id ? d.label : "" }))}
              className={`min-h-12 rounded-[16px] text-[14px] font-semibold ${
                draft.category === id ? "bg-white text-[#111]" : "text-white/70"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(draft.category === "lead" ? PLANNER_LEAD_LABELS : draft.category === "sponsor" ? PLANNER_SPONSOR_LABELS : suggestions.misc_label).map((option) => (
            <Chip
              key={option}
              on={draft.label.toLowerCase() === option.toLowerCase()}
              onClick={() => set("label", draft.label.toLowerCase() === option.toLowerCase() ? "" : option)}
            >
              {option}
            </Chip>
          ))}
        </div>
        {draft.category === "misc" ? (
          <div className="mt-3">
            <PlannerSuggest soft value={draft.label} options={suggestions.misc_label} onChange={(v) => set("label", v)} placeholder="Your own label" />
          </div>
        ) : null}

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">Work</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {picks(suggestions.company, draft.company).map((option) => (
            <Chip key={option} on={draft.company.toLowerCase() === option.toLowerCase()} onClick={() => set("company", draft.company.toLowerCase() === option.toLowerCase() ? "" : option)}>
              {option}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          <PlannerSuggest soft value={draft.company} options={suggestions.company} onChange={(v) => set("company", v)} placeholder="Company, or type a new one" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {picks(suggestions.role_title, draft.role_title).map((option) => (
            <Chip key={option} on={draft.role_title.toLowerCase() === option.toLowerCase()} onClick={() => set("role_title", draft.role_title.toLowerCase() === option.toLowerCase() ? "" : option)}>
              {option}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          <PlannerSuggest soft value={draft.role_title} options={suggestions.role_title} onChange={(v) => set("role_title", v)} placeholder="Role, or type a new one" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-1 rounded-[22px] border border-white/15 bg-white/[0.06] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          {(
            [
              ["reach", "Reach", REACH],
              ["place", "Place", PLACE],
              ["story", "Story", STORY],
            ] as const
          ).map(([id, label, keys]) => {
            const on = group === id;
            const n = filled(keys);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setGroup(id)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-[16px] px-2 text-[14px] font-semibold ${
                  on ? "bg-white text-[#111] shadow-[0_8px_18px_-12px_rgba(0,0,0,0.6)]" : "text-white/70"
                }`}
              >
                {label}
                {n ? <span className={`text-[12px] ${on ? "text-[#2458e6]" : "text-[#7eb6ff]"}`}>{n}</span> : null}
              </button>
            );
          })}
        </div>

        {group === "reach" ? (
          <OptionalFields
            open={open}
            onToggle={reveal}
            draft={draft}
            set={set}
            items={[
              { key: "email", label: "Email", placeholder: "name@studio.com" },
              { key: "phone", label: "Phone", placeholder: "Phone" },
              { key: "whatsapp", label: "WhatsApp", placeholder: "WhatsApp" },
              { key: "website", label: "Website", placeholder: "site.com" },
              { key: "linkedin", label: "LinkedIn", placeholder: "Profile link" },
              { key: "instagram", label: "Instagram", placeholder: "@handle" },
            ]}
          />
        ) : null}

        {group === "place" ? (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex flex-wrap gap-2">
                {picks(suggestions.city, draft.city).map((option) => (
                  <Chip key={option} on={draft.city.toLowerCase() === option.toLowerCase()} onClick={() => set("city", draft.city.toLowerCase() === option.toLowerCase() ? "" : option)}>
                    {option}
                  </Chip>
                ))}
              </div>
              <div className="mt-3">
                <PlannerSuggest soft value={draft.city} options={suggestions.city} onChange={(v) => set("city", v)} placeholder="City" />
              </div>
            </div>
            <OptionalFields
              open={open}
              onToggle={reveal}
              draft={draft}
              set={set}
              suggestions={suggestions}
              items={[
                { key: "country", label: "Country", placeholder: "Country", suggest: "country" },
                { key: "languages", label: "Languages", placeholder: "English, Hindi", suggest: "languages" },
              ]}
            />
          </div>
        ) : null}

        {group === "story" ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">How we met</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {picks(suggestions.source, draft.source).map((option) => (
                  <Chip key={option} on={draft.source.toLowerCase() === option.toLowerCase()} onClick={() => set("source", draft.source.toLowerCase() === option.toLowerCase() ? "" : option)}>
                    {option}
                  </Chip>
                ))}
              </div>
            </div>
            <OptionalFields
              open={open}
              onToggle={reveal}
              draft={draft}
              set={set}
              suggestions={suggestions}
              items={[
                { key: "introduced_by", label: "Introduced by", placeholder: "A name", suggest: "introduced_by" },
                { key: "pronouns", label: "Pronouns", placeholder: "She, he, they", suggest: "pronouns" },
                { key: "birthday", label: "Birthday", placeholder: "Birthday", date: true },
                { key: "department", label: "Department", placeholder: "Marketing, post", suggest: "department" },
                { key: "industry", label: "Industry", placeholder: "Film, hospitality", suggest: "industry" },
                { key: "notes", label: "Notes for the team", placeholder: "What to remember before the next call", area: true },
              ]}
            />
          </div>
        ) : null}

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">About them</p>
        <textarea
          className="mt-3 min-h-28 w-full resize-none rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] leading-[1.5] text-white outline-none placeholder:text-white/30"
          placeholder="A short picture of who they are"
          value={draft.bio}
          onChange={(e) => set("bio", e.target.value)}
        />

        {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" disabled={busy || !draft.full_name.trim()} onClick={() => void save()} className={`${P_BTN_FANCY} px-5 py-2.5`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[16px] leading-none">+</span>
            {busy ? "Saving" : bioId ? "Save the card" : "Add this person"}
          </button>
          <button type="button" className="text-[14px] text-white/50" onClick={leave}>
            Cancel
          </button>
          {bioId ? (
            <button type="button" className="text-[14px] text-[#ffb4b4]" disabled={busy} onClick={() => void remove()}>
              Delete
            </button>
          ) : null}
        </div>
      </section>

      <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">On the list</p>
        <article className="flex flex-col rounded-[28px] border border-white/18 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[24px] font-bold">
              {(draft.full_name.trim() || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className={`text-[22px] font-bold leading-[1.1] ${draft.full_name.trim() ? "text-white" : "text-white/30"}`}>{title}</h3>
              {draft.preferred_name.trim() && draft.preferred_name.trim() !== draft.full_name.trim() ? (
                <p className="mt-1.5 truncate text-[13px] text-white/40">{draft.full_name.trim()}</p>
              ) : null}
            </div>
            <BioKind category={category} label={draft.label} />
          </div>
          {previewFacts.length ? (
            <dl className="mt-5 border-t border-white/10">
              {previewFacts.map(([name, value]) => (
                <div key={name} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 border-b border-white/10 py-2.5 last:border-b-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">{name}</dt>
                  <dd className="truncate text-[14px] text-white">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-5 border-t border-white/10 pt-4 text-[14px] text-white/30">Company, role, and place show up here</p>
          )}
          {draft.bio.trim() ? <p className="mt-4 line-clamp-2 text-[13px] leading-[1.45] text-white/55">{draft.bio.trim()}</p> : null}
          <div className="mt-4 flex items-center gap-2">
            <PlannerFace name={who?.display_name || "Team"} size={24} />
            <span className="truncate text-[12px] text-white/45">{who?.display_name ? `Kept by ${who.display_name}` : "Unassigned"}</span>
          </div>
        </article>
      </aside>
    </div>
  );
}

function OptionalFields({
  items,
  open,
  onToggle,
  draft,
  set,
  suggestions,
}: {
  items: {
    key: keyof BioDraft;
    label: string;
    placeholder: string;
    suggest?: keyof PlannerBioSuggestions;
    date?: boolean;
    area?: boolean;
  }[];
  open: string[];
  onToggle: (key: string) => void;
  draft: BioDraft;
  set: <K extends keyof BioDraft>(key: K, value: BioDraft[K]) => void;
  suggestions?: PlannerBioSuggestions;
}) {
  return (
    <div className={suggestions ? "" : "mt-5"}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const shown = open.includes(item.key);
          const has = Boolean(String(draft[item.key] ?? "").trim());
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle(item.key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                shown ? "bg-white text-[#111]" : has ? "bg-[#2f6cff]/25 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-3">
        {items
          .filter((item) => open.includes(item.key))
          .map((item) => (
            <label key={item.key} className="block">
              <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">{item.label}</span>
              {item.date ? (
                <PlannerDate value={String(draft[item.key] ?? "")} onChange={(v) => set(item.key, v)} placeholder={item.placeholder} />
              ) : item.area ? (
                <textarea
                  className="min-h-24 w-full resize-none rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] leading-[1.5] text-white outline-none placeholder:text-white/30"
                  placeholder={item.placeholder}
                  value={String(draft[item.key] ?? "")}
                  onChange={(e) => set(item.key, e.target.value)}
                />
              ) : item.suggest && suggestions ? (
                <PlannerSuggest
                  soft
                  value={String(draft[item.key] ?? "")}
                  options={suggestions[item.suggest]}
                  onChange={(v) => set(item.key, v)}
                  placeholder={item.placeholder}
                />
              ) : (
                <input
                  className="w-full rounded-[22px] border border-white/15 bg-white/[0.05] px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/30"
                  placeholder={item.placeholder}
                  value={String(draft[item.key] ?? "")}
                  onChange={(e) => set(item.key, e.target.value)}
                />
              )}
            </label>
          ))}
      </div>
    </div>
  );
}
