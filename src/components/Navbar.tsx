"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLinkPendingSpinner } from "@/components/NavLinkWithPending";

const MODULES_CATEGORIES = [
  {
    label: "By discipline",
    items: [
      { href: "/modules?discipline=photography", label: "Photography" },
      { href: "/modules?discipline=video", label: "Video" },
      { href: "/modules?discipline=design", label: "Design" },
      { href: "/modules?discipline=motion", label: "Motion" },
      { href: "/modules?discipline=social", label: "Social" },
    ],
  },
  {
    label: "Playbooks",
    items: [
      { href: "/modules/product-shoot", label: "Product Shoot" },
      { href: "/modules/trailer-cut", label: "Trailer Cut" },
      { href: "/modules/poster-design", label: "Poster Design" },
    ],
  },
] as const;

type ModuleNavItem = { readonly href: string; readonly label: string };
const MODULES_DESTINATIONS: ModuleNavItem[] = MODULES_CATEGORIES.flatMap((c) => [...c.items]);

const MEDIA_CATEGORIES = [
  {
    label: "Gallery",
    items: [
      { href: "/images", label: "Images" },
      { href: "/films", label: "Films" },
    ],
  },
] as const;

type MediaItem = { readonly href: string; readonly label: string };
const MEDIA_DESTINATIONS: MediaItem[] = MEDIA_CATEGORIES.flatMap((c) => [...c.items]);

const PRIMARY_NAV_LINKS = [{ label: "Events", href: "/events" }] as const;

const AVATAR_DESTINATIONS = [
  { href: "/avatars/kaira", label: "Kaira" },
  { href: "/avatars/akriti", label: "Akriti" },
  { href: "/avatars/niharika", label: "Niharika" },
  { href: "/avatars/akanksha", label: "Akanksha" },
] as const;

const SOCIAL_DESTINATIONS = [
  {
    label: "Instagram",
    href: "/instagram",
    blurb: "Reels, stills, and behind the scenes from the studio.",
    icon: "instagram" as const,
  },
  {
    label: "YouTube",
    href: "/youtube",
    blurb: "Longer films, breakdowns, and channel first edits.",
    icon: "youtube" as const,
  },
] as const;

const AVATAR_NAV_ITEMS = [
  { href: "/avatars", label: "All Avatars" },
  { href: "/avatars/kaira", label: "Kaira" },
  { href: "/avatars/akriti", label: "Akriti" },
  { href: "/avatars/niharika", label: "Niharika" },
  { href: "/avatars/akanksha", label: "Akanksha" },
] as const;

const EXPLORE_DESTINATIONS = [
  { href: "/events", label: "Events" },
  ...AVATAR_NAV_ITEMS.map(({ href, label }) => ({ href, label })),
  ...SOCIAL_DESTINATIONS.map((s) => ({ href: s.href, label: s.label })),
] as const;

type NavIndustry = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
};

let navIndustriesCache: NavIndustry[] | null = null;
let navIndustriesInflight: Promise<NavIndustry[]> | null = null;

