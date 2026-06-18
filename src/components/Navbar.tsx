"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLinkPendingSpinner } from "@/components/NavLinkWithPending";
import type { IndustryMediaType } from "@/data/industries";
import { resolveMediaType } from "@/lib/industries/media";
import {
  CREATIONS_CHANNEL_LINKS,
  CREATIONS_FUTURE_LINKS,
  CREATIONS_MEGA_SIDEBAR,
  CREATIONS_MOBILE_LINKS,
  CREATIONS_PORTFOLIO_LINKS,
  CREATIONS_TALENT_LINKS,
  MODULES_NAV_CATEGORIES,
  NAV_LABELS,
  INDUSTRY_MEGA_LEGACY_SLICE,
  INDUSTRY_MEGA_SIDEBAR,
  NAV_MEGA_VISUALS,
  RESOURCES_NAV_CATEGORIES,
  STUDIO_MEGA_SIDEBAR,
  STUDIO_MOBILE_LINKS,
  type CreationsMegaSection,
  type IndustryMegaSection,
  type StudioMegaSection,
} from "@/data/studio-nav";

const MODULES_CATEGORIES = MODULES_NAV_CATEGORIES;
const RESOURCES_CATEGORIES = RESOURCES_NAV_CATEGORIES;

type NavIndustry = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  coverUrl: string | null;
};

type NavIndustryApi = {
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  cover_media_type?: IndustryMediaType | null;
  cover_poster_url?: string | null;
  hero_image_url?: string | null;
  hero_media_type?: IndustryMediaType | null;
  hero_poster_url?: string | null;
};

/** Nav thumbnails need a still image — skip raw video URLs unless a poster exists. */
function resolveIndustryNavStill(
  url: string | null | undefined,
  mediaType: IndustryMediaType | null | undefined,
  posterUrl: string | null | undefined
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (resolveMediaType(mediaType, trimmed) === "video") {
    return posterUrl?.trim() || null;
  }
  return trimmed;
}

function resolveIndustryNavCover(ind: NavIndustryApi): string | null {
  return (
    resolveIndustryNavStill(ind.cover_image_url, ind.cover_media_type, ind.cover_poster_url) ??
    resolveIndustryNavStill(ind.hero_image_url, ind.hero_media_type, ind.hero_poster_url) ??
    null
  );
}

let navIndustriesCache: NavIndustry[] | null = null;
let navIndustriesInflight: Promise<NavIndustry[]> | null = null;

/** Navbar-only order tweaks (does not change DB / hub sort_order). */
function swapNavbarIndustries(list: NavIndustry[], slugA: string, slugB: string) {
  const a = list.findIndex((i) => i.slug === slugA);
  const b = list.findIndex((i) => i.slug === slugB);
  if (a < 0 || b < 0) return;
  [list[a], list[b]] = [list[b], list[a]];
}

function applyNavbarIndustryOrder(industries: NavIndustry[]): NavIndustry[] {
  const list = [...industries];
  swapNavbarIndustries(list, "d2c-ecommerce", "food-beverage");
  swapNavbarIndustries(list, "saas-b2b", "healthcare-wellness");
  return list;
}

function fetchNavIndustries(): Promise<NavIndustry[]> {
  if (navIndustriesCache) return Promise.resolve(navIndustriesCache);
  if (!navIndustriesInflight) {
    navIndustriesInflight = fetch("/api/industries")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch failed"))))
      .then((data: { industries?: NavIndustryApi[] }) => {
        const list = applyNavbarIndustryOrder(
          (data.industries ?? []).map((ind) => ({
            slug: ind.slug,
            name: ind.name,
            tagline: ind.tagline ?? null,
            description: ind.description ?? null,
            coverUrl: resolveIndustryNavCover(ind),
          }))
        );
        navIndustriesCache = list;
        return list;
      })
      .catch(() => [] as NavIndustry[])
      .finally(() => {
        navIndustriesInflight = null;
      });
  }
  return navIndustriesInflight;
}

type IndustryNavColumn = {
  id: IndustryMegaSection;
  label: string;
  items: { href: string; label: string; slug: string; coverUrl: string | null; tagline: string | null }[];
};

