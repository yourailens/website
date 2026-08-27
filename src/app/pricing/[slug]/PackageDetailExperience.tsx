"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import type { ServiceAddon, ServiceGalleryItem, ServiceWithGallery } from "@/data/services";
import { formatPriceFull, galleryItemUrl, serviceHeroMedia } from "@/data/services";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";
const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;
const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

function shortName(name: string) {
  if (/starter/i.test(name)) return "Starter";
  if (/growth/i.test(name)) return "Growth";
  if (/signature/i.test(name)) return "Signature";
  if (/product/i.test(name)) return "Product";
  if (/campaign/i.test(name)) return "Campaign";
  return name.split(" ")[0] ?? name;
}

/** Natural-ratio media block (never cropped) — used for gallery + content. */
function NaturalMedia({
  type,
  url,
  poster,
  className = "",
}: {
  type: "image" | "video";
  url: string;
  poster?: string | null;
  className?: string;
}) {
  if (type === "video") {
    return (
      <video
        src={url}
        poster={poster ?? undefined}
        muted
        playsInline
        loop
        autoPlay
        className={`block h-auto w-full bg-slate-100 ${className}`}
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt=""
      className={`block h-auto w-full bg-slate-100 ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}

type HeroMediaSrc = { type: "image" | "video"; url: string; poster?: string | null };

/**
 * Hero media renderer that never flashes a static cover first — shows an
 * animated skeleton shimmer until the video/image itself is actually ready.
 */
function HeroStage({
  src,
  alt,
  variant,
}: {
  src: HeroMediaSrc | null;
  alt: string;
  variant: "mobile" | "desktop";
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src?.url]);

  if (!src) {
    return variant === "mobile" ? (
      <div className="absolute inset-0 flex items-center justify-center bg-blue-50 text-sm font-light text-slate-400">
        Add hero media in admin
      </div>
    ) : (
      <div className="flex aspect-[16/9] items-center justify-center bg-blue-50 text-sm font-light text-slate-400">
        Add hero media in admin
      </div>
    );
  }

  const mediaClass =
    variant === "mobile"
      ? `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`
      : `block h-auto w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`;

  const media =
    src.type === "video" ? (
      <video
        src={src.url}
        muted
        playsInline
        loop
        autoPlay
        className={mediaClass}
        onLoadedData={() => setLoaded(true)}
        onContextMenu={(e) => e.preventDefault()}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src.url}
        alt={alt}
        className={mediaClass}
        onLoad={() => setLoaded(true)}
        decoding="async"
      />
    );

  if (variant === "mobile") {
    return (
      <>
        {media}
        {!loaded ? <div className="hero-film-skeleton absolute inset-0" aria-hidden /> : null}
      </>
    );
  }

  return (
    <div className={`relative w-full ${loaded ? "" : "aspect-[16/9]"}`}>
      {media}
      {!loaded ? <div className="hero-film-skeleton absolute inset-0" aria-hidden /> : null}
    </div>
  );
}

const SECTIONS = [
  { id: "gallery", label: "Work" },
  { id: "scope", label: "Inside" },
  { id: "details", label: "Details" },
  { id: "faq", label: "Questions" },
];

export default function PackageDetailExperience() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<ServiceWithGallery | null>(null);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/services/${slug}`);
        if (!res.ok) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        const d = (await res.json()) as { service: ServiceWithGallery; addons?: ServiceAddon[] };
        if (!cancelled) {
          setService(d.service);
          setAddons(d.addons ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selectedAddons = useMemo(
    () => addons.filter((a) => selected.has(a.slug)),
    [addons, selected]
  );
  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = service ? service.price + addonTotal : 0;
  const hero = service ? serviceHeroMedia(service) : null;
  const gallery = service?.gallery ?? [];
  const backHref = service?.category_slug === "visuals" ? "/pricing#stills" : "/pricing#films";

  const galleryMedia = useMemo(() => {
    return gallery
      .map((item) => {
        const url = galleryItemUrl(item);
        if (!url) return null;
        return { item, url };
      })
      .filter(Boolean) as { item: ServiceGalleryItem; url: string }[];
  }, [gallery]);

  const savings =
    service?.original_price && service.original_price > service.price
      ? service.original_price - service.price
      : 0;

  const toggleAddon = (addonSlug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(addonSlug)) next.delete(addonSlug);
      else next.add(addonSlug);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <span className="h-8 w-8 animate-spin border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <h1 className="text-2xl font-light text-slate-900">Box not found</h1>
          <Link href="/pricing" className="mt-6 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Back to the shop →
          </Link>
        </div>
      </>
    );
  }

  const mailHref = `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Enquiry: ${service.name}`
  )}&body=${encodeURIComponent(
    `Hi, I'm interested in ${service.name} (${formatPriceFull(total)}${
      selectedAddons.length ? ` including ${selectedAddons.map((a) => a.name).join(", ")}` : ""
    }).`
  )}`;

  const categoryLabel = service.category_slug === "visuals" ? "Stills" : "Films";
  const displayName = shortName(service.name);

  const heroSrc = hero
    ? { type: hero.type, url: hero.url, poster: hero.poster }
    : galleryMedia[0]
      ? {
          type: galleryMedia[0].item.media_type,
          url: galleryMedia[0].url,
          poster: galleryMedia[0].item.poster_url,
        }
      : null;
  const caption = [service.hero_label, service.hero_caption].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />

      {scrolled ? (
        <div className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur-md">
          <div className={`${PAGE} flex items-center justify-between gap-4 py-2.5`}>
            <div className="min-w-0 flex items-center gap-4">
              <p className="truncate text-sm font-light text-slate-900">{displayName}</p>
              <nav className="hidden items-center gap-5 md:flex">
                {SECTIONS.filter((s) => s.id !== "gallery" || galleryMedia.length > 0).map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 transition hover:text-blue-700"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
            <a
              href={mailHref}
              className="shrink-0 border-2 border-blue-700 bg-blue-600 px-4 py-1.5 text-[13px] font-light text-white"
              style={HAND}
            >
              Talk to us
            </a>
          </div>
        </div>
      ) : null}

      <HomeBlueTint className="border-b border-blue-100/60 py-10 lg:py-14">
        <div className={PAGE}>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
          >
            ← The shop
          </Link>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">
                {categoryLabel}
                {service.is_popular ? " · most booked" : ""}
              </p>
              <h1
                className="mt-3 text-[clamp(2.4rem,6vw,4.6rem)] font-light leading-[1.05] text-slate-900"
                style={{ letterSpacing: "-0.04em" }}
              >
                {displayName}
              </h1>
              <p className="mt-2 text-sm font-light text-slate-400">{service.name}</p>
              {service.tagline ? (
                <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-600">{service.tagline}</p>
              ) : null}
              <Link
                href="/pricing#how"
                className="mt-5 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
              >
                How this box runs →
              </Link>
            </div>

            <div className="relative overflow-hidden border border-blue-200 bg-white p-6">
              <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">This box</p>
                <p className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-none text-blue-700">
                  {formatPriceFull(service.price)}
                </p>
                {savings > 0 ? (
                  <p className="mt-1 text-sm font-light text-slate-400 line-through">
                    {formatPriceFull(service.original_price!)}
                  </p>
                ) : null}
                <p className="mt-1 text-[12px] font-light text-slate-400">{service.delivery_days} days</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={mailHref}
                    className="inline-block rotate-[-1.5deg] border-2 border-blue-700 bg-blue-600 px-5 py-2.5 text-lg font-light text-white shadow-sm"
                    style={HAND}
                  >
                    Talk to us
                  </a>
                  {galleryMedia.length > 0 ? (
                    <a
                      href="#gallery"
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
                    >
                      See work →
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </HomeBlueTint>

      <section className="border-b border-blue-100/60 bg-white py-8 lg:py-12">
        <div className={PAGE}>
          <div className="relative mt-2 sm:hidden">
            <div data-route-loader className="relative aspect-[3/4] overflow-hidden border border-blue-200 bg-slate-100">
              <HeroStage src={heroSrc} alt={service.name} variant="mobile" />
              {caption ? (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/90">{caption}</p>
                </div>
              ) : null}
            </div>
          </div>
          <div data-route-loader className="relative hidden overflow-hidden border border-blue-200 bg-slate-100 sm:block">
            <HeroStage src={heroSrc} alt={service.name} variant="desktop" />
            {caption ? (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/90">{caption}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={`${PAGE} pb-6 pt-12`}>
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            {service.description ? (
              <p className="max-w-2xl text-base font-light leading-relaxed text-slate-600">{service.description}</p>
            ) : null}

            {galleryMedia.length > 0 ? (
              <section id="gallery" data-route-loader className="scroll-mt-24 pt-14">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">From this box</p>
                    <h2
                      className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-light text-slate-900"
                      style={{ letterSpacing: "-0.04em" }}
                    >
                      Work
                    </h2>
                  </div>
                  <p className="font-mono text-[9px] tracking-[0.16em] text-slate-400">
                    {String(galleryMedia.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="columns-1 gap-3 sm:columns-2 sm:gap-4">
                  {galleryMedia.map(({ item, url }) => (
                    <figure key={item.id} className="mb-3 break-inside-avoid overflow-hidden border border-blue-200 bg-slate-50 sm:mb-4">
                      <NaturalMedia type={item.media_type} url={url} poster={item.poster_url} />
                      {item.caption?.trim() ? (
                        <figcaption className="border-t border-blue-100 px-4 py-2.5 text-sm font-light text-slate-500">
                          {item.caption.trim()}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {service.includes.length > 0 ? (
              <section id="scope" className="scroll-mt-24 pt-16">
                <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">What is in it</p>
                <h2
                  className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-light text-slate-900"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Inside
                </h2>
                <div className="mt-6 divide-y divide-blue-100 overflow-hidden border border-blue-200">
                  {service.includes.map((item, i) => (
                    <div
                      key={`${item.q}-${item.a}`}
                      className="grid gap-1.5 px-5 py-5 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-8 sm:px-6"
                    >
                      <p className="flex items-start gap-2.5 text-[15px] font-light text-slate-900">
                        <span className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-blue-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item.q}
                      </p>
                      <p className="pl-8 text-sm font-light leading-relaxed text-slate-600 sm:pl-0">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {(service.deliverables.length > 0 || service.best_for.length > 0) && (
              <section id="details" className="scroll-mt-24 grid gap-8 pt-16 sm:grid-cols-2">
                {service.deliverables.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-light text-slate-900">You get</h3>
                    <ul className="mt-4 space-y-2.5">
                      {service.deliverables.map((d) => (
                        <li key={d} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                          <span className="text-blue-600" aria-hidden>
                            ✓
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {service.best_for.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-light text-slate-900">Best for</h3>
                    <ul className="mt-4 space-y-2.5">
                      {service.best_for.map((tag) => (
                        <li key={tag} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                          <span className="text-blue-600" aria-hidden>
                            ✓
                          </span>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            )}

            {addons.length > 0 ? (
              <section className="pt-16">
                <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">Optional</p>
                <h2
                  className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-light text-slate-900"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Add ons
                </h2>
                <div className="mt-6 space-y-2.5">
                  {addons.map((addon) => {
                    const on = selected.has(addon.slug);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.slug)}
                        className={`flex w-full items-start gap-4 border px-4 py-3.5 text-left transition ${
                          on ? "border-blue-600 bg-blue-50/70" : "border-blue-200 bg-white hover:border-blue-400"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] ${
                            on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-light text-slate-900">{addon.name}</span>
                          {addon.description ? (
                            <span className="mt-0.5 block text-[13px] font-light text-slate-500">{addon.description}</span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-sm font-light text-blue-700">+{formatPriceFull(addon.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {service.faqs.length > 0 ? (
              <section id="faq" className="scroll-mt-24 pt-16">
                <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">Three more answers</p>
                <h2
                  className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-light text-slate-900"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Questions
                </h2>
                <div className="mt-6 divide-y divide-blue-100 overflow-hidden border border-blue-200">
                  {service.faqs.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <button
                        key={`${f.q}-${i}`}
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full px-5 py-4.5 text-left sm:px-6 sm:py-5"
                      >
                        <span className="flex items-start justify-between gap-4">
                          <span className="text-[15px] font-light text-slate-900">{f.q}</span>
                          <span
                            className={`mt-0.5 shrink-0 text-lg leading-none text-blue-500 transition-transform ${open ? "rotate-45" : ""}`}
                            aria-hidden
                          >
                            +
                          </span>
                        </span>
                        {open ? (
                          <span className="mt-2.5 block text-sm font-light leading-relaxed text-slate-500">{f.a}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="relative sticky top-20 overflow-hidden border border-blue-200 bg-white p-6">
              <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">Ready?</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-slate-500">
                  Tell us the brief. We confirm what is in the box.
                </p>

                {selectedAddons.length > 0 ? (
                  <div className="mt-4 space-y-1.5 border-t border-blue-100 pt-4">
                    {selectedAddons.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm font-light">
                        <span className="text-slate-600">{a.name}</span>
                        <span className="text-slate-900">+{formatPriceFull(a.price)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-blue-100 pt-2 text-sm font-light text-slate-900">
                      <span>Total</span>
                      <span className="text-blue-700">{formatPriceFull(total)}</span>
                    </div>
                  </div>
                ) : null}

                <a
                  href={mailHref}
                  className="mt-6 flex w-full items-center justify-center border-2 border-blue-700 bg-blue-600 px-5 py-3 text-lg font-light text-white"
                  style={HAND}
                >
                  Talk to us
                </a>
                <Link
                  href="/contact"
                  className="mt-3 flex w-full items-center justify-center border border-blue-200 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
                >
                  Book a free call
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <HomeBlueTint className="mt-8 border-t border-blue-100/60 py-14 lg:py-16">
        <div className={`${PAGE} text-center`}>
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">This box</p>
          <h2
            className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-light text-slate-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            {displayName}. {formatPriceFull(total)}.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Share the brief. We confirm scope, days, and next steps.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={mailHref}
              className="inline-block rotate-[-1.5deg] border-2 border-blue-700 bg-blue-600 px-6 py-3 text-lg font-light text-white shadow-sm"
              style={HAND}
            >
              Talk to us
            </a>
            <Link href="/pricing" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
              All boxes →
            </Link>
          </div>
        </div>
      </HomeBlueTint>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">{displayName}</p>
            <p className="text-lg font-light text-slate-900">{formatPriceFull(total)}</p>
          </div>
          <a
            href={mailHref}
            className="inline-flex shrink-0 border-2 border-blue-700 bg-blue-600 px-5 py-2 text-base font-light text-white"
            style={HAND}
          >
            Talk to us
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}
