"use client";

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
  MODULES_NAV_CATEGORIES,
  NAV_LABELS,
  WORLD_OF_AI_NAV_LINKS,
  RESOURCES_NAV_CATEGORIES,
  STUDIO_MOBILE_LINKS,
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
          ? "relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-400/55 bg-transparent px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.25)] backdrop-blur-md transition hover:border-blue-300 hover:text-blue-200 hover:shadow-[inset_0_1px_0_rgba(147,197,253,0.35)] active:translate-y-px"
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
        <NavLinkPendingSpinner borderClassName={ott ? "border-blue-300" : "border-white"} />
        {ott ? (
          "Contact"
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
      className="relative mt-2 block w-full rounded-md border border-blue-400/55 bg-transparent py-3.5 text-center font-heading text-sm uppercase tracking-[0.22em] text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.25)] backdrop-blur-md transition hover:border-blue-300 hover:text-blue-200 hover:shadow-[inset_0_1px_0_rgba(147,197,253,0.35)]"
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
        <NavLinkPendingSpinner borderClassName="border-blue-300" />
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

function isAboutNavActive(pathname: string) {
  return pathname === "/about" || pathname.startsWith("/about/");
}

/** Full-width professional mega menu — text grid, no imagery */
function MegaPanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-zinc-950 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
      <div className="mx-auto w-full max-w-[90rem] px-5 py-5 sm:px-8 lg:px-10 lg:py-6">{children}</div>
    </div>
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
      className="group block py-0.5 transition-colors"
    >
      <span className="font-body text-[12px] font-medium tracking-wide text-white/80 group-hover:text-white">
        {label}
      </span>
    </Link>
  );
}

function DesktopWorldOfAiMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <MegaPanelShell>
      <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
        {NAV_LABELS.worldOfAi}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {WORLD_OF_AI_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch
            onClick={onLinkClick}
            className="group border border-white/10 bg-white/[0.02] px-3.5 py-3 transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <p className="font-body text-sm font-semibold tracking-tight text-white">{link.label}</p>
            <p className="mt-1 text-xs font-light leading-snug text-white/50">{link.description}</p>
          </Link>
        ))}
      </div>
    </MegaPanelShell>
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
  const moduleLinks: { href: string; label: string }[] = MODULES_CATEGORIES.flatMap((cat) => [
    ...cat.items,
  ]);
  const libraryLinks: { href: string; label: string }[] = RESOURCES_CATEGORIES.flatMap((cat) => [
    ...cat.items,
  ]);

  return (
    <MegaPanelShell>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <nav aria-label="Portfolio">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
            Portfolio
          </p>
          <ul className="space-y-0.5">
            {CREATIONS_PORTFOLIO_LINKS.map((item) => (
              <li key={item.href}>
                <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Talent and channels">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
            Talent & channels
          </p>
          <ul className="space-y-0.5">
            {[...CREATIONS_TALENT_LINKS, ...CREATIONS_CHANNEL_LINKS].map((item) => (
              <li key={item.href}>
                <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Industries">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
            Industries
          </p>
          <ul className="space-y-0.5">
            <li>
              <MegaTextLink href="/industries" label="All industries" onClick={onLinkClick} />
            </li>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="my-1 h-3 w-24 bg-white/10" aria-hidden />
                ))
              : industries.map((ind) => (
                  <li key={ind.slug}>
                    <MegaTextLink
                      href={`/industries/${ind.slug}`}
                      label={ind.name}
                      onClick={onLinkClick}
                    />
                  </li>
                ))}
          </ul>
        </nav>

        <nav aria-label="Modules">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
            Modules
          </p>
          <ul className="space-y-0.5">
            <li>
              <MegaTextLink href="/modules" label="All modules" onClick={onLinkClick} />
            </li>
            {moduleLinks.map((item) => (
              <li key={item.href}>
                <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Libraries">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.26em] text-blue-400/80">
            Libraries
          </p>
          <ul className="space-y-0.5">
            <li>
              <MegaTextLink href="/resources" label="All libraries" onClick={onLinkClick} />
            </li>
            {libraryLinks.map((item) => (
              <li key={item.href}>
                <MegaTextLink href={item.href} label={item.label} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </MegaPanelShell>
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
                  <DesktopNavTextLink href="/about" label="About" active={isAboutNavActive(pathname)} />
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
                  <DesktopNavTextLink
                    href="/web-dev"
                    label="Web Dev"
                    active={pathname === "/web-dev" || pathname.startsWith("/web-dev/")}
                  />
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
                <DesktopNavTextLink
                  href="/web-dev"
                  label="Web Dev"
                  active={pathname === "/web-dev" || pathname.startsWith("/web-dev/")}
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
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-white/20 bg-transparent px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition hover:border-white/40 hover:text-white"
                  >
                    <SearchGlyph />
                    <span>Search</span>
                  </button>
                ) : null}
                <DesktopContactCta />
              </div>

            <div className="ml-auto flex items-center gap-1.5 lg:hidden">
            {ott ? (
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-200"
              >
                <SearchGlyph />
                <span>Search</span>
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
                <MobileNavLink href="/about" label="About" pathname={pathname} onSamePathClose={closeIfSamePath} />
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
                <MobileNavLink href="/web-dev" label="Web Dev" pathname={pathname} onSamePathClose={closeIfSamePath} />
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
