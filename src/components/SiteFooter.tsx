"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONTACT_EMAIL, SITE_LOCATION_LINE } from "@/lib/site-contact";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="shrink-0 font-heading text-xl font-bold text-slate-900">
            YourAI<span className="text-blue-600">Lens</span>
            <span className="ml-2 text-xs font-normal text-slate-700">Studios</span>
          </Link>

          <div className="flex flex-col gap-2 text-center text-sm md:text-left">
            <Link href="/contact" className="font-semibold text-slate-900 transition-colors hover:text-blue-600">
              Contact
            </Link>
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="text-slate-700 transition-colors hover:text-blue-600 hover:underline"
            >
              {SITE_CONTACT_EMAIL}
            </a>
            <p className="text-slate-600">{SITE_LOCATION_LINE}</p>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <a
              href="https://instagram.com/yourailens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 transition-colors hover:text-slate-900"
            >
              @yourailens
            </a>
            <p className="text-xs text-slate-700">© 2026 YourAILens Studios</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
