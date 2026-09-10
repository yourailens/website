"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EXPLORE_FOOTER_LINKS,
  MODULES_NAV_CATEGORIES,
  NAV_LABELS,
  RESOURCES_NAV_CATEGORIES,
  WORLD_OF_AI_FOOTER_LINKS,
} from "@/data/studio-nav";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";

/** Package detail pages use a full-height estimator layout — no site footer. */
function hideFooter(pathname: string | null) {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return true;
  if (!pathname.startsWith("/pricing/")) return false;
  if (pathname === "/pricing/estimator") return false;
  return true;
}

const linkClass = "font-semibold text-slate-800 transition-colors hover:text-blue-600";
const hubClass = "font-bold text-blue-600 transition-colors hover:text-blue-700";
const groupClass = "mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  if (hideFooter(pathname)) return null;

  return (
    <footer className="border-t border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/" className="shrink-0 font-heading text-xl font-bold text-slate-900">
            YourAI<span className="text-blue-600">Lens</span>
            <span className="ml-2 text-xs font-normal text-slate-700">Studios</span>
          </Link>

          <div className="grid w-full min-w-0 max-w-6xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-5 lg:gap-x-8">
            <FooterColumn title="Company">
              <Link href="/about" className={linkClass}>
                About
              </Link>
              <Link href="/team" className={linkClass}>
                {NAV_LABELS.team}
              </Link>
              <Link href="/pricing" className={linkClass}>
                Pricing
              </Link>
              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
              <Link href="/events/ai-creator-workshop" className={linkClass}>
                Workshop
              </Link>
              <p className={`${groupClass} !mt-5`}>Contact</p>
              <a
                href={`mailto:${SITE_CONTACT_EMAIL}`}
                className="break-all text-slate-700 transition-colors hover:text-blue-600 hover:underline"
              >
                {SITE_CONTACT_EMAIL}
              </a>
              <p className="text-slate-600">{SITE_LOCATION_LINE}</p>
            </FooterColumn>

            <FooterColumn title={NAV_LABELS.worldOfAi}>
              {WORLD_OF_AI_FOOTER_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </FooterColumn>

            <FooterColumn title={NAV_LABELS.explore}>
              {EXPLORE_FOOTER_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </FooterColumn>

            <FooterColumn title="Modules">
              <Link href="/modules" className={hubClass}>
                All modules
              </Link>
              {MODULES_NAV_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className={groupClass}>{cat.label}</p>
                  {cat.items.map((item) => (
                    <Link key={item.href} href={item.href} className={`block ${linkClass}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </FooterColumn>

            <FooterColumn title="Libraries">
              <Link href="/resources" className={hubClass}>
                All libraries
              </Link>
              {RESOURCES_NAV_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className={groupClass}>{cat.label}</p>
                  {cat.items.map((item) => (
                    <Link key={item.href} href={item.href} className={`block ${linkClass}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </FooterColumn>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500 lg:text-right">© 2026 YourAILens Studios</p>
      </div>
    </footer>
  );
}
