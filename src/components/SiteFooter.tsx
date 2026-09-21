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
import { isOttPath } from "@/lib/ott-theme";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";

/** Full-height booking / estimator layouts — no site footer. */
function hideFooter(pathname: string | null) {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/contact") return true;
  if (!pathname.startsWith("/pricing/")) return false;
  if (pathname === "/pricing/estimator") return false;
  return true;
}

function FooterColumn({
  title,
  children,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm">
      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-white/45" : "text-slate-500"}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  if (hideFooter(pathname)) return null;
  const ott = isOttPath(pathname);
  const linkClass = ott
    ? "font-semibold text-white/75 transition-colors hover:text-blue-400"
    : "font-semibold text-slate-800 transition-colors hover:text-blue-600";
  const hubClass = ott
    ? "font-bold text-blue-400 transition-colors hover:text-blue-300"
    : "font-bold text-blue-600 transition-colors hover:text-blue-700";
  const groupClass = ott
    ? "mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white/35"
    : "mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400";

  return (
    <footer className={ott ? "border-t border-white/10 bg-black py-12" : "border-t border-slate-100 bg-white py-12"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/" className={`shrink-0 font-heading text-xl font-bold ${ott ? "text-white" : "text-slate-900"}`}>
            YourAI<span className={ott ? "text-blue-400" : "text-blue-600"}>Lens</span>
            <span className={`ml-2 text-xs font-normal ${ott ? "text-white/55" : "text-slate-700"}`}>Studios</span>
          </Link>

          <div className="grid w-full min-w-0 max-w-6xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-5 lg:gap-x-8">
            <FooterColumn title="Company" dark={ott}>
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
              <Link href="/events" className={linkClass}>
                Events
              </Link>
              <p className={`${groupClass} !mt-5`}>Contact</p>
              <a
                href={`mailto:${SITE_CONTACT_EMAIL}`}
                className={`break-all transition-colors hover:underline ${ott ? "text-white/70 hover:text-blue-400" : "text-slate-700 hover:text-blue-600"}`}
              >
                {SITE_CONTACT_EMAIL}
              </a>
              <p className={ott ? "text-white/55" : "text-slate-600"}>{SITE_LOCATION_LINE}</p>
            </FooterColumn>

            <FooterColumn title={NAV_LABELS.worldOfAi} dark={ott}>
              {WORLD_OF_AI_FOOTER_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </FooterColumn>

            <FooterColumn title={NAV_LABELS.explore} dark={ott}>
              {EXPLORE_FOOTER_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </FooterColumn>

            <FooterColumn title="Modules" dark={ott}>
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

            <FooterColumn title="Libraries" dark={ott}>
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

        <p className={`mt-10 text-center text-xs lg:text-right ${ott ? "text-white/35" : "text-slate-500"}`}>
          © 2026 YourAILens Studios
        </p>
      </div>
    </footer>
  );
}

