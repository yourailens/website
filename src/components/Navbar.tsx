"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLinkPendingSpinner } from "@/components/NavLinkWithPending";


const PRIMARY_NAV_LINKS = [
  { label: "Events", href: "/events" },
] as const;

const RESOURCES_CATEGORIES = [
  {
    label: "Characters & Style",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    border: "border-violet-100",
    items: [
      { href: "/character-sheets", label: "Character Sheets",     blurb: "Diverse characters by ethnicity, age & archetype." },
      { href: "/outfits",          label: "Outfit Sheets",        blurb: "Style references for every character and era." },
      { href: "/props",            label: "Props Library",        blurb: "Objects, accessories & handheld items." },
    ],
  },
  {
    label: "Scenes & World",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-100",
    items: [
      { href: "/scenarios",    label: "Reference Scenarios", blurb: "Scene setups — portraits, action, romance." },
      { href: "/locations",    label: "Locations",           blurb: "Backgrounds from forests to sci-fi cities." },
      { href: "/mood-boards",  label: "Mood Boards",         blurb: "Aesthetic direction: Y2K, Cyberpunk, Academia." },
    ],
  },
  {
    label: "Production",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    border: "border-blue-100",
    items: [
      { href: "/prompts",           label: "Workflows",              blurb: "Step-by-step AI prompt engineering guides." },
      { href: "/lighting-presets",  label: "Lighting Presets",       blurb: "Golden hour, neon, studio and cinematic setups." },
      { href: "/color-grades",      label: "Color Grading Presets",  blurb: "LUT-style visual references for AI video." },
    ],
  },
] as const;

type ResourceItem = { readonly href: string; readonly label: string; readonly blurb: string };
const RESOURCES_DESTINATIONS: ResourceItem[] = RESOURCES_CATEGORIES.flatMap((c) => [...c.items]);

const ORIGINALS_DESTINATIONS = [
  { href: "/images", label: "Images", blurb: "AI-generated still images from every campaign." },
  { href: "/films", label: "Films", blurb: "Short-form AI video originals from the studio." },
] as const;

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

function DesktopNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch
      className="group relative rounded-lg px-5 py-2 text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600"
    >
      <DesktopNavLinkInner label={label} />
    </Link>
  );
}

