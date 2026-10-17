import type { CSSProperties } from "react";
import Link from "next/link";
import { PLANNER_BIO_CATEGORY_COLOR, type PlannerBioCategory } from "@/data/planner";
import { P_BTN } from "@/components/planner/planner-ui";

const POSTERS: [string, string][] = [
  ["#1d4ed8", "#070d1c"],
  ["#0e7490", "#061318"],
  ["#b45309", "#1a1006"],
  ["#5b21b6", "#120818"],
  ["#047857", "#061410"],
  ["#be185d", "#1a0812"],
  ["#1d4ed8", "#070d1c"],
  ["#a16207", "#161006"],
];

export function posterStyle(key: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 3)) % POSTERS.length;
  const [a, b] = POSTERS[h];
  return {
    backgroundImage: `radial-gradient(120% 80% at 20% 0%, ${a} 0%, transparent 55%), linear-gradient(165deg, ${a} 0%, ${b} 48%, #141414 100%)`,
  };
}

export function statusTone(status: string) {
  switch (status) {
    case "open":
    case "new":
      return { chip: "bg-[#2563eb] text-white", wash: "from-[#1d4ed8]/80" };
    case "doing":
    case "active":
      return { chip: "bg-[#d97706] text-white", wash: "from-[#d97706]/80" };
    case "done":
    case "won":
      return { chip: "bg-[#15803d] text-white", wash: "from-[#15803d]/80" };
    case "blocked":
    case "lost":
      return { chip: "bg-[#e50914] text-white", wash: "from-[#e50914]/85" };
    case "paused":
      return { chip: "bg-[#52525b] text-white", wash: "from-[#52525b]/80" };
    case "contacted":
      return { chip: "bg-[#0e7490] text-white", wash: "from-[#0e7490]/80" };
    default:
      return { chip: "bg-white/15 text-white", wash: "from-white/20" };
  }
}

export function DashHero({
  eyebrow,
  title,
  text,
  href,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  href?: string;
  action?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7eb6ff]">{eyebrow}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <h2 className="text-[28px] font-bold leading-none tracking-tight">{title}</h2>
          {children ? <div className="flex flex-wrap items-center gap-x-5 gap-y-1">{children}</div> : null}
        </div>
        {text ? <p className="mt-2 max-w-xl text-[13px] text-white/45">{text}</p> : null}
      </div>
      {href && action ? (
        <Link href={href} className={P_BTN}>
          {action}
        </Link>
      ) : null}
    </header>
  );
}

/** Soft outline stamp for contact category + subcategory (Client, Hot, …). */
export function BioKind({ category, label }: { category: PlannerBioCategory; label?: string | null }) {
  const accent = bioAccent(category, label);
  const group = category === "lead" ? "Lead" : category === "sponsor" ? "Sponsor" : "Misc";
  const sub = label?.trim();
  return (
    <div className="shrink-0 text-right" title={sub ? `${group} · ${sub}` : group}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">{group}</p>
      {sub ? (
        <span
          className="mt-1 inline-flex max-w-[7.5rem] items-center truncate rounded-full px-2.5 py-0.5 text-[12px] font-semibold tracking-wide text-white"
          style={{
            color: accent,
            boxShadow: `inset 0 0 0 1px ${accent}`,
            background: `${accent}14`,
          }}
        >
          {sub}
        </span>
      ) : null}
    </div>
  );
}

/** Category / subcategory tint for card outlines and avatar rings. */
export function bioAccent(category: PlannerBioCategory, label?: string | null): string {
  const sub = (label ?? "").trim().toLowerCase();
  if (category === "lead") {
    if (sub === "client") return "#f5c542";
    if (sub === "hot") return "#ff8a1f";
    if (sub === "warm") return "#f5a524";
    if (sub === "cold") return "#8ec5ff";
    return PLANNER_BIO_CATEGORY_COLOR.lead;
  }
  if (category === "sponsor") {
    if (sub === "big") return "#e9d5ff";
    if (sub === "medium") return "#c084fc";
    if (sub === "small") return "#a78bfa";
    return PLANNER_BIO_CATEGORY_COLOR.sponsor;
  }
  return PLANNER_BIO_CATEGORY_COLOR.misc;
}

export function PlannerFace({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.42)) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className={`text-[18px] font-bold leading-none ${tone ?? "text-white"}`}>{value}</span>
      <span className="text-[12px] text-white/50">{label}</span>
    </p>
  );
}

export function NavGlyph({ name }: { name: string }) {
  const common = "h-[18px] w-[18px] shrink-0";
  if (name === "feed") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="14" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "tasks") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <rect x="4" y="3.5" width="16" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "contacts") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <rect x="4" y="3.5" width="16" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 16.5c.6-1.6 2-2.4 4-2.4s3.4.8 4 2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "follow") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 18.5c.6-2.4 2.5-3.5 5-3.5s4.4 1.1 5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 8h4M18 6v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "people") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <circle cx="8" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 18c.5-2.2 2.2-3.2 4.5-3.2s4 1 4.5 3.2M12 18c.4-1.8 1.8-2.8 4-2.8 2.1 0 3.5 1 4 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "links") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 18.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "money") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.5 9.5h1M16.5 14.5h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 19c.8-2.6 2.8-4 6-4s5.2 1.4 6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function glyphFor(href: string) {
  if (href === "/planner/feed" || href === "/planner") return "feed";
  if (href.startsWith("/planner/tasks")) return "tasks";
  if (href.startsWith("/planner/follow-ups/contacts")) return "contacts";
  if (href.startsWith("/planner/follow-ups")) return "follow";
  if (href.startsWith("/planner/people")) return "people";
  if (href.startsWith("/planner/directory")) return "links";
  if (href.startsWith("/planner/finances")) return "money";
  return "team";
}
