"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PLANNER_NAV, plannerNavActive, plannerPageMeta, type PlannerMember } from "@/data/planner";
import { NavGlyph, glyphFor } from "@/components/planner/planner-look";
import { PlannerHeaderProvider, usePlannerHeaderBits } from "@/components/planner/planner-header";

const RAIL = "w-[280px]";

export default function PlannerShell({
  children,
  member,
  people = [],
}: {
  children: React.ReactNode;
  member: PlannerMember | null;
  people?: PlannerMember[];
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/planner/login")) {
    return <div className="min-h-screen bg-transparent text-white">{children}</div>;
  }

  return (
    <PlannerHeaderProvider>
      <PlannerFrame member={member} people={people}>
        {children}
      </PlannerFrame>
    </PlannerHeaderProvider>
  );
}

function PlannerFrame({
  children,
  member,
  people,
}: {
  children: React.ReactNode;
  member: PlannerMember | null;
  people: PlannerMember[];
}) {
  const pathname = usePathname();
  const bits = usePlannerHeaderBits();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  const meta = plannerPageMeta(pathname ?? "");
  const viewing = people.find(
    (p) => pathname === `/planner/people/${p.slug}` || (pathname ?? "").startsWith(`/planner/people/${p.slug}/`),
  );

  async function signOut() {
    await fetch("/api/planner/logout", { method: "POST" });
    window.location.href = "/planner/login";
  }

  const items = PLANNER_NAV.flatMap((g) => g.items);
  const createHref =
    bits?.kind === "tasks"
      ? "/planner/tasks/new"
      : bits?.kind === "followups"
        ? "/planner/follow-ups/new"
        : bits?.kind === "contacts"
          ? "/planner/follow-ups/contacts/new"
          : bits?.kind === "links"
            ? "/planner/directory/new"
            : bits?.kind === "finances"
              ? "/planner/finances/new"
              : null;
  const createLabel =
    bits?.kind === "tasks"
      ? "New task"
      : bits?.kind === "followups"
        ? "New follow up"
        : bits?.kind === "contacts"
          ? "New person"
          : bits?.kind === "links"
            ? "New link"
            : bits?.kind === "finances"
              ? "New entry"
              : "New";

  const links = (
    <nav className="flex flex-col gap-1 px-4">
      {items.map((item) => {
        const on = plannerNavActive(pathname ?? "", item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[16px] transition hover:bg-white/[0.06] ${
              on ? "bg-white/[0.08] font-semibold text-white shadow-[inset_3px_0_0_#2f6cff]" : "text-white/70"
            }`}
          >
            <NavGlyph name={glyphFor(item.href)} />
            <span>
              <span className="block leading-none">{item.label}</span>
              {item.hint ? <span className="mt-1 block text-[12px] font-normal text-white/40">{item.hint}</span> : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden ${RAIL} flex-col overflow-hidden border-r border-white/15 bg-white/[0.04] py-6 backdrop-blur-2xl md:flex`}>
        <Link href="/planner/tasks" className="flex items-center gap-3 px-8 pb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_yail.png" alt="YAIL" className="h-8 w-auto" />
          <span className="text-[18px] font-bold tracking-tight">Planner</span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">{links}</div>
        <div className="border-t border-white/10 px-6 pt-4">
          {member ? <p className="truncate text-[13px] text-white/55">{member.display_name}</p> : null}
          <button type="button" onClick={signOut} className="mt-2 text-[14px] font-medium text-white/80 hover:text-white">
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="planner-sheet absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[28px] border border-b-0 border-white/10 bg-[#161618] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_60px_rgba(0,0,0,0.55)]">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/25" />
            <Link href="/planner/tasks" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-6 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo_yail.png" alt="YAIL" className="h-7 w-auto" />
              <span className="text-[18px] font-bold">Planner</span>
            </Link>
            <div className="min-h-0 overflow-y-auto">{links}</div>
            <div className="mt-2 border-t border-white/10 px-6 pt-4">
              {member ? <p className="truncate text-[13px] text-white/55">{member.display_name}</p> : null}
              <button type="button" onClick={signOut} className="mt-2 text-[14px] font-medium text-white/80 hover:text-white">
                Sign out
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {menuOpen ? null : (
        <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex items-end justify-between px-4 md:hidden">
          {createHref ? (
            <Link
              href={createHref}
              aria-label={createLabel}
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2f6cff] text-[32px] font-semibold leading-none !text-white shadow-[0_12px_28px_-8px_rgba(47,108,255,0.95)]"
            >
              +
            </Link>
          ) : (
            <span className="h-14 w-14" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#161618] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.85)]"
            aria-label="Menu"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo_yail.png" alt="" className="h-7 w-auto" />
          </button>
        </div>
      )}

      <div className="relative z-10 md:pl-[280px]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl sm:px-8">
          <h1 className={`min-w-0 truncate text-[16px] font-semibold ${bits ? "hidden md:block" : ""}`}>{viewing?.display_name || meta.title || "Planner"}</h1>
          {bits?.kind === "contacts" || bits?.kind === "links" ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1.5">
                <span className="text-[18px] font-bold leading-none">{bits.count}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">
                  {bits.kind === "contacts" ? "People" : "Links"}
                </span>
              </span>
              {createHref ? (
                <Link
                  href={createHref}
                  aria-label={createLabel}
                  className="hidden items-center gap-2 rounded-full bg-gradient-to-b from-[#7eb0ff] to-[#2458e6] p-1.5 !text-white shadow-[0_12px_28px_-8px_rgba(47,108,255,1),inset_0_1px_0_rgba(255,255,255,0.65)] md:inline-flex md:px-3.5 md:py-1.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[22px] font-semibold leading-none text-[#2458e6]">+</span>
                  <span className="pr-1 text-[14px] font-semibold">{createLabel}</span>
                </Link>
              ) : null}
            </div>
          ) : bits?.kind === "finances" ? (
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ${
                  bits.net >= 0 ? "border border-[#34c759]/30 bg-[#34c759]/15" : "border border-[#e50914]/35 bg-[#e50914]/15"
                }`}
              >
                <span className={`text-[18px] font-bold leading-none ${bits.net >= 0 ? "text-[#86efac]" : "text-[#ff8a8a]"}`}>
                  {bits.net >= 0 ? "+" : "−"}
                  {Math.abs(Math.round(bits.net)).toLocaleString("en-IN")}
                </span>
                <span className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">Net</span>
              </span>
              {createHref ? (
                <Link
                  href={createHref}
                  aria-label={createLabel}
                  className="hidden items-center gap-2 rounded-full bg-gradient-to-b from-[#7eb0ff] to-[#2458e6] p-1.5 !text-white shadow-[0_12px_28px_-8px_rgba(47,108,255,1),inset_0_1px_0_rgba(255,255,255,0.65)] md:inline-flex md:px-3.5 md:py-1.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[22px] font-semibold leading-none text-[#2458e6]">+</span>
                  <span className="pr-1 text-[14px] font-semibold">{createLabel}</span>
                </Link>
              ) : null}
            </div>
          ) : bits?.kind === "tasks" || bits?.kind === "followups" ? (
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ${
                  bits.kind === "followups" ? "border border-[#f5a524]/35 bg-[#f5a524]/15" : "border border-white/15 bg-white/[0.06]"
                }`}
              >
                {bits.kind === "followups" ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#fcd34d]" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8.5V12l2.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/70" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
                <span className={`text-[18px] font-bold leading-none ${bits.kind === "followups" ? "text-[#fcd34d]" : ""}`}>
                  {bits.kind === "tasks" ? bits.open : bits.due}
                </span>
                <span className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">
                  {bits.kind === "tasks" ? "Open" : "Due"}
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#34c759]/30 bg-[#34c759]/15 px-2.5 py-1.5">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#86efac]" fill="none" aria-hidden>
                  <path d="M6 12.5 10 16.5 18 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[18px] font-bold leading-none text-[#86efac]">{bits.kind === "tasks" ? bits.done : bits.won}</span>
                <span className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">
                  {bits.kind === "tasks" ? "Done" : "Signed"}
                </span>
              </span>
              {createHref ? (
                <Link
                  href={createHref}
                  aria-label={createLabel}
                  className="hidden items-center gap-2 rounded-full bg-gradient-to-b from-[#7eb0ff] to-[#2458e6] p-1.5 !text-white shadow-[0_12px_28px_-8px_rgba(47,108,255,1),inset_0_1px_0_rgba(255,255,255,0.65)] md:inline-flex md:px-3.5 md:py-1.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[22px] font-semibold leading-none text-[#2458e6] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.45)]">+</span>
                  <span className="pr-1 text-[14px] font-semibold">{createLabel}</span>
                </Link>
              ) : null}
            </div>
          ) : null}
        </header>
        <div className="px-4 pt-6 pb-28 sm:px-8 md:pb-6">{children}</div>
      </div>
    </div>
  );
}
