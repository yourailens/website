"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/events/ai-creator-workshop", label: "Overview" },
  { href: "/events/ai-creator-workshop/day-1", label: "Day 1" },
  { href: "/events/ai-creator-workshop/day-2", label: "Day 2" },
];

export default function WorkshopNav({
  seatsLeft,
  soldOut = false,
}: {
  seatsLeft?: number;
  soldOut?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 border-b border-blue-100/80 bg-white/80 px-4 py-3 backdrop-blur-sm sm:gap-3">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
              active ? "bg-blue-600 text-white shadow-md shadow-blue-300/40" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-800"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      {typeof seatsLeft === "number" ? (
        <span
          className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wide ${
            soldOut ? "bg-slate-200 text-slate-600" : "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
          }`}
        >
          {soldOut ? "Full" : `${seatsLeft} left`}
        </span>
      ) : null}
      <Link
        href="/events/ai-creator-workshop#register"
        className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-800 transition hover:bg-blue-50"
      >
        {soldOut ? "Waitlist" : "Register"}
      </Link>
    </nav>
  );
}
