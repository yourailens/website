"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLinkPendingSpinner } from "@/components/NavLinkWithPending";
import type { IndustryMediaType } from "@/data/industries";
import { resolveMediaType } from "@/lib/industries/media";
import {
  CREATIONS_CHANNEL_LINKS,
  CREATIONS_MOBILE_LINKS,
  CREATIONS_PORTFOLIO_LINKS,
  CREATIONS_TALENT_LINKS,
  EXPLORE_MEGA_GROUPS,
  INDUSTRY_MEGA_LEGACY_SLICE,
  INDUSTRY_MEGA_SIDEBAR,
  MODULES_NAV_CATEGORIES,
  NAV_LABELS,
  WORLD_OF_AI_NAV_LINKS,
  exploreMegaVisual,
  RESOURCES_NAV_CATEGORIES,
  STUDIO_MOBILE_LINKS,
  type ExploreMegaSection,
  type IndustryMegaSection,
} from "@/data/studio-nav";
import { isOttOverlayPath, isOttPath } from "@/lib/ott-theme";
import OttSearchOverlay, { SearchGlyph } from "@/components/OttSearchOverlay";

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

const OttNavContext = createContext(false);

function DesktopLogoInner() {
  const { pending } = useLinkStatus();
  const ott = useContext(OttNavContext);
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait rounded-md" aria-hidden /> : null}
      <span className="relative z-[2] flex items-center gap-2.5">
        <NavLinkPendingSpinner borderClassName={ott ? "border-white" : "border-blue-600"} />
        <div
          className={`flex h-8 w-8 items-center justify-center ${
            ott ? "rounded-md bg-blue-600" : "rounded-xl bg-blue-600 shadow-lg shadow-blue-200"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="white" />
          </svg>
        </div>
        <span className="flex flex-col justify-center leading-none">
          <span
            className={`font-heading ${
              ott
                ? "text-[1.35rem] tracking-[0.04em] text-white drop-shadow-[0_0_18px_rgba(96,165,250,0.35)]"
                : "text-[1.35rem] tracking-tight text-slate-900"
            }`}
          >
            YOUR<span className={ott ? "text-blue-400" : "text-blue-600"}>AI</span>LENS
          </span>
          <span
            className={`mt-0.5 font-heading text-[0.58rem] uppercase tracking-[0.42em] ${
              ott ? "text-white/55" : "text-slate-500"
            }`}
          >
            Studios
          </span>
        </span>
      </span>
    </>
  );
}

const desktopNavLinkClass = (active: boolean, ott = false) =>
  ott
    ? `relative whitespace-nowrap py-2 text-[14.5px] font-medium tracking-[-0.015em] transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-blue-500 after:transition-transform after:duration-200 after:content-[''] ${
        active
          ? "text-white after:scale-x-100"
          : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100 hover:after:bg-white/40"
      }`
    : `relative py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-800 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-slate-900 after:transition-transform after:duration-300 after:content-[''] ${
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
  const ott = useContext(OttNavContext);
  return (
    <Link href={href} prefetch className={desktopNavLinkClass(active, ott)}>
      {label}
    </Link>
  );
}

function DesktopContactCta() {
  const ott = useContext(OttNavContext);
  return (
    <Link
      href="/contact"
      prefetch
      className={
        ott
          ? "relative inline-flex rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500"
          : "relative inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-blue-200/50 transition hover:bg-blue-700"
      }
    >
      <DesktopContactCtaInner ott={ott} />
    </Link>
  );
}

function DesktopContactCtaInner({ ott = false }: { ott?: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait rounded-full" aria-hidden /> : null}
      <span className="relative z-[2] inline-flex items-center gap-2">
        <NavLinkPendingSpinner borderClassName="border-white" />
        {ott ? (
          <>
            Contact
            <span className="ml-0.5 text-white/70" aria-hidden>
              →
            </span>
          </>
        ) : (
          <>
            Book a call
            <span className="ml-1.5 text-white/70" aria-hidden>
              →
            </span>
          </>
        )}
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
      className="relative block border-b border-white/10 py-4 font-heading text-[1.65rem] uppercase tracking-[0.08em] text-white transition-colors hover:text-blue-300"
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
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="white" />
          </svg>
        </div>
        <span className="flex flex-col justify-center leading-none">
          <span className="font-heading text-[1.25rem] tracking-tight text-white">
            YOUR<span className="text-blue-400">AI</span>LENS
          </span>
          <span className="mt-0.5 font-heading text-[0.55rem] uppercase tracking-[0.42em] text-white/55">
            Studios
          </span>
        </span>
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
      className="relative mt-2 block w-full border border-white/20 py-3.5 text-center font-heading text-sm uppercase tracking-[0.22em] text-white transition hover:border-blue-400 hover:text-blue-300"
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
        <NavLinkPendingSpinner borderClassName="border-white" />
        Contact
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

type DesktopMegaMenuId = "explore" | "worldOfAi";

function isExploreNavActive(pathname: string) {
  return (
    pathname.startsWith("/industries") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/films") ||
    pathname.startsWith("/avatars") ||
    pathname.startsWith("/instagram") ||
    pathname.startsWith("/youtube") ||
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

function isAdsNavActive(pathname: string) {
  return pathname.startsWith("/ai-ads");
}

function isFilmsChannelActive(pathname: string) {
  return pathname.startsWith("/ai-filmmaking");
}

function isCommunityNavActive(pathname: string) {
  return pathname.startsWith("/ai-verse") || pathname.startsWith("/world-of-ai");
}

function isTeamNavActive(pathname: string) {
  return pathname.startsWith("/team");
}

function isPricingNavActive(pathname: string) {
  return pathname.startsWith("/pricing");
}

function isEventsNavActive(pathname: string) {
  return pathname.startsWith("/events");
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
    <div className="border-b border-white/10 bg-zinc-950 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)]">
      <div className="flex min-h-[min(420px,54vh)] w-full">
        <div className="relative hidden w-[min(46vw,640px)] min-w-[300px] shrink-0 self-stretch lg:block">
          <Image key={bgSrc} src={bgSrc} alt={bgAlt} fill className="object-cover object-center" sizes="50vw" priority={false} />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/5 via-black/0 to-black"
            aria-hidden
          />
          {caption ? (
            <p className="absolute bottom-8 left-6 font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-white lg:left-10">
              {caption}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 bg-zinc-950">
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
      className="group mb-8 block max-w-lg border-b border-white/25 pb-5 transition-opacity hover:opacity-80"
    >
      {subtitle ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-400/80">{subtitle}</p>
      ) : null}
      <span className="mt-2 flex items-end justify-between gap-4">
        <span className="font-heading text-xl tracking-tight text-white sm:text-2xl">{title}</span>
        <span className="pb-0.5 text-[10px] uppercase tracking-[0.24em] text-white/40 group-hover:text-blue-300">
          View all
        </span>
      </span>
    </Link>
  );
}

function MegaColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-b border-white/10 pb-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-blue-400/80">{children}</p>
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
      className="group flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 hover:border-white/10 hover:bg-white/[0.04]"
    >
      {icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-blue-400">
          {icon}
        </span>
      ) : null}
      <span className="font-body text-[13px] font-medium text-white/85 group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}

function NavMediaIcon({ href }: { href: string }) {
  const cls = "text-blue-400";
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
  const cls = "text-blue-400";
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
  const ott = useContext(OttNavContext);
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls={panelId}
      id={`nav-${menuId}-trigger`}
      onClick={onToggle}
      className={`${desktopNavLinkClass(active || open, ott)} inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0`}
    >
      {label}
      {ott ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      ) : null}
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
      <span className="font-body text-[13px] font-medium tracking-wide text-white/80 group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}

function MegaCategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/40">{children}</p>
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
      className={`w-full border-l-2 py-2.5 pl-3 text-left text-[11px] uppercase tracking-[0.16em] transition-colors ${
        active
          ? "border-blue-400 text-white"
          : "border-transparent text-white/40 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function DesktopWorldOfAiMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  const visual = WORLD_OF_AI_NAV_LINKS[0];
  return (
    <MegaPanelLuxury bgSrc={visual.image} bgAlt={visual.label} caption={NAV_LABELS.worldOfAi}>
      <div className="flex min-h-[220px] flex-col justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-blue-400/80">
          {NAV_LABELS.worldOfAi}
        </p>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {WORLD_OF_AI_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              onClick={onLinkClick}
              className="group relative overflow-hidden bg-black"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={link.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.06]"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-blue-300">Open</p>
                  <p className="mt-0.5 font-heading text-lg leading-none text-white">{link.label}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs font-light leading-relaxed text-white/50">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MegaPanelLuxury>
  );
}

function DesktopExploreMegaPanel({
  industries,
  loading,
  onLinkClick,
}: {
  industries: NavIndustry[];
  loading: boolean;
  onLinkClick: () => void;
}) {
  const [section, setSection] = useState<ExploreMegaSection>("portfolio");
  const visual = exploreMegaVisual(section);
  const columns = buildIndustryNavColumns(industries);
  const activeIndustryColumn = columns.find((col) => col.id === section) ?? columns[0];
  const isIndustrySection =
    section === "commerce-tech" || section === "brands-services" || section === "property-commerce";

  return (
    <MegaPanelLuxury bgSrc={visual.src} bgAlt={visual.alt} caption={visual.caption}>
      <div className="flex min-h-[220px]">
        <aside className="w-[168px] shrink-0 border-r border-white/10 py-1 pr-8">
          <nav className="flex flex-col gap-5" aria-label="Explore sections">
            {EXPLORE_MEGA_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <MegaSidebarNavButton
                      key={item.id}
                      active={section === item.id}
                      label={item.label}
                      onClick={() => setSection(item.id)}
                    />
                  ))}
                </div>
              </div>
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

          {isIndustrySection && (
            <>
              <MegaHorizontalFeaturedLink
                href="/industries"
                title="Browse all industries"
                subtitle="See every vertical we serve"
                onClick={onLinkClick}
              />
              {loading ? (
                <div className="max-w-xl divide-y divide-white/10" aria-hidden>
                  {Array.from({ length: 4 }).map((_, row) => (
                    <div key={row} className="py-4">
                      <div className="h-3.5 w-40 bg-white/10" />
                      <div className="mt-2 h-3 w-56 max-w-full bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : (
                <nav aria-label={activeIndustryColumn?.label ?? "Industries"} className="max-w-xl">
                  {(activeIndustryColumn?.items ?? []).map((item) => (
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
            </>
          )}

          {section === "modules" && (
            <>
              <div className="mb-6 flex gap-8 border-b border-white/10 pb-5">
                <Link
                  href="/modules"
                  prefetch
                  onClick={onLinkClick}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
                >
                  All modules
                </Link>
              </div>
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
            </>
          )}

          {section === "libraries" && (
            <>
              <div className="mb-6 flex gap-8 border-b border-white/10 pb-5">
                <Link
                  href="/resources"
                  prefetch
                  onClick={onLinkClick}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
                >
                  All libraries
                </Link>
              </div>
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
            </>
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
      className="group flex items-start justify-between gap-6 border-b border-white/10 py-4 transition-colors last:border-b-0 hover:border-white/25"
    >
      <span className="min-w-0">
        <span className="block font-heading text-[15px] tracking-wide text-white">{label}</span>
        {description ? (
          <span className="mt-1 block text-[13px] font-light leading-relaxed text-white/45">{description}</span>
        ) : null}
      </span>
      <span
        className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.24em] text-white/30 transition group-hover:text-blue-300"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}

/** Fallback before measure; real height set via ResizeObserver (fixed header needs a document-flow spacer). */
const NAV_HEADER_FALLBACK_PX = 132;

export default function Navbar() {
  const pathname = usePathname();
  const ott = isOttPath(pathname);
  const overlay = isOttOverlayPath(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [worldOfAiOpen, setWorldOfAiOpen] = useState(false);
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
    // Prevent background scroll while mobile menu or search overlay is open (including iOS).
    if (!menuOpen && !searchOpen) {
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
  }, [menuOpen, searchOpen]);

  /** Close drawer after navigation completes (don’t hide immediately on tap). */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setExploreOpen(false);
    setWorldOfAiOpen(false);
  }, [pathname]);

  /** Reset Explore accordion whenever the drawer closes. */
  useEffect(() => {
    if (!menuOpen) {
      setExploreOpen(false);
      setWorldOfAiOpen(false);
    }
  }, [menuOpen]);

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

  const exploreMega = useDesktopMegaMenu(pathname);
  const worldOfAiMega = useDesktopMegaMenu(pathname);

  const toggleExploreMega = useCallback(() => {
    worldOfAiMega.setOpen(false);
    exploreMega.setOpen((open) => !open);
  }, [exploreMega, worldOfAiMega]);

  const toggleWorldOfAiMega = useCallback(() => {
    exploreMega.setOpen(false);
    worldOfAiMega.setOpen((open) => !open);
  }, [exploreMega, worldOfAiMega]);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    exploreMega.setOpen(false);
    worldOfAiMega.setOpen(false);
    setSearchOpen(true);
  }, [exploreMega, worldOfAiMega]);

  useEffect(() => {
    if (!ott) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
        return;
      }
      if (!typing && e.key === "/" && !searchOpen) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ott, openSearch, searchOpen]);

  const navSolid = ott && (scrolled || !overlay || exploreMega.open);

  return (
    <OttNavContext.Provider value={ott}>
    <>
      {/* fixed: sticky fails site-wide because html/body use overflow-x hidden */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          ott
            ? navSolid
              ? "bg-black/95 shadow-lg shadow-black/40 backdrop-blur-md"
              : "bg-gradient-to-b from-black via-black/70 to-transparent shadow-none"
            : scrolled
              ? "shadow-md"
              : "shadow-sm"
        }`}
      >
        {/* Book a call banner */}
        {ott ? null : (
        <Link
          href="/contact"
          prefetch
          className="group block bg-blue-600 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <span className="inline-flex items-center gap-x-2 px-2">
            <span>✦ Let&apos;s build something with AI</span>
          </span>
        </Link>
        )}

      {/* Main navbar */}
        <nav className={`relative overflow-visible ${ott ? "bg-transparent" : "border-b border-slate-200/80 bg-white"}`}>
        <div className="px-4 sm:px-6 lg:px-10">
          <div className={`flex items-center justify-between gap-4 ${ott ? "h-16" : "h-[4.25rem]"}`}>
              <DesktopLogoLink />

              {ott ? (
                <div className="hidden min-w-0 flex-1 items-center gap-5 lg:flex">
                  <DesktopNavTextLink href="/ai-ads" label="Ads" active={isAdsNavActive(pathname)} />
                  <DesktopNavTextLink href="/ai-filmmaking" label="Films" active={isFilmsChannelActive(pathname)} />
                  <DesktopNavTextLink href="/ai-verse" label="Community" active={isCommunityNavActive(pathname)} />
                  <DesktopNavTextLink href="/team" label="Team" active={isTeamNavActive(pathname)} />
                  <div key="nav-explore" ref={exploreMega.triggerRef} className="relative">
                    <DesktopMegaMenuTrigger
                      menuId="explore"
                      panelId="nav-explore-mega"
                      label="Browse"
                      open={exploreMega.open}
                      onToggle={toggleExploreMega}
                      active={isExploreNavActive(pathname)}
                    />
                  </div>
                  <DesktopNavTextLink href="/pricing" label="Pricing" active={isPricingNavActive(pathname)} />
                  <DesktopNavTextLink href="/events" label="Events" active={isEventsNavActive(pathname)} />
                </div>
              ) : (
              <div className="hidden flex-1 items-center justify-center lg:flex">
                <div className="flex items-center gap-8 lg:gap-10">
                <div key="nav-world-of-ai" ref={worldOfAiMega.triggerRef} className="relative">
                  <DesktopMegaMenuTrigger
                    menuId="worldOfAi"
                    panelId="nav-world-of-ai-mega"
                    label={NAV_LABELS.worldOfAi}
                    open={worldOfAiMega.open}
                    onToggle={toggleWorldOfAiMega}
                    active={isCommunityNavActive(pathname) || isAdsNavActive(pathname) || isFilmsChannelActive(pathname)}
                  />
                </div>
                <DesktopNavTextLink
                  href="/team"
                  label={NAV_LABELS.team}
                  active={isTeamNavActive(pathname)}
                />
                <DesktopNavTextLink
                  href="/pricing"
                  label={NAV_LABELS.pricing}
                  active={isPricingNavActive(pathname)}
                />
                <div key="nav-explore" ref={exploreMega.triggerRef} className="relative">
                  <DesktopMegaMenuTrigger
                    menuId="explore"
                    panelId="nav-explore-mega"
                    label={NAV_LABELS.explore}
                    open={exploreMega.open}
                    onToggle={toggleExploreMega}
                    active={isExploreNavActive(pathname)}
                  />
                </div>
                <DesktopNavTextLink
                  href="/events"
                  label="Events"
                  active={isEventsNavActive(pathname)}
                />
                </div>
              </div>
              )}

            <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
                {ott ? (
                  <button
                    type="button"
                    onClick={openSearch}
                    aria-label="Search"
                    className="flex h-10 w-10 items-center justify-center text-white/75 transition hover:text-white"
                  >
                    <SearchGlyph />
                  </button>
                ) : null}
                <DesktopContactCta />
              </div>

            <div className="ml-auto flex items-center gap-1 lg:hidden">
            {ott ? (
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-white/20 text-neutral-200 ring-1 ring-white/30"
              >
                <SearchGlyph />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] ${
                ott
                  ? "rounded-md bg-white/20 ring-1 ring-white/30"
                  : "rounded-xl border border-slate-200"
              }`}
              aria-label="Toggle menu"
            >
              <span className={`h-[2px] w-5 rounded-full transition-all duration-300 ${ott ? "bg-neutral-200" : "bg-slate-700"} ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full transition-all duration-300 ${ott ? "bg-neutral-200" : "bg-slate-700"} ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full transition-all duration-300 ${ott ? "bg-neutral-200" : "bg-slate-700"} ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
            </div>
          </div>
        </div>

          {/* World of AI mega panel */}
          <div
            ref={worldOfAiMega.panelRef}
            id="nav-world-of-ai-mega"
            role="region"
            aria-labelledby="nav-worldOfAi-trigger"
            aria-hidden={!worldOfAiMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-opacity duration-200 max-lg:hidden ${
              worldOfAiMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopWorldOfAiMegaPanel onLinkClick={() => worldOfAiMega.setOpen(false)} />
          </div>

          {/* Explore mega panel */}
          <div
            ref={exploreMega.panelRef}
            id="nav-explore-mega"
            role="region"
            aria-labelledby="nav-explore-trigger"
            aria-hidden={!exploreMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-opacity duration-200 max-lg:hidden ${
              exploreMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopExploreMegaPanel
              industries={navIndustries}
              loading={industriesLoading}
              onLinkClick={() => exploreMega.setOpen(false)}
            />
          </div>
        </nav>
      </header>
      <div aria-hidden className="shrink-0" style={{ height: overlay ? 0 : headerOffsetPx }} />

      {/* Mobile menu — above nav (z-50) so nothing stacks on top */}
      <div
        className={`fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-black transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18),_transparent_55%)]" aria-hidden />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Scroll container (menu scrolls, page behind does not). */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
            <div className="mb-10 flex items-center justify-between gap-4">
              <MobileLogoLink pathname={pathname} onSamePathClose={closeIfSamePath} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center border border-white/20 text-white transition-colors hover:border-white/50"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
              <nav className="flex flex-col">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400/70">Channels</p>
                <MobileNavLink href="/ai-ads" label="Ads" pathname={pathname} onSamePathClose={closeIfSamePath} />
                <MobileNavLink href="/ai-filmmaking" label="Films" pathname={pathname} onSamePathClose={closeIfSamePath} />
                <MobileNavLink href="/ai-verse" label="Community" pathname={pathname} onSamePathClose={closeIfSamePath} />
                <MobileNavLink href="/team" label="Team" pathname={pathname} onSamePathClose={closeIfSamePath} />

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setWorldOfAiOpen(false);
                      setExploreOpen((open) => !open);
                    }}
                    aria-expanded={exploreOpen}
                    aria-controls="mobile-explore-panel"
                    className="flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-white"
                  >
                    <span className="font-heading text-[1.65rem] uppercase tracking-[0.08em] text-white">
                      Browse
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={`shrink-0 text-white/70 transition-transform duration-200 ${
                        exploreOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </button>

                  <div
                    id="mobile-explore-panel"
                    hidden={!exploreOpen}
                    className={exploreOpen ? "mt-3 flex flex-col gap-1" : undefined}
                  >
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-blue-400/70">
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

                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-blue-400/70">
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

                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-blue-400/70">
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
                  </div>
                </div>
                <MobileNavLink href="/pricing" label="Pricing" pathname={pathname} onSamePathClose={closeIfSamePath} />
                <MobileNavLink href="/events" label="Events" pathname={pathname} onSamePathClose={closeIfSamePath} />
      </nav>

              <div className="mt-10 flex flex-col gap-4">
                <MobileContactCta pathname={pathname} onSamePathClose={closeIfSamePath} />
              </div>

              {/* Extra empty space so the last item can scroll up into view comfortably. */}
              <div aria-hidden className="h-[22vh]" />
            </div>
          </div>
        </div>
      </div>
      {ott ? (
        <OttSearchOverlay
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          industries={navIndustries}
        />
      ) : null}
    </>
    </OttNavContext.Provider>
  );
}