function fetchNavIndustries(): Promise<NavIndustry[]> {
  if (navIndustriesCache) return Promise.resolve(navIndustriesCache);
  if (!navIndustriesInflight) {
    navIndustriesInflight = fetch("/api/industries")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch failed"))))
      .then((data: { industries?: NavIndustry[] }) => {
        const list = (data.industries ?? []).map((ind) => ({
          slug: ind.slug,
          name: ind.name,
          tagline: ind.tagline ?? null,
          description: ind.description ?? null,
        }));
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

const INDUSTRY_NAV_COLUMN_LABELS = ["Property & commerce", "Commerce & tech", "Brands & services"] as const;

type IndustryNavColumn = {
  label: string;
  items: { href: string; label: string; slug: string }[];
};

function buildIndustryNavColumns(industries: NavIndustry[]): IndustryNavColumn[] {
  const columnCount = INDUSTRY_NAV_COLUMN_LABELS.length;
  const perCol = industries.length === 0 ? 0 : Math.ceil(industries.length / columnCount);
  return INDUSTRY_NAV_COLUMN_LABELS.map((label, i) => ({
    label,
    items: industries.slice(i * perCol, (i + 1) * perCol).map((ind) => ({
      href: `/industries/${ind.slug}`,
      label: ind.name,
      slug: ind.slug,
    })),
  }));
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

function DesktopContactCta() {
  return (
    <Link
      href="/contact"
      prefetch
      className="relative inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
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
        Book a free call
        <span className="ml-2">→</span>
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

function useSocialsMega(pathname: string) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    leaveTimerRef.current = setTimeout(() => setOpen(false), 220);
  }, [cancelClose]);

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

  return { open, setOpen, cancelClose, scheduleClose, openMenu, triggerRef, panelRef };
}

type DesktopMegaMenuId = "explore" | "industries" | "media" | "resources";

function isIndustriesNavActive(pathname: string) {
  return pathname.startsWith("/industries");
}

function isExploreNavActive(pathname: string) {
  return (
    pathname.startsWith("/events") ||
    pathname.startsWith("/avatars") ||
    pathname.startsWith("/instagram") ||
    pathname.startsWith("/youtube")
  );
}

function isMediaNavActive(pathname: string) {
  return pathname.startsWith("/images") || pathname.startsWith("/films");
}

function isResourcesNavActive(pathname: string) {
  return pathname.startsWith("/modules") || pathname.startsWith("/resources");
}

/** Shared mega-menu building blocks — YourAILens brand (blue / slate / white) */
function MegaPanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden border-b border-t border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(30,58,138,0.18)]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/90 via-white to-white"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_8%_0%,rgba(59,130,246,0.09),transparent_58%),radial-gradient(ellipse_65%_45%_at_92%_25%,rgba(34,211,238,0.07),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-7 lg:px-10">{children}</div>
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
      className="group flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-blue-200/90 bg-white/75 px-6 py-4 shadow-sm ring-1 ring-blue-100/80 backdrop-blur-sm transition-colors hover:border-blue-300 hover:bg-white hover:shadow-md hover:shadow-blue-100/40"
    >
      <div className="min-w-0 text-left">
        <p className="font-heading text-lg font-bold tracking-tight text-slate-900">{title}</p>
        {subtitle ? <p className="mt-0.5 text-[11px] font-medium text-slate-500">{subtitle}</p> : null}
      </div>
      <span className="shrink-0 rounded-full border-2 border-blue-300/70 bg-blue-50/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700 transition-colors group-hover:border-blue-400 group-hover:bg-blue-100/80">
        View all
      </span>
    </Link>
  );
}

function MegaColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 border-b border-slate-100 pb-3">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-slate-400">{children}</p>
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
      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 hover:border-blue-100 hover:bg-blue-50/70"
    >
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/80">
          {icon}
        </span>
      ) : null}
      <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue-700">{label}</span>
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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function NavModuleIcon({ href }: { href: string }) {
  const cls = "text-blue-600";
  const size = 16;
  if (href.includes("photography") || href.includes("product-shoot")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <path d="M4 8h4l2-3h4l2 3h4v11H4V8z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    );
  }
  if (href.includes("video") || href.includes("trailer")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    );
  }
  if (href.includes("design") || href.includes("poster")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cls}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AvatarNavChip({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  const monogram = label === "All Avatars" ? "All" : label.slice(0, 2);
  return (
    <Link href={href} prefetch onClick={onClick} className="group flex w-[80px] flex-col items-center gap-2">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 font-heading text-sm uppercase tracking-wide text-blue-700 shadow-sm shadow-blue-100/80 group-hover:border-blue-200 group-hover:bg-white">
        {monogram}
      </span>
      <span className="text-center text-[11px] font-semibold leading-tight text-slate-600 group-hover:text-blue-700">{label}</span>
    </Link>
  );
}

function SocialNavPill({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: "instagram" | "youtube";
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="group flex items-center gap-3 rounded-full border border-blue-100 bg-white px-5 py-2.5 shadow-sm shadow-blue-100/60 hover:border-blue-200 hover:bg-blue-50/70"
    >
      <SocialBrandIcon name={icon} />
      <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue-700">{label}</span>
    </Link>
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
      className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold ${
        active || open ? "text-blue-600" : "text-slate-800"
      }`}
    >
      {label}
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className={open ? "rotate-180" : ""}
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
    </button>
  );
}

function DesktopResourcesMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <MegaPanelShell>
      <div className="flex flex-col gap-6">
        <MegaHorizontalFeaturedLink
          href="/modules"
          title="All Modules"
          subtitle="Director playbooks — camera, light, workflow, prompts, assets"
          onClick={onLinkClick}
        />
        <div className="grid grid-cols-2 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100">
          {MODULES_CATEGORIES.map((cat) => (
            <nav key={cat.label} aria-label={cat.label} className="lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <MegaColumnHeading>{cat.label}</MegaColumnHeading>
              <div className="space-y-0.5">
                {cat.items.map((item) => (
                  <MegaNavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={<NavModuleIcon href={item.href} />}
                    onClick={onLinkClick}
                  />
                ))}
              </div>
            </nav>
          ))}
        </div>
      </div>
    </MegaPanelShell>
  );
}

function DesktopOriginalsMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  const items = MEDIA_CATEGORIES[0].items;
  return (
    <MegaPanelShell>
      <nav aria-label="Media" className="mx-auto max-w-lg">
        <MegaColumnHeading>Gallery</MegaColumnHeading>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <MegaNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<NavMediaIcon href={item.href} />}
              onClick={onLinkClick}
            />
          ))}
        </div>
      </nav>
    </MegaPanelShell>
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
  const columns = buildIndustryNavColumns(industries);

  return (
    <MegaPanelShell>
      <div className="flex flex-col gap-6">
        <MegaHorizontalFeaturedLink
          href="/industries"
          title="All Industries"
          subtitle="Browse every vertical in one place"
          onClick={onLinkClick}
        />
        {loading ? (
          <div className="grid grid-cols-3 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100">
            {Array.from({ length: 3 }).map((_, col) => (
              <div key={col} className="space-y-3 lg:px-6 first:lg:pl-0" aria-hidden>
                <div className="mb-4 h-3 w-24 rounded bg-blue-50" />
                {Array.from({ length: 4 }).map((__, row) => (
                  <div key={row} className="h-10 rounded-lg bg-slate-50" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100">
            {columns.map((col) => (
              <nav key={col.label} aria-label={col.label} className="lg:px-6 first:lg:pl-0 last:lg:pr-0">
                <MegaColumnHeading>{col.label}</MegaColumnHeading>
                <ul className="space-y-0.5">
                  {col.items.map((item) => (
                    <li key={item.href}>
                      <MegaNavItem
                        href={item.href}
                        label={item.label}
                        icon={<NavIndustryIcon slug={item.slug} />}
                        onClick={onLinkClick}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}
      </div>
    </MegaPanelShell>
  );
}

function DesktopExploreMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <MegaPanelShell>
      <div className="flex flex-col gap-6">
        <MegaHorizontalFeaturedLink
          href="/events"
          title="Events"
          subtitle="Workshops, launches, and studio gatherings"
          onClick={onLinkClick}
        />
        <div className="flex flex-col gap-8">
          <nav aria-label="Avatars">
            <MegaColumnHeading>Avatars</MegaColumnHeading>
            <div className="flex flex-wrap gap-3">
              {AVATAR_NAV_ITEMS.map((item) => (
                <AvatarNavChip key={item.href} href={item.href} label={item.label} onClick={onLinkClick} />
              ))}
            </div>
          </nav>
          <nav aria-label="Social">
            <MegaColumnHeading>Social</MegaColumnHeading>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_DESTINATIONS.map((item) => (
                <SocialNavPill key={item.href} href={item.href} label={item.label} icon={item.icon} onClick={onLinkClick} />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </MegaPanelShell>
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

  const exploreMega = useSocialsMega(pathname);
  const industriesMega = useSocialsMega(pathname);
  const originalsMega = useSocialsMega(pathname);
  const resourcesMega = useSocialsMega(pathname);

  const closeAll = useCallback(() => {
    exploreMega.setOpen(false);
    industriesMega.setOpen(false);
    originalsMega.setOpen(false);
    resourcesMega.setOpen(false);
  }, [exploreMega, industriesMega, originalsMega, resourcesMega]);

  const openExploreMenu = useCallback(() => {
    closeAll();
    exploreMega.openMenu();
  }, [closeAll, exploreMega]);

  const openIndustriesMenu = useCallback(() => {
    closeAll();
    industriesMega.openMenu();
  }, [closeAll, industriesMega]);

  const openOriginalsMenu = useCallback(() => {
    closeAll();
    originalsMega.openMenu();
  }, [closeAll, originalsMega]);

  const openResourcesMenu = useCallback(() => {
    closeAll();
    resourcesMega.openMenu();
  }, [closeAll, resourcesMega]);

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
        <nav className="relative overflow-visible bg-white">
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex h-20 items-center justify-between gap-8">
              <DesktopLogoLink />

              <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
                <div
                  key="nav-industries"
                  ref={industriesMega.triggerRef}
                  className="relative"
                  onMouseEnter={openIndustriesMenu}
                  onMouseLeave={industriesMega.scheduleClose}
                >
                  <DesktopMegaMenuTrigger
                    menuId="industries"
                    panelId="nav-industries-mega"
                    label="Industries"
                    open={industriesMega.open}
                    onToggle={() => industriesMega.setOpen((v) => !v)}
                    active={isIndustriesNavActive(pathname)}
                  />
                </div>
                <div
                  key="nav-media"
                  ref={originalsMega.triggerRef}
                  className="relative"
                  onMouseEnter={openOriginalsMenu}
                  onMouseLeave={originalsMega.scheduleClose}
                >
                  <DesktopMegaMenuTrigger
                    menuId="media"
                    panelId="nav-originals-mega"
                    label="Media"
                    open={originalsMega.open}
                    onToggle={() => originalsMega.setOpen((v) => !v)}
                    active={isMediaNavActive(pathname)}
                  />
                </div>
                <div
                  key="nav-explore"
                  ref={exploreMega.triggerRef}
                  className="relative"
                  onMouseEnter={openExploreMenu}
                  onMouseLeave={exploreMega.scheduleClose}
                >
                  <DesktopMegaMenuTrigger
                    menuId="explore"
                    panelId="nav-explore-mega"
                    label="Explore"
                    open={exploreMega.open}
                    onToggle={() => exploreMega.setOpen((v) => !v)}
                    active={isExploreNavActive(pathname)}
                  />
                </div>
                <div
                  key="nav-resources"
                  ref={resourcesMega.triggerRef}
                  className="relative"
                  onMouseEnter={openResourcesMenu}
                  onMouseLeave={resourcesMega.scheduleClose}
                >
                  <DesktopMegaMenuTrigger
                    menuId="resources"
                    panelId="nav-resources-mega"
                    label="Modules"
                    open={resourcesMega.open}
                    onToggle={() => resourcesMega.setOpen((v) => !v)}
                    active={isResourcesNavActive(pathname)}
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

          {/* Resources mega panel */}
          <div
            ref={resourcesMega.panelRef}
            id="nav-resources-mega"
            role="region"
            aria-labelledby="nav-resources-trigger"
            onMouseEnter={resourcesMega.cancelClose}
            onMouseLeave={resourcesMega.scheduleClose}
            aria-hidden={!resourcesMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 max-lg:hidden ${
              resourcesMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopResourcesMegaPanel onLinkClick={() => resourcesMega.setOpen(false)} />
          </div>

          {/* Media mega panel */}
          <div
            ref={originalsMega.panelRef}
            id="nav-originals-mega"
            role="region"
            aria-labelledby="nav-originals-trigger"
            onMouseEnter={originalsMega.cancelClose}
            onMouseLeave={originalsMega.scheduleClose}
            aria-hidden={!originalsMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 max-lg:hidden ${
              originalsMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopOriginalsMegaPanel onLinkClick={() => originalsMega.setOpen(false)} />
          </div>

          {/* Industries mega panel */}
          <div
            ref={industriesMega.panelRef}
            id="nav-industries-mega"
            role="region"
            aria-labelledby="nav-industries-trigger"
            onMouseEnter={industriesMega.cancelClose}
            onMouseLeave={industriesMega.scheduleClose}
            aria-hidden={!industriesMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 max-lg:hidden ${
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

          {/* Explore mega panel (trigger order: Media before Explore) */}
          <div
            ref={exploreMega.panelRef}
            id="nav-explore-mega"
            role="region"
            aria-labelledby="nav-explore-trigger"
            onMouseEnter={exploreMega.cancelClose}
            onMouseLeave={exploreMega.scheduleClose}
            aria-hidden={!exploreMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 max-lg:hidden ${
              exploreMega.open
                ? "pointer-events-auto visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            }`}
          >
            <DesktopExploreMegaPanel onLinkClick={() => exploreMega.setOpen(false)} />
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
                {/* Industries section */}
                <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Industries</p>
                <MobileNavLink
                  href="/industries"
                  label="✦ All Industries"
                  pathname={pathname}
                  onSamePathClose={closeIfSamePath}
                />
                {industriesLoading ? (
                  <p className="px-5 py-2 text-sm font-light text-white/50">Loading…</p>
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

                {/* Originals section */}
                <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Originals</p>
                {MEDIA_DESTINATIONS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                {/* Modules section */}
                <p className="mt-4 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Modules</p>
                <MobileNavLink href="/modules" label="✦ All Modules" pathname={pathname} onSamePathClose={closeIfSamePath} />
                {MODULES_DESTINATIONS.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                {/* Primary links: Events */}
                {PRIMARY_NAV_LINKS.map((link) => (
                  <MobileNavLink
                    key={link.label}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                <p className="mt-4 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Avatars</p>
                <MobileNavLink
                  href="/avatars"
                  label="All avatars"
                  pathname={pathname}
                  onSamePathClose={closeIfSamePath}
                />
                {AVATAR_DESTINATIONS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}
                <p className="mt-4 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Socials</p>
                {SOCIAL_DESTINATIONS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}
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
