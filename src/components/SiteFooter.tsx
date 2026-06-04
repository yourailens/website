"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";

/** Package detail pages use a full-height estimator layout — no site footer. */
function hideFooter(pathname: string | null) {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return true;
  if (!pathname.startsWith("/pricing/")) return false;
  if (pathname === "/pricing/estimator") return false;
  return true;
}

export default function SiteFooter() {
  const pathname = usePathname();
  if (hideFooter(pathname)) return null;

  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="shrink-0 font-heading text-xl font-bold text-slate-900">
            YourAI<span className="text-blue-600">Lens</span>
            <span className="ml-2 text-xs font-normal text-slate-700">Studios</span>
          </Link>

          <div className="grid grid-cols-2 gap-8 text-center text-sm md:text-left lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Explore</p>
              <Link href="/modules" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                All Modules ↗
              </Link>
              <Link href="/modules/product-shoot" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Product Shoot
              </Link>
              <Link href="/modules/trailer-cut" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Trailer Cut
              </Link>
              <Link href="/modules/poster-design" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Poster Design
              </Link>
              <Link href="/images" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Images
              </Link>
              <Link href="/films" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Films
              </Link>
              <Link href="/avatars" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Avatars
              </Link>
              <Link href="/events" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Events
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Company</p>
              <Link href="/about" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                About
              </Link>
              <Link href="/pricing" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/contact" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
                Contact
              </Link>
              <Link href="/events/ai-creator-workshop" className="text-slate-700 transition-colors hover:text-blue-600">
                Workshop
              </Link>
            </div>
            <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Contact</p>
              <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-slate-700 transition-colors hover:text-blue-600 hover:underline">
                {SITE_CONTACT_EMAIL}
              </a>
              <p className="text-slate-600">{SITE_LOCATION_LINE}</p>
              <a
                href="https://instagram.com/yourailens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 transition-colors hover:text-slate-900"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <p className="text-xs text-slate-700">© 2026 YourAILens Studios</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