function DesktopNavLinkInner({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? (
        <span className="absolute inset-0 z-[1] cursor-wait rounded-lg" aria-hidden />
      ) : null}
      <span className="relative z-[2] inline-flex items-center gap-2">
        <NavLinkPendingSpinner borderClassName="border-blue-600" />
        {label}
      </span>
      <span className="absolute inset-x-4 bottom-1 z-[2] h-[2px] origin-left scale-x-0 rounded-full bg-blue-500 transition-transform duration-200 group-hover:scale-x-100" />
    </>
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

function SocialBrandIcon({ name }: { name: "instagram" | "youtube" }) {
  if (name === "instagram") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-blue-700" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-blue-700" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
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

function useAvatarsMega(pathname: string) {
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

function DesktopSocialsTrigger({
  open,
  onToggle,
  pathname,
}: {
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const socialActive = pathname.startsWith("/instagram") || pathname.startsWith("/youtube");
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls="nav-socials-mega"
      id="nav-socials-trigger"
      onClick={onToggle}
      className={`group relative flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
        socialActive || open ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
      }`}
    >
      <span className="relative z-[2]">Socials</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
      <span
        className={`absolute inset-x-3 bottom-1 z-[2] h-[2px] origin-left rounded-full bg-blue-500 transition-transform duration-200 ${
          socialActive || open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}

function DesktopAvatarsTrigger({
  open,
  onToggle,
  pathname,
}: {
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const active = pathname.startsWith("/avatars");
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls="nav-avatars-mega"
      id="nav-avatars-trigger"
      onClick={onToggle}
      className={`group relative flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
        active || open ? "text-violet-700" : "text-slate-800 hover:text-violet-700"
      }`}
    >
      <span className="relative z-[2]">Avatars</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
      <span
        className={`absolute inset-x-3 bottom-1 z-[2] h-[2px] origin-left rounded-full bg-violet-500 transition-transform duration-200 ${
          active || open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}

function DesktopAvatarsMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-t-none rounded-b-2xl border-x-0 border-b border-t border-slate-200 bg-white shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]">
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-md shrink-0 lg:w-[30%] lg:border-r lg:border-slate-200 lg:pr-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-violet-600">Avatars</p>
            <p className="mt-3 font-heading text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Characters behind the lens.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Meet the four voices that shape how we think about story, craft, and brand.
            </p>
            <Link
              href="/avatars"
              prefetch
              onClick={onLinkClick}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
            >
              All avatars
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
            {AVATAR_DESTINATIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={onLinkClick}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <span className="font-heading text-lg font-black text-slate-900">{item.label}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-violet-600">
                  Profile
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopOriginalsTrigger({
  open,
  onToggle,
  pathname,
}: {
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const active = pathname.startsWith("/images") || pathname.startsWith("/films");
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls="nav-originals-mega"
      id="nav-originals-trigger"
      onClick={onToggle}
      className={`group relative flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
        active || open ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
      }`}
    >
      <span className="relative z-[2]">Originals</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
      <span
        className={`absolute inset-x-3 bottom-1 z-[2] h-[2px] origin-left rounded-full bg-blue-500 transition-transform duration-200 ${
          active || open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}

function DesktopResourcesTrigger({
  open,
  onToggle,
  pathname,
}: {
  open: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const active = ["/resources","/prompts","/outfits","/character-sheets","/scenarios","/locations","/props","/lighting-presets","/color-grades","/mood-boards"].some((p) => pathname.startsWith(p));
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls="nav-resources-mega"
      id="nav-resources-trigger"
      onClick={onToggle}
      className={`group relative flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
        active || open ? "text-blue-600" : "text-slate-800 hover:text-blue-600"
      }`}
    >
      <span className="relative z-[2]">Resources</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
      <span
        className={`absolute inset-x-3 bottom-1 z-[2] h-[2px] origin-left rounded-full bg-blue-500 transition-transform duration-200 ${
          active || open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </button>
  );
}

// Tiny icon for each resource type
function ResourceIcon({ href }: { href: string }) {
  if (href === "/prompts") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
  if (href === "/outfits") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  );
  if (href === "/character-sheets") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="7" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
  if (href === "/scenarios") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="9" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="8" r="3"/><path d="M21 20v-2a3 3 0 0 0-2-2.83"/>
    </svg>
  );
  if (href === "/locations") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  if (href === "/props") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
  if (href === "/lighting-presets") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
  if (href === "/color-grades") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/>
    </svg>
  );
  // mood-boards
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function DesktopResourcesMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-b-2xl border-x-0 border-b border-t border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(30,58,138,0.18)]">
      {/* subtle background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23475569' stroke-opacity='1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E\")" }} aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 py-7 lg:px-10">
        {/* "All resources" shortcut */}
        <Link href="/resources" onClick={onLinkClick} className="group mb-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 shadow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">All Resources</p>
            <p className="text-[10px] text-slate-400">9 libraries · one page</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </Link>

        {/* Category columns */}
        <div className="grid grid-cols-3 gap-6 lg:gap-8">
          {RESOURCES_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              {/* Category header */}
              <div className="mb-3 flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${cat.color}`} />
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-slate-400">{cat.label}</p>
              </div>
              {/* Items */}
              <div className="space-y-1.5">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={onLinkClick}
                    className={`group flex items-center gap-3 rounded-xl border ${cat.border} ${cat.bgLight} px-4 py-3 transition-all duration-200 hover:border-opacity-80 hover:shadow-md hover:shadow-slate-900/6 hover:-translate-y-0.5 hover:bg-white`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} text-white shadow-sm`}>
                      <ResourceIcon href={item.href} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-800 group-hover:text-slate-900">{item.label}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-slate-400 group-hover:text-slate-500">{item.blurb}</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400">9 reference libraries · growing weekly</p>
          <Link href="/resources" onClick={onLinkClick} className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline">
            Browse all resources <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopOriginalsMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-t-none rounded-b-2xl border-x-0 border-b border-t border-slate-200 bg-white shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]">
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-md shrink-0 lg:w-[30%] lg:border-r lg:border-slate-200 lg:pr-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-blue-600">Originals</p>
            <p className="mt-3 font-heading text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              AI-first visual originals.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Every image and film is built from a prompt — not a camera. Browse the full gallery.
            </p>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:gap-4">
            {ORIGINALS_DESTINATIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={onLinkClick}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="font-heading text-lg font-black text-slate-900">{item.label}</span>
                <span className="mt-2 text-sm leading-relaxed text-slate-500">{item.blurb}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                  Browse
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSocialsMegaPanel({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-t-none rounded-b-2xl border-x-0 border-b border-t border-blue-100/90 bg-gradient-to-b from-white via-slate-50 to-blue-50 shadow-[0_24px_48px_-12px_rgba(30,58,138,0.18)]">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%2393c5fd' stroke-opacity='0.18'%3E%3Cpath d='M0 40h80M40 0v80'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12">
          <div className="max-w-md shrink-0 lg:w-[32%] lg:border-r lg:border-blue-100/90 lg:pr-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-blue-600">Socials</p>
            <p className="mt-3 font-heading text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Where the work
              <span className="block bg-gradient-to-r from-blue-800 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                lives in public.
              </span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Clips, films, and experiments from YourAILens. Pick a channel and dive in.
            </p>
            <div className="mt-6 hidden h-px w-full bg-gradient-to-r from-blue-200/80 via-transparent to-sky-200/60 sm:block lg:hidden" />
          </div>

          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            {SOCIAL_DESTINATIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={onLinkClick}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-blue-100/90 bg-white/90 p-5 shadow-sm shadow-blue-950/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-900/10"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 opacity-90 transition-opacity group-hover:opacity-100" aria-hidden />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100/90 bg-gradient-to-br from-slate-50 to-blue-100/90 text-blue-700 shadow-inner shadow-white/80">
                    <SocialBrandIcon name={item.icon} />
                  </div>
                  <span className="rounded-full border border-blue-100/90 bg-blue-50/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700/80 transition-colors group-hover:border-blue-200 group-hover:bg-blue-100/80">
                    Open
                  </span>
                </div>
                <h3 className="relative mt-5 font-heading text-lg font-black text-slate-900">{item.label}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{item.blurb}</p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                  Visit
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
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

  const socialsMega = useSocialsMega(pathname);
  const avatarsMega = useAvatarsMega(pathname);
  const originalsMega = useSocialsMega(pathname);
  const resourcesMega = useSocialsMega(pathname);

  const closeAll = useCallback(() => {
    socialsMega.setOpen(false);
    avatarsMega.setOpen(false);
    originalsMega.setOpen(false);
    resourcesMega.setOpen(false);
  }, [socialsMega, avatarsMega, originalsMega, resourcesMega]);

  const openSocialsMenu = useCallback(() => {
    closeAll();
    socialsMega.openMenu();
  }, [closeAll, socialsMega]);

  const openAvatarsMenu = useCallback(() => {
    closeAll();
    avatarsMega.openMenu();
  }, [closeAll, avatarsMega]);

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
                  ref={originalsMega.triggerRef}
                  className="relative"
                  onMouseEnter={openOriginalsMenu}
                  onMouseLeave={originalsMega.scheduleClose}
                >
                  <DesktopOriginalsTrigger
                    open={originalsMega.open}
                    onToggle={() => originalsMega.setOpen((v) => !v)}
                    pathname={pathname}
                  />
              </div>
                <div
                  ref={resourcesMega.triggerRef}
                  className="relative"
                  onMouseEnter={openResourcesMenu}
                  onMouseLeave={resourcesMega.scheduleClose}
                >
                  <DesktopResourcesTrigger
                    open={resourcesMega.open}
                    onToggle={() => resourcesMega.setOpen((v) => !v)}
                    pathname={pathname}
                  />
              </div>
                {PRIMARY_NAV_LINKS.map((link) => (
                  <DesktopNavLink key={link.label} href={link.href} label={link.label} />
                ))}
                <div
                  ref={avatarsMega.triggerRef}
                  className="relative"
                  onMouseEnter={openAvatarsMenu}
                  onMouseLeave={avatarsMega.scheduleClose}
                >
                  <DesktopAvatarsTrigger
                    open={avatarsMega.open}
                    onToggle={() => avatarsMega.setOpen((v) => !v)}
                    pathname={pathname}
                  />
                </div>
                <div
                  ref={socialsMega.triggerRef}
                  className="relative"
                  onMouseEnter={openSocialsMenu}
                  onMouseLeave={socialsMega.scheduleClose}
                >
                  <DesktopSocialsTrigger
                    open={socialsMega.open}
                    onToggle={() => socialsMega.setOpen((v) => !v)}
                    pathname={pathname}
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
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-all duration-200 ease-out max-lg:hidden ${
              resourcesMega.open
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0"
            }`}
          >
            <DesktopResourcesMegaPanel onLinkClick={() => resourcesMega.setOpen(false)} />
          </div>

          {/* Originals mega panel */}
          <div
            ref={originalsMega.panelRef}
            id="nav-originals-mega"
            role="region"
            aria-labelledby="nav-originals-trigger"
            onMouseEnter={originalsMega.cancelClose}
            onMouseLeave={originalsMega.scheduleClose}
            aria-hidden={!originalsMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-all duration-200 ease-out max-lg:hidden ${
              originalsMega.open
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0"
            }`}
          >
            <DesktopOriginalsMegaPanel onLinkClick={() => originalsMega.setOpen(false)} />
          </div>

          {/* Full viewport width, flush under the white bar (top-full = bottom of nav; no pt gap) */}
          <div
            ref={avatarsMega.panelRef}
            id="nav-avatars-mega"
            role="region"
            aria-labelledby="nav-avatars-trigger"
            onMouseEnter={avatarsMega.cancelClose}
            onMouseLeave={avatarsMega.scheduleClose}
            aria-hidden={!avatarsMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-all duration-200 ease-out max-lg:hidden ${
              avatarsMega.open
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0"
            }`}
          >
            <DesktopAvatarsMegaPanel onLinkClick={() => avatarsMega.setOpen(false)} />
          </div>
          <div
            ref={socialsMega.panelRef}
            id="nav-socials-mega"
            role="region"
            aria-labelledby="nav-socials-trigger"
            onMouseEnter={socialsMega.cancelClose}
            onMouseLeave={socialsMega.scheduleClose}
            aria-hidden={!socialsMega.open}
            className={`absolute left-0 right-0 top-full z-[80] w-full min-w-0 transition-all duration-200 ease-out max-lg:hidden ${
              socialsMega.open
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-1 opacity-0"
            }`}
          >
            <DesktopSocialsMegaPanel onLinkClick={() => socialsMega.setOpen(false)} />
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
                {/* Originals section */}
                <p className="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Originals</p>
                {ORIGINALS_DESTINATIONS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onSamePathClose={closeIfSamePath}
                  />
                ))}

                {/* Resources section */}
                <p className="mt-4 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Resources</p>
                <MobileNavLink href="/resources" label="✦ All Resources" pathname={pathname} onSamePathClose={closeIfSamePath} />
                {RESOURCES_DESTINATIONS.map((item) => (
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