function buildIndustryNavColumns(industries: NavIndustry[]): IndustryNavColumn[] {
  const columnCount = INDUSTRY_MEGA_SIDEBAR.length;
  const perCol = industries.length === 0 ? 0 : Math.ceil(industries.length / columnCount);

  return INDUSTRY_MEGA_SIDEBAR.map((section) => {
    const sliceIndex = INDUSTRY_MEGA_LEGACY_SLICE[section.id];
    return {
      id: section.id,
      label: section.label,
      items: industries.slice(sliceIndex * perCol, (sliceIndex + 1) * perCol).map((ind) => ({
        href: `/industries/${ind.slug}`,
        label: ind.name,
        slug: ind.slug,
        coverUrl: ind.coverUrl,
        tagline: ind.tagline,
      })),
    };
  });
}

function SocialBrandIcon({ name }: { name: "instagram" | "youtube" }) {
  if (name === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-blue-600" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function DesktopLogoLink() {
  return (
    <Link href="/" prefetch className="relative flex shrink-0 items-center gap-3">
      <DesktopLogoInner />
    </Link>
  );
}

function DesktopLogoInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait rounded-xl" aria-hidden /> : null}
      <span className="relative z-[2] flex items-center gap-3">
        <NavLinkPendingSpinner borderClassName="border-blue-600" />
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="white" />
          </svg>
        </div>
        <div>
          <span className="font-heading text-xl font-bold tracking-[-0.02em] text-slate-900">
            YourAI<span className="text-blue-600">Lens</span>
          </span>
          <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Studios
          </span>
        </div>
      </span>
    </>
  );
}

const desktopNavLinkClass = (active: boolean) =>
  `relative py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-800 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-slate-900 after:transition-transform after:duration-300 after:content-[''] ${
    active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
  }`;

function DesktopNavTextLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} prefetch className={desktopNavLinkClass(active)}>
      {label}
    </Link>
  );
}

function DesktopContactCta() {
  return (
    <Link
      href="/contact"
      prefetch
      className="relative inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-200/50 transition hover:bg-blue-700"
    >
      <DesktopContactCtaInner />
    </Link>
  );
}

function DesktopContactCtaInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait rounded-full" aria-hidden /> : null}
      <span className="relative z-[2] inline-flex items-center gap-2">
        <NavLinkPendingSpinner borderClassName="border-white" />
        Book a call
        <span className="ml-1.5 text-white/70" aria-hidden>
          →
        </span>
      </span>
    </>
  );
}



function MobileNavLink({
  href,
  label,
  pathname,
  onSamePathClose,
}: {
  href: string;
  label: string;
  pathname: string;
  onSamePathClose: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={() => {
        if (pathname === href) {
          onSamePathClose();
        }
      }}
      className="relative block rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-2xl font-black tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
    >
      <MobileNavLinkInner label={label} />
    </Link>
  );
}

function MobileNavLinkInner({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? (
        <span className="absolute inset-0 z-[1] cursor-wait rounded-2xl bg-black/10" aria-hidden />
      ) : null}
      <span className="relative z-[2] flex items-center gap-3">
        <NavLinkPendingSpinner borderClassName="border-white" />
        {label}
      </span>
    </>
  );
}

function MobileLogoLink({
  pathname,
  onSamePathClose,
}: {
  pathname: string;
  onSamePathClose: () => void;
}) {
  return (
    <Link
      href="/"
      prefetch
      onClick={() => {
        if (pathname === "/") {
          onSamePathClose();
        }
      }}
      className="relative flex items-center gap-3 overflow-visible"
    >
      <MobileLogoInner />
    </Link>
  );
}

function MobileLogoInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] -m-2 cursor-wait rounded-xl" aria-hidden /> : null}
      <span className="relative z-[2] flex items-center gap-3">
        <NavLinkPendingSpinner borderClassName="border-white" />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="white" />
          </svg>
        </div>
        <div>
          <p className="font-heading text-base font-black tracking-tight text-white">YourAILens</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">Studios</p>
        </div>
      </span>
    </>
  );
}

