"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { ServiceAddon, ServiceGalleryItem, ServiceWithGallery } from "@/data/services";
import {
  formatPriceFull,
  galleryItemUrl,
  serviceHeroMedia,
} from "@/data/services";

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
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-sm text-slate-400">
        Add hero media in admin
      </div>
    ) : (
      <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-sm text-slate-400">
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
  { id: "gallery", label: "Gallery" },
  { id: "scope", label: "What's included" },
  { id: "details", label: "Details" },
  { id: "faq", label: "FAQ" },
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
  const backHref =
    service?.category_slug === "visuals" ? "/pricing#stills" : "/pricing#films";

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
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-900">Package not found</h1>
          <Link href="/pricing" className="mt-6 inline-block text-sm font-semibold text-blue-600">
            Back to packages
          </Link>
        </div>
      </>
    );
  }

  const mailHref = `mailto:hello@yourailens.studio?subject=${encodeURIComponent(
    `Enquiry: ${service.name}`
  )}&body=${encodeURIComponent(
    `Hi, I'm interested in ${service.name} (${formatPriceFull(total)}${
      selectedAddons.length ? ` including ${selectedAddons.map((a) => a.name).join(", ")}` : ""
    }).`
  )}`;

  const categoryLabel = service.category_slug === "visuals" ? "Images & stills" : "Films & commercials";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white text-slate-900">
        {/* ── Sticky sub-nav (mounted only once scrolled, so it never reserves layout space) ── */}
        {scrolled ? (
          <div className="animate-fade-up sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
              <div className="min-w-0 flex items-center gap-3">
                <p className="truncate text-sm font-semibold text-slate-900">{service.name}</p>
                <nav className="hidden items-center gap-5 md:flex">
                  {SECTIONS.filter((s) => s.id !== "gallery" || galleryMedia.length > 0).map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="text-[13px] font-medium text-slate-500 transition hover:text-blue-700"
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={mailHref}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-[13px] font-bold text-white transition hover:bg-blue-700"
                >
                  Enquire
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Hero: video card, not a cropped background ────────── */}
        <section className="pt-4 sm:pt-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-700"
            >
              <span aria-hidden>←</span> Packages
            </Link>

            {(() => {
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
                <>
                  {/* Mobile: fixed 3:4 card, cropped to fit the format */}
                  <div
                    data-route-loader
                    className="relative mt-4 aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] sm:hidden"
                  >
                    <HeroStage src={heroSrc} alt={service.name} variant="mobile" />
                    {caption ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                          {caption}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Desktop / tablet: media at its own natural ratio, never cropped */}
                  <div
                    data-route-loader
                    className="relative mt-6 hidden overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] sm:block"
                  >
                    <HeroStage src={heroSrc} alt={service.name} variant="desktop" />
                    {caption ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                          {caption}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </>
              );
            })()}

            {/* Title + price sit below the card, media stays the focus */}
            <div className="mt-6 flex flex-col gap-6 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600">
                  {categoryLabel}
                  {service.badge_label ? ` · ${service.badge_label}` : ""}
                </p>
                <h1 className="mt-2 font-heading text-[clamp(1.8rem,4.5vw,2.75rem)] font-black leading-[1.08] tracking-tight text-slate-900">
                  {service.name}
                </h1>
                {service.tagline ? (
                  <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-slate-600 sm:text-base">
                    {service.tagline}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                <div className="flex items-baseline gap-2 sm:justify-end">
                  <p className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">
                    {formatPriceFull(service.price)}
                  </p>
                  {savings > 0 ? (
                    <span className="text-sm font-medium text-slate-400 line-through">
                      {formatPriceFull(service.original_price!)}
                    </span>
                  ) : null}
                  <span className="text-sm font-light text-slate-500">
                    · {service.delivery_days} day{service.delivery_days === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={mailHref}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
                  >
                    Enquire now
                  </a>
                  {galleryMedia.length > 0 ? (
                    <a
                      href="#gallery"
                      className="hidden h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                    >
                      See work
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body: content + sticky pricing sidebar ────────────── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 pt-12 pb-6 lg:grid-cols-[1fr_320px] lg:gap-16">
            <div className="min-w-0">
              {service.description ? (
                <p className="max-w-2xl text-lg font-light leading-relaxed text-slate-600">
                  {service.description}
                </p>
              ) : null}

              {/* Gallery */}
              {galleryMedia.length > 0 ? (
                <section id="gallery" data-route-loader className="scroll-mt-24 pt-14">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Gallery
                    </h2>
                    <p className="text-sm font-medium text-slate-400">
                      {galleryMedia.length} sample{galleryMedia.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="columns-1 gap-3 sm:columns-2 sm:gap-4">
                    {galleryMedia.map(({ item, url }) => (
                      <figure
                        key={item.id}
                        className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm sm:mb-4"
                      >
                        <NaturalMedia type={item.media_type} url={url} poster={item.poster_url} />
                        {item.caption?.trim() ? (
                          <figcaption className="border-t border-slate-100 px-4 py-2.5 text-sm font-light text-slate-500">
                            {item.caption.trim()}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Scope */}
              {service.includes.length > 0 ? (
                <section id="scope" className="scroll-mt-24 pt-16">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    What&apos;s included
                  </h2>
                  <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                    {service.includes.map((item, i) => (
                      <div
                        key={`${item.q}-${item.a}`}
                        className="grid gap-1.5 px-5 py-5 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-8 sm:px-6"
                      >
                        <p className="flex items-start gap-2.5 text-[15px] font-semibold text-slate-900">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 font-mono text-[10px] font-bold text-blue-600">
                            {i + 1}
                          </span>
                          {item.q}
                        </p>
                        <p className="pl-7 text-sm font-light leading-relaxed text-slate-600 sm:pl-0">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Details: deliverables + best for */}
              {(service.deliverables.length > 0 || service.best_for.length > 0) && (
                <section id="details" className="scroll-mt-24 grid gap-8 pt-16 sm:grid-cols-2">
                  {service.deliverables.length > 0 ? (
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900">Deliverables</h3>
                      <ul className="mt-4 space-y-2.5">
                        {service.deliverables.map((d) => (
                          <li key={d} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {service.best_for.length > 0 ? (
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900">Best for</h3>
                      <ul className="mt-4 space-y-2.5">
                        {service.best_for.map((tag) => (
                          <li key={tag} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              )}

              {/* Add ons */}
              {addons.length > 0 ? (
                <section className="pt-16">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
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
                          className={`flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
                            on
                              ? "border-blue-500 bg-blue-50/70"
                              : "border-slate-200 bg-white hover:border-blue-200"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                              on
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900">{addon.name}</span>
                            {addon.description ? (
                              <span className="mt-0.5 block text-[13px] font-light text-slate-500">
                                {addon.description}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-sm font-bold text-slate-900">
                            +{formatPriceFull(addon.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* FAQ */}
              {service.faqs.length > 0 ? (
                <section id="faq" className="scroll-mt-24 pt-16">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Questions
                  </h2>
                  <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
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
                            <span className="text-[15px] font-semibold text-slate-900">{f.q}</span>
                            <span
                              className={`mt-0.5 shrink-0 text-lg leading-none text-blue-500 transition-transform ${open ? "rotate-45" : ""}`}
                              aria-hidden
                            >
                              +
                            </span>
                          </span>
                          {open ? (
                            <span className="mt-2.5 block text-sm font-light leading-relaxed text-slate-500">
                              {f.a}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>

            {/* Sticky action panel (desktop) — no repeat of the hero's price/name */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)]">
                <p className="font-heading text-lg font-bold text-slate-900">Ready to book?</p>
                <p className="mt-1 text-sm font-light leading-relaxed text-slate-500">
                  Reach out and we&apos;ll confirm scope, timeline, and next steps.
                </p>

                {selectedAddons.length > 0 ? (
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                    {selectedAddons.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{a.name}</span>
                        <span className="font-medium text-slate-900">+{formatPriceFull(a.price)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatPriceFull(total)}</span>
                    </div>
                  </div>
                ) : null}

                <a
                  href={mailHref}
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
                >
                  Enquire · {formatPriceFull(total)}
                </a>
                <Link
                  href="/contact"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Book a free call
                </Link>
              </div>
            </aside>
          </div>
        </div>

        {/* Final CTA band */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-2xl px-5 py-12 text-center sm:py-14">
            <h2 className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Ready to start with {service.name}?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-slate-600 sm:text-base">
              Share your brief and we will confirm scope, timeline, and next steps within a day.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={mailHref}
                className="inline-flex min-h-[48px] min-w-[180px] items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
              >
                Enquire · {formatPriceFull(total)}
              </a>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] min-w-[180px] items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                All packages
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile sticky CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-500">{service.name}</p>
              <p className="font-heading text-lg font-black text-slate-900">
                {formatPriceFull(total)}
              </p>
            </div>
            <a
              href={mailHref}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            >
              Enquire
            </a>
          </div>
        </div>
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
    </>
  );
}
