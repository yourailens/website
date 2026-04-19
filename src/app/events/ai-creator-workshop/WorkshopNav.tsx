"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKSHOP_SEATS_LEFT_DISPLAY } from "@/lib/events/workshop-config";

const LINKS = [
  { href: "/events/ai-creator-workshop", label: "Overview" },
  { href: "/events/ai-creator-workshop/day-1", label: "Day 1" },
  { href: "/events/ai-creator-workshop/day-2", label: "Day 2" },
];

export default function WorkshopNav({ soldOut = false }: { soldOut?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2.5 border-b border-slate-200/90 bg-white/95 px-5 py-5 backdrop-blur-md sm:gap-3 sm:px-8 sm:py-6"
      aria-label="Workshop pages"
    >
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
              active ? "bg-blue-600 text-white shadow-md shadow-blue-300/40" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <span
        className={`rounded-full px-4 py-2 text-sm font-medium normal-case tracking-normal ${
          soldOut ? "bg-slate-100 text-slate-500" : "bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm"
        }`}
      >
        {soldOut ? "Cohort full" : `~${WORKSHOP_SEATS_LEFT_DISPLAY} spots open`}
      </span>
      <Link
        href="/events/ai-creator-workshop#register"
        className="rounded-full border-2 border-blue-200 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-blue-800 transition hover:border-blue-300 hover:bg-blue-50"
      >
        {soldOut ? "Waitlist" : "Register"}
      </Link>
    </nav>
  );
}