function MobileContactCta({
  pathname,
  onSamePathClose,
}: {
  pathname: string;
  onSamePathClose: () => void;
}) {
  return (
    <Link
      href="/contact"
      prefetch
      onClick={() => {
        if (pathname === "/contact") {
          onSamePathClose();
        }
      }}
      className="relative block w-full rounded-full bg-white py-4 text-center text-base font-bold text-blue-700 shadow-xl shadow-black/20 transition-transform active:scale-[0.98]"
    >
      <MobileContactCtaInner />
    </Link>
  );
}

function MobileContactCtaInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait rounded-full" aria-hidden /> : null}
      <span className="relative z-[2] inline-flex items-center justify-center gap-2">
        <NavLinkPendingSpinner borderClassName="border-blue-600" />
        Book a free call →
      </span>
    </>
  );
}

function MobilePricingLink({
  pathname,
  onSamePathClose,
}: {
  pathname: string;
  onSamePathClose: () => void;
}) {
  return (
    <Link
      href="/pricing"
      prefetch
      onClick={() => {
        if (pathname === "/pricing") {
          onSamePathClose();
        }
      }}
      className="relative block text-center text-sm font-semibold text-white/50 underline underline-offset-4 transition-colors hover:text-white/80"
    >
      <MobilePricingLinkInner />
    </Link>
  );
}

function MobilePricingLinkInner() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? (
        <span className="absolute inset-0 z-[1] cursor-wait rounded-lg" aria-hidden />
      ) : null}
      <span className="relative z-[2] inline-flex items-center justify-center gap-2">
        <NavLinkPendingSpinner borderClassName="border-white/70" />
        Pricing
      </span>
    </>
  );
}

function useDesktopMegaMenu(pathname: string) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return { open, setOpen, triggerRef, panelRef };
}

type DesktopMegaMenuId = "creations" | "industries" | "studio";

function isIndustriesNavActive(pathname: string) {
  return pathname.startsWith("/industries");
}

function isCreationsNavActive(pathname: string) {
  return (
    pathname.startsWith("/images") ||
    pathname.startsWith("/films") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/avatars") ||
    pathname.startsWith("/instagram") ||
    pathname.startsWith("/youtube") ||
    pathname.startsWith("/the-future")
  );
}

function isPricingNavActive(pathname: string) {
  return pathname.startsWith("/pricing");
}

function isStudioNavActive(pathname: string) {
  return (
    pathname.startsWith("/resources") ||
    pathname.startsWith("/modules") ||
    pathname.startsWith("/prompts") ||
    pathname.startsWith("/outfits") ||
    pathname.startsWith("/character-sheets") ||
    pathname.startsWith("/scenarios") ||
    pathname.startsWith("/locations") ||
    pathname.startsWith("/props") ||
    pathname.startsWith("/lighting-presets") ||
    pathname.startsWith("/color-grades") ||
    pathname.startsWith("/mood-boards")
  );
}

/** Luxury-style mega menu: editorial image column + clean white content */
function MegaPanelLuxury({
  bgSrc,
  bgAlt,
  caption,
  children,
}: {
  bgSrc: string;
  bgAlt: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.15)]">
      <div className="flex min-h-[min(420px,54vh)] w-full">
        <div className="relative hidden w-[min(46vw,640px)] min-w-[300px] shrink-0 self-stretch lg:block">
          <Image key={bgSrc} src={bgSrc} alt={bgAlt} fill className="object-cover object-center" sizes="50vw" priority={false} />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/5 via-black/0 to-white"
            aria-hidden
          />
          {caption ? (
            <p className="absolute bottom-8 left-6 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-white lg:left-10">
              {caption}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 bg-white">
          <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-9 sm:px-10 lg:max-w-none lg:px-12 lg:py-11">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaHorizontalFeaturedLink({
  href,
  title,
  subtitle,
  onClick,
}: {
  href: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="group mb-8 block max-w-lg border-b border-slate-900 pb-5 transition-opacity hover:opacity-80"
    >
      {subtitle ? (
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">{subtitle}</p>
      ) : null}
      <span className="mt-2 flex items-end justify-between gap-4">
        <span className="font-body text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">{title}</span>
        <span className="pb-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 group-hover:text-slate-900">
          View all
        </span>
      </span>
    </Link>
  );
}

function MegaColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-b border-slate-200/80 pb-2.5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-slate-700">{children}</p>
    </div>
  );
}

function MegaNavItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 hover:border-blue-100/80 hover:bg-blue-50/60"
    >
      {icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100/90 bg-blue-50/80 text-blue-600">
          {icon}
        </span>
      ) : null}
      <span className="font-body text-[13px] font-semibold text-slate-900 group-hover:text-blue-700">
        {label}
      </span>
    </Link>
  );
}

function NavMediaIcon({ href }: { href: string }) {
  const cls = "text-blue-600";
  const size = 16;
  if (href === "/films") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function NavIndustryIcon({ slug }: { slug: string }) {
  const cls = "text-blue-600";
  const size = 16;
  if (slug === "real-estate") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
      </svg>
    );
  }
  if (slug === "d2c-ecommerce") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (slug === "saas-b2b") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }
  if (slug === "fashion-apparel") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </svg>
    );
  }
  if (slug === "food-beverage") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    );
  }
  if (slug === "healthcare-wellness") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (slug === "education-edtech") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      </svg>
    );
  }
  if (slug === "hospitality-travel") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    );
  }
  if (slug === "beauty-cosmetics") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M12 3c-1.5 0-2.8 1.2-2.8 2.7v1.1c0 .8.4 1.5 1 2l.8.8v8.4c0 1 .8 1.8 1.8 1.8h.4c1 0 1.8-.8 1.8-1.8v-8.4l.8-.8c.6-.5 1-1.2 1-2V5.7C14.8 4.2 13.5 3 12 3z" />
        <path d="M9 21h6" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

/** Single trigger component — stable type across nav items (avoids hydration mismatch on HMR reorder). */
function DesktopMegaMenuTrigger({
  menuId,
  panelId,
  label,
  open,
  onToggle,
  active,
}: {
  menuId: DesktopMegaMenuId;
  panelId: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls={panelId}
      id={`nav-${menuId}-trigger`}
      onClick={onToggle}
      className={`${desktopNavLinkClass(active || open)} cursor-pointer border-0 bg-transparent p-0`}
    >
      {label}
    </button>
  );
}

function MegaTextLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="group block py-1.5 transition-colors"
    >
      <span className="font-body text-[13px] font-semibold tracking-wide text-slate-800 group-hover:text-slate-900">
        {label}
      </span>
    </Link>
  );
}

function MegaCategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-slate-700">{children}</p>
  );
}

function MegaSidebarNavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-l-2 py-2.5 pl-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function DesktopStudioMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  const [section, setSection] = useState<StudioMegaSection>("modules");
  const visual = NAV_MEGA_VISUALS.studio[section];

  return (
    <MegaPanelLuxury bgSrc={visual.src} bgAlt={visual.alt} caption={visual.caption}>
      <div className="mb-8 flex gap-8 border-b border-slate-100 pb-6">
        <Link
          href="/modules"
          prefetch
          onClick={onLinkClick}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:text-slate-950"
        >
          All modules
        </Link>
        <Link
          href="/resources"
          prefetch
          onClick={onLinkClick}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-800 transition hover:text-slate-950"
        >
          All libraries
        </Link>
      </div>
      <div className="flex min-h-[220px]">
        <aside className="w-[168px] shrink-0 border-r border-slate-100 py-1 pr-8">
          <nav className="flex flex-col gap-0.5" aria-label="Studio sections">
            {STUDIO_MEGA_SIDEBAR.map((item) => (
              <MegaSidebarNavButton
                key={item.id}
                active={section === item.id}
                label={item.label}
                onClick={() => setSection(item.id)}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pl-6 lg:pl-8">
          {section === "libraries" && (
            <div className="grid gap-8 sm:grid-cols-3">
              {RESOURCES_CATEGORIES.map((cat) => (
                <nav key={cat.label} aria-label={cat.label}>
                  <MegaCategoryLabel>{cat.label}</MegaCategoryLabel>
                  <ul>
                    {cat.items.map((item) => (
                      <li key={item.href}>
                        <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}

          {section === "modules" && (
            <div className="grid gap-10 sm:grid-cols-2">
              {MODULES_CATEGORIES.map((cat) => (
                <nav key={cat.label} aria-label={cat.label}>
                  <MegaCategoryLabel>{cat.label}</MegaCategoryLabel>
                  <ul>
                    {cat.items.map((item) => (
                      <li key={item.href}>
                        <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>
      </div>
    </MegaPanelLuxury>
  );
}

function DesktopIndustriesMegaPanel({
  industries,
  loading,
  onLinkClick,
}: {
  industries: NavIndustry[];
  loading: boolean;
  onLinkClick: () => void;
}) {
  const [section, setSection] = useState<IndustryMegaSection>("commerce-tech");
  const columns = buildIndustryNavColumns(industries);
  const activeColumn = columns.find((col) => col.id === section) ?? columns[0];

  const visual = NAV_MEGA_VISUALS.industries[section];

  return (
    <MegaPanelLuxury bgSrc={visual.src} bgAlt={visual.alt} caption={visual.caption}>
      <MegaHorizontalFeaturedLink
        href="/industries"
        title="Browse all industries"
        subtitle="See every vertical we serve"
        onClick={onLinkClick}
      />
      <div className="flex min-h-[220px]">
        <aside className="w-[168px] shrink-0 border-r border-slate-100 py-1 pr-8">
          <nav className="flex flex-col gap-1" aria-label="Industry categories">
            {INDUSTRY_MEGA_SIDEBAR.map((item) => (
              <MegaSidebarNavButton
                key={item.id}
                active={section === item.id}
                label={item.label}
                onClick={() => setSection(item.id)}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pl-6 lg:pl-8">
          {loading ? (
            <div className="max-w-xl divide-y divide-slate-100" aria-hidden>
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="py-4">
                  <div className="h-3.5 w-40 bg-slate-100" />
                  <div className="mt-2 h-3 w-56 max-w-full bg-slate-50" />
                </div>
              ))}
            </div>
          ) : (
            <nav aria-label={activeColumn?.label ?? "Industries"} className="max-w-xl">
              {(activeColumn?.items ?? []).map((item) => (
                <MegaMenuLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.tagline ?? undefined}
                  onClick={onLinkClick}
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </MegaPanelLuxury>
  );
}

function MegaMenuLink({
  href,
  label,
  description,
  onClick,
}: {
  href: string;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="group flex items-start justify-between gap-6 border-b border-slate-100 py-4 transition-colors last:border-b-0 hover:border-slate-300"
    >
      <span className="min-w-0">
        <span className="block font-body text-[15px] font-semibold tracking-wide text-slate-900">{label}</span>
        {description ? (
          <span className="mt-1 block text-[13px] font-normal leading-relaxed text-slate-600">{description}</span>
        ) : null}
      </span>
      <span
        className="shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition group-hover:text-slate-900"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}

function DesktopCreationsMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  const [section, setSection] = useState<CreationsMegaSection>("portfolio");
  const visual = NAV_MEGA_VISUALS.creations[section];

  return (
    <MegaPanelLuxury bgSrc={visual.src} bgAlt={visual.alt} caption={visual.caption}>
      <div className="flex min-h-[220px]">
        <aside className="w-[168px] shrink-0 border-r border-slate-100 py-1 pr-8">
          <nav className="flex flex-col gap-1" aria-label="Creations sections">
            {CREATIONS_MEGA_SIDEBAR.map((item) => (
              <MegaSidebarNavButton
                key={item.id}
                active={section === item.id}
                label={item.label}
                onClick={() => setSection(item.id)}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pl-6 lg:pl-8">
          {section === "portfolio" && (
            <nav aria-label="Portfolio" className="max-w-xl">
              {CREATIONS_PORTFOLIO_LINKS.map((item) => (
                <MegaMenuLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  onClick={onLinkClick}
                />
              ))}
            </nav>
          )}

          {section === "talent" && (
            <nav aria-label="AI talent and events" className="max-w-xl">
              {CREATIONS_TALENT_LINKS.map((item) => (
                <MegaMenuLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  onClick={onLinkClick}
                />
              ))}
            </nav>
          )}

          {section === "channels" && (
            <nav aria-label="Channels" className="max-w-xl">
              {CREATIONS_CHANNEL_LINKS.map((item) => (
                <MegaMenuLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  onClick={onLinkClick}
                />
              ))}
            </nav>
          )}

          {section === "future" && (
            <nav aria-label="The Future" className="max-w-xl">
              {CREATIONS_FUTURE_LINKS.map((item) => (
                <MegaMenuLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  onClick={onLinkClick}
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </MegaPanelLuxury>
  );
}

/** Fallback before measure; real height set via ResizeObserver (fixed header needs a document-flow spacer). */
const NAV_HEADER_FALLBACK_PX = 132;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerOffsetPx, setHeaderOffsetPx] = useState(NAV_HEADER_FALLBACK_PX);
  const bodyScrollYRef = useRef(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderOffsetPx(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    // Prevent background scroll while mobile menu is open (including iOS).
    if (!menuOpen) {
      const y = bodyScrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (y) window.scrollTo(0, y);
      bodyScrollYRef.current = 0;
      return;
    }

    bodyScrollYRef.current = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${bodyScrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const y = bodyScrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (y) window.scrollTo(0, y);
      bodyScrollYRef.current = 0;
    };
  }, [menuOpen]);

  /** Close drawer after navigation completes (don’t hide immediately on tap). */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeIfSamePath = () => setMenuOpen(false);

  const [navIndustries, setNavIndustries] = useState<NavIndustry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNavIndustries().then((list) => {
      if (!cancelled) setNavIndustries(list);
    }).finally(() => {
      if (!cancelled) setIndustriesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const creationsMega = useDesktopMegaMenu(pathname);
  const industriesMega = useDesktopMegaMenu(pathname);
  const studioMega = useDesktopMegaMenu(pathname);

  const toggleCreationsMega = useCallback(() => {
    if (creationsMega.open) {
      creationsMega.setOpen(false);
      return;
    }
    industriesMega.setOpen(false);
    studioMega.setOpen(false);
    creationsMega.setOpen(true);
  }, [creationsMega, industriesMega, studioMega]);

  const toggleIndustriesMega = useCallback(() => {
    if (industriesMega.open) {
      industriesMega.setOpen(false);
      return;
    }
    creationsMega.setOpen(false);
    studioMega.setOpen(false);
    industriesMega.setOpen(true);
  }, [creationsMega, industriesMega, studioMega]);

  const toggleStudioMega = useCallback(() => {
    if (studioMega.open) {
      studioMega.setOpen(false);
      return;
    }
    creationsMega.setOpen(false);
    industriesMega.setOpen(false);
    studioMega.setOpen(true);
  }, [creationsMega, industriesMega, studioMega]);

  return (
    <>
      {/* fixed: sticky fails site-wide because html/body use overflow-x hidden */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}
      >
        {/* Book a call banner */}
        <Link
          href="/contact"
          prefetch
          className="group block bg-blue-600 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <span className="inline-flex items-center gap-x-2 px-2">
            <span>✦ Let&apos;s build something with AI</span>
          </span>
        </Link>

      {/* Main navbar */}
        <nav className="relative overflow-visible border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex h-[4.25rem] items-center justify-between gap-6">
              <DesktopLogoLink />

              <div className="hidden flex-1 items-center justify-center lg:flex">
                <div className="flex items-center gap-8 lg:gap-10">
                <div key="nav-creations" ref={creationsMega.triggerRef} className="relative">
                  <DesktopMegaMenuTrigger
                    menuId="creations"
                    panelId="nav-creations-mega"
                    label={NAV_LABELS.creations}
                    open={creationsMega.open}
                    onToggle={toggleCreationsMega}
                    active={isCreationsNavActive(pathname)}
                  />
                </div>
                <div key="nav-industries" ref={industriesMega.triggerRef} className="relative">
                  <DesktopMegaMenuTrigger
                    menuId="industries"
                    panelId="nav-industries-mega"
                    label={NAV_LABELS.industries}
                    open={industriesMega.open}
                    onToggle={toggleIndustriesMega}
                    active={isIndustriesNavActive(pathname)}
                  />
                </div>
                <div key="nav-studio" ref={studioMega.triggerRef} className="relative">
                  <DesktopMegaMenuTrigger
                    menuId="studio"
                    panelId="nav-studio-mega"
                    label={NAV_LABELS.studio}
                    open={studioMega.open}
                    onToggle={toggleStudioMega}
                    active={isStudioNavActive(pathname)}
                  />
                </div>
                <DesktopNavTextLink
                  href="/pricing"
                  label={NAV_LABELS.pricing}
                  active={isPricingNavActive(pathname)}
                />
                </div>
              </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
                <DesktopContactCta />
              </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

          {/* Creations mega panel */}
          <div
            ref={creationsMega.panelRef}
            id="nav-creations-mega"
            role="region"
            aria-labelledby="nav-creations-trigger"
            aria-hidden={!creationsMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-opacity duration-200 max-lg:hidden ${
              creationsMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopCreationsMegaPanel onLinkClick={() => creationsMega.setOpen(false)} />
          </div>

          {/* Industries mega panel */}
          <div
            ref={industriesMega.panelRef}
            id="nav-industries-mega"
            role="region"
            aria-labelledby="nav-industries-trigger"
            aria-hidden={!industriesMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-opacity duration-200 max-lg:hidden ${
              industriesMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopIndustriesMegaPanel
              industries={navIndustries}
              loading={industriesLoading}
              onLinkClick={() => industriesMega.setOpen(false)}
            />
          </div>

          {/* Studio mega panel */}
          <div
            ref={studioMega.panelRef}
            id="nav-studio-mega"
            role="region"
            aria-labelledby="nav-studio-trigger"
            aria-hidden={!studioMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-opacity duration-200 max-lg:hidden ${
              studioMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopStudioMegaPanel onLinkClick={() => studioMega.setOpen(false)} />
          </div>
        </nav>
      </header>
      <div aria-hidden className="shrink-0" style={{ height: headerOffsetPx }} />

      {/* Mobile menu — above nav (z-50) so nothing stacks on top */}
      <div
        className={`fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-[#1e3a8a] transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#172554] via-[#1d4ed8] to-[#1e3a8a]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" aria-hidden />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Scroll container (menu scrolls, page behind does not). */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <MobileLogoLink pathname={pathname} onSamePathClose={closeIfSamePath} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
              <nav className="flex flex-col gap-1">
                <p className="px-1 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-white/60">
                  {NAV_LABELS.creations}
                </p>
                {CREATIONS_MOBILE_LINKS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                <p className="mt-5 px-1 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-white/60">
                  {NAV_LABELS.industries}
                </p>
                <MobileNavLink
                  href="/industries"
                  label="All industries"
                  pathname={pathname}
                  onSamePathClose={closeIfSamePath}
                />
                {industriesLoading ? (
                  <p className="px-5 py-2 text-sm font-medium text-white/55">Loading…</p>
                ) : (
                  navIndustries.map((ind) => (
                    <MobileNavLink
                      key={ind.slug}
                      href={`/industries/${ind.slug}`}
                      label={ind.name}
                      pathname={pathname}
                      onSamePathClose={closeIfSamePath}
                    />
                  ))
                )}

                <p className="mt-5 px-1 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-white/60">
                  {NAV_LABELS.studio}
                </p>
                {STUDIO_MOBILE_LINKS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                <p className="mt-5 px-1 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-white/60">
                  {NAV_LABELS.pricing}
                </p>
                <MobileNavLink
                  href="/pricing"
                  label="Packages & pricing"
                  pathname={pathname}
                  onSamePathClose={closeIfSamePath}
                />
      </nav>

              <div className="mt-10 flex flex-col gap-4">
                <MobileContactCta pathname={pathname} onSamePathClose={closeIfSamePath} />
                <MobilePricingLink pathname={pathname} onSamePathClose={closeIfSamePath} />
              </div>

              {/* Extra empty space so the last item can scroll up into view comfortably. */}
              <div aria-hidden className="h-[22vh]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
