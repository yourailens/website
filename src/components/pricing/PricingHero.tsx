"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import {
  INTENTS,
  STUDIO_PACKAGES,
  money,
  perSecond,
  type Currency,
  type GalleryItem,
  type IntentId,
  type PackageId,
  type StudioPackage,
} from "@/components/pricing/studioPackages";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";
const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;
const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

const ROTATES = ["rotate-[-1.5deg]", "rotate-[1deg]", "rotate-[-0.8deg]", "rotate-[1.5deg]", "rotate-[-1deg]", "rotate-[0.8deg]"] as const;

const INITIAL_CURRENCY: Record<PackageId, Currency> = {
  brand: "INR",
  speed: "INR",
  virality: "INR",
  campaign: "INR",
  custom: "INR",
};

function scrollToPackage(id: PackageId) {
  const node = document.getElementById(id === "custom" ? "custom" : `pkg-${id}`);
  node?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CurrencyToggle({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (next: Currency) => void;
}) {
  return (
    <div className="flex rounded-full border border-blue-200 bg-white p-0.5">
      {(["INR", "USD"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          aria-pressed={value === code}
          className={`min-w-[3.25rem] rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] transition ${
            value === code ? "bg-blue-600 text-white" : "text-slate-500 hover:text-blue-700"
          }`}
        >
          {code === "INR" ? "₹ INR" : "$ USD"}
        </button>
      ))}
    </div>
  );
}

function unitLines(pkg: StudioPackage, currency: Currency) {
  if (pkg.id === "brand" && pkg.priceInr) {
    return [
      ["The box", money(pkg.priceInr, currency)],
      ["Core", "Logo, color, type, merch, stills"],
      ["Motion idents", "10s intro and 10s outro"],
      ["Later in the box", "Theme song + music video"],
      ["Note rounds", "2, in the number"],
    ];
  }
  if (pkg.id === "speed" && pkg.priceInr) {
    return [
      ["The week", money(pkg.priceInr, currency)],
      ["If you want 10 videos", `${money(Math.round(pkg.priceInr / 10), currency)} each`],
      ["Each reel, working length", "20 seconds"],
      ["10 reels, 200 seconds", perSecond(pkg.priceInr, 200, currency) + " per second"],
      ["7 reels, 140 seconds", perSecond(pkg.priceInr, 140, currency) + " per second"],
      ["Stills in the week", "30 images (3 packs)"],
    ];
  }
  if (pkg.id === "virality") {
    return [
      ["Just the hook", "5 to 10 seconds"],
      ["Hook fare", money(3_000, currency)],
      ["~7 second hook", perSecond(3_000, 7, currency) + " per second"],
      ["Full film with hook", "40 to 45 seconds"],
      ["Film fare", money(10_000, currency)],
      ["~42 second film", perSecond(10_000, 42, currency) + " per second"],
    ];
  }
  if (pkg.id === "campaign" && pkg.priceInr) {
    return [
      ["The box", money(pkg.priceInr, currency)],
      ["Centrepiece", "5 minute AI film"],
      ["That film", "300 seconds"],
      ["Around it", "Avatar, posts, ads, YouTube, posters, merch, type"],
      ["Cost per second on the film alone", perSecond(pkg.priceInr, 300, currency)],
    ];
  }
  return [
    ["Billing", "Quoted"],
    ["Runtime", "Whatever the brief is"],
    ["Per second", "Written on the quote"],
  ];
}

function PackageGallery({ items, dense }: { items: GalleryItem[]; dense?: boolean }) {
  if (items.length === 0) return null;

  const labeled = items.some((item) => item.label);
  const videoOnly = items.every((item) => item.type === "video");
  const verticalOnly = videoOnly && items.every((item) => item.ratio === "vertical");
  const singleWide = items.length === 1 && (items[0]?.ratio === "wide" || (items[0]?.type === "video" && items[0]?.ratio !== "vertical"));

  return (
    <div
      className={`grid ${
        labeled
          ? "gap-5 sm:grid-cols-2"
          : verticalOnly
            ? "grid-cols-2 gap-2 overflow-hidden border border-blue-200 bg-slate-50 sm:grid-cols-4"
            : singleWide
              ? "gap-0 overflow-hidden border border-blue-200 bg-slate-50"
              : videoOnly
                ? "grid-cols-2 gap-1.5 overflow-hidden border border-blue-200 bg-slate-50"
                : dense
                  ? "grid-cols-2 gap-1.5 overflow-hidden border border-blue-200 bg-slate-50 sm:grid-cols-3"
                  : "grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden border border-blue-200 bg-slate-50"
      }`}
    >
      {items.map((item, index) => {
        const wide = item.ratio === "wide" || singleWide || (!labeled && !dense && !videoOnly && index === 0);
        return (
          <figure key={`${item.src}-${index}`} className={wide && labeled ? "sm:col-span-2" : undefined}>
            <div
              className={`relative overflow-hidden bg-slate-100 ${labeled ? "border border-blue-200" : ""} ${
                item.ratio === "vertical"
                  ? "aspect-[9/16]"
                  : item.ratio === "wide" || singleWide || (videoOnly && !labeled)
                    ? "aspect-video"
                    : wide
                      ? "min-h-[16rem] lg:min-h-[22rem]"
                      : labeled
                        ? "aspect-[4/5]"
                        : "aspect-square min-h-[7.5rem] sm:min-h-[9rem]"
              }`}
            >
              {item.type === "video" ? (
                <DeferredVideo
                  src={item.src}
                  poster={item.poster}
                  eager={index === 0}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    item.ratio === "vertical"
                      ? "(min-width: 640px) 22vw, 48vw"
                      : wide
                        ? "(min-width: 1024px) 80vw, 100vw"
                        : "(min-width: 1024px) 40vw, 50vw"
                  }
                  className="object-cover"
                />
              )}
            </div>
            {item.label ? (
              <figcaption className="mt-2 text-[10px] font-light uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

function PackagePrice({ pkg, currency }: { pkg: StudioPackage; currency: Currency }) {
  if (pkg.tiers?.length) {
    return (
      <div className="space-y-3 text-right">
        {pkg.tiers.map((tier) => (
          <div key={tier.name}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{tier.name}</p>
            <p className="mt-1 text-[clamp(1.4rem,3vw,2rem)] font-light leading-none text-blue-700">
              {money(tier.priceInr, currency)}
            </p>
            <p className="mt-1 text-[11px] font-light text-slate-400">{tier.runtime}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      <p className="text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-none text-blue-700">
        {pkg.priceInr ? money(pkg.priceInr, currency) : "Quote"}
      </p>
      <p className="max-w-xs text-right text-[11px] font-light text-slate-400">{pkg.priceNote}</p>
    </>
  );
}

function PackageSection({
  pkg,
  currency,
  onCurrency,
  active,
}: {
  pkg: StudioPackage;
  currency: Currency;
  onCurrency: (next: Currency) => void;
  active: boolean;
}) {
  const lines = unitLines(pkg, currency);
  return (
    <section
      id={pkg.id === "custom" ? "custom" : `pkg-${pkg.id}`}
      className={`scroll-mt-28 border-b border-blue-100/60 ${active ? "bg-blue-50/40" : pkg.no === "02" || pkg.no === "04" ? "home-section-tint" : "bg-white"}`}
    >
      <div className={`${PAGE} py-14 lg:py-20`}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">
              Package {pkg.no}
            </p>
            <h2 className="mt-2 text-[clamp(2rem,5vw,3.6rem)] font-light tracking-[-0.04em] text-slate-900">
              {pkg.name}
            </h2>
            <p className="mt-2 text-sm font-light text-slate-500">{pkg.billing}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <CurrencyToggle value={currency} onChange={onCurrency} />
            <PackagePrice pkg={pkg} currency={currency} />
          </div>
        </div>

        <div className="mb-8 overflow-hidden border-2 border-blue-700 bg-blue-600 text-white shadow-sm">
          <div className="relative px-5 py-5 sm:px-8 sm:py-6">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                  Delivery time
                </p>
                <p className="mt-2 text-[clamp(1.6rem,4vw,2.4rem)] font-light leading-none" style={HAND}>
                  {pkg.delivery}
                </p>
                {pkg.deliveryNote ? (
                  <p className="mt-2 text-sm font-light text-blue-100">{pkg.deliveryNote}</p>
                ) : null}
              </div>
              <p
                className="rotate-[2deg] border border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white"
                style={HAND}
              >
                On the clock
              </p>
            </div>
          </div>
        </div>

        <div className="border border-blue-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
          <p
            className="inline-block rotate-[-1.5deg] border border-blue-600 bg-white px-3 py-1 text-lg text-slate-900 shadow-sm"
            style={HAND}
          >
            What is in the box
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {pkg.get.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                <span className="text-blue-600" aria-hidden>
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-3xl text-sm font-light leading-relaxed text-slate-600">{pkg.runtime}</p>

        {pkg.gallery.length > 0 ? (
          <div className="mt-8">
            <PackageGallery
              items={pkg.gallery}
              dense={pkg.id === "brand" || pkg.id === "speed" || pkg.id === "campaign"}
            />
          </div>
        ) : null}

        {pkg.hook ? (
          <div className="mt-10 overflow-hidden border border-blue-200 bg-white">
            <div className="relative border-b border-blue-100 px-5 py-5 sm:px-8">
              <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
              <div className="relative flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">The attractive bit</p>
                  <p className="mt-2 text-2xl font-light text-slate-900" style={HAND}>
                    {pkg.hook.title}
                  </p>
                </div>
                {pkg.hook.youtubeId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${pkg.hook.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700"
                  >
                    Open on YouTube →
                  </a>
                ) : null}
              </div>
              <p className="relative mt-3 max-w-2xl text-sm font-light leading-relaxed text-slate-600">
                {pkg.hook.blurb}
              </p>
            </div>
            {pkg.hook.youtubeId ? (
              <div className="relative aspect-video bg-slate-900">
                <iframe
                  title={pkg.hook.title}
                  src={`https://www.youtube.com/embed/${pkg.hook.youtubeId}`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {pkg.tiers?.length ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {pkg.tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`border border-blue-200 bg-white p-5 shadow-sm ${
                  index === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                }`}
              >
                <p className="inline-block border border-blue-600 bg-white px-3 py-1 text-lg text-slate-900" style={HAND}>
                  {tier.name}
                </p>
                <p className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-light leading-none text-blue-700">
                  {money(tier.priceInr, currency)}
                </p>
                <p className="mt-2 text-sm font-light text-slate-500">{tier.runtime}</p>
                <p className="mt-3 text-[12px] font-light text-slate-400">
                  About {perSecond(tier.priceInr, tier.seconds, currency)} a second
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden border border-blue-200 bg-white">
          <div className="border-b border-blue-100 px-5 py-3 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {pkg.id === "brand" ? "What the number covers" : "What 1 film costs in this package"}
            </p>
          </div>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
            {lines.map(([k, v]) => (
              <div key={k} className="border-t border-blue-100 px-5 py-4 sm:px-6">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{k}</dt>
                <dd className="mt-1 text-sm font-light text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Who this is for</p>
            <ul className="mt-4 space-y-3">
              {pkg.who.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                  <span className="mt-0.5 text-blue-600" aria-hidden>
                    ▸
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              Will I be satisfied
            </p>
            <ul className="mt-4 space-y-3">
              {pkg.trust.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm font-light leading-relaxed text-slate-600">
                  <span className="mt-0.5 text-blue-600" aria-hidden>
                    ▸
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="border-2 border-blue-700 bg-blue-600 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-blue-700"
          >
            {pkg.id === "custom" ? "Talk to us" : `Book ${pkg.name}`}
          </Link>
          {pkg.id !== "custom" ? (
            <a
              href="#custom"
              className="border border-blue-300 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800 hover:border-blue-600"
            >
              Something else
            </a>
          ) : (
            <Link
              href="/contact"
              className="border border-blue-300 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800 hover:border-blue-600"
            >
              Email us
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function PricingHero() {
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [currencies, setCurrencies] = useState(INITIAL_CURRENCY);

  const target = useMemo(() => INTENTS.find((row) => row.id === intent)?.target ?? null, [intent]);

  function pick(id: IntentId) {
    setIntent(id);
    const row = INTENTS.find((item) => item.id === id);
    if (row) {
      window.requestAnimationFrame(() => scrollToPackage(row.target));
    }
  }

  function setCurrency(id: PackageId, next: Currency) {
    setCurrencies((current) => ({ ...current, [id]: next }));
  }

  return (
    <>
      <HomeBlueTint className="border-b border-blue-100/60">
        <div className={`${PAGE} py-10 lg:py-14`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">
            Production pricing
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h1 className="text-[clamp(2.8rem,8vw,5.6rem)] font-light leading-[0.92] tracking-[-0.045em] text-slate-900">
              5 packages.
            </h1>
            <a
              href="#alacarte"
              className="inline-flex rotate-[1.5deg] items-center gap-2 border-2 border-blue-700 bg-blue-600 px-5 py-3 text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
            >
              <span className="text-lg font-light" style={HAND}>
                A la carte
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                Build your own →
              </span>
            </a>
          </div>

          <div className="mt-8 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-600">
              What 1 film means
            </p>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-slate-600">
              A film here is a finished commercial you can run. Moving picture, sound, grade, licensed music. Not a raw
              generation. Not a storyboard.
            </p>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-slate-600">
              A standard film is 40 to 45 seconds. Brand Focus starts with logo, merch, and look, then a theme song.
              Speed uses short reels, 15 to 30 seconds. Virality is a 5 to 10 second hook, or a full 40 to 45 second
              film. Campaign includes a 5 minute AI film.
            </p>
          </div>

          <div className="mt-12 overflow-hidden border border-blue-200 bg-white">
            <div className="relative border-b border-blue-100 px-5 py-8 text-center sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">YAIL · Pick a lane</p>
                <h2
                  className="mt-3 text-[clamp(2.2rem,6vw,3.8rem)] font-light leading-none text-slate-900"
                  style={{ ...HAND, letterSpacing: "-0.03em" }}
                >
                  Why are you here?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-500">
                  Six sticky notes. One answer. We take you to the package.
                </p>
                <p
                  className="mt-4 inline-block rotate-[8deg] text-sm font-light text-blue-600"
                  style={HAND}
                  aria-hidden
                >
                  tap one →
                </p>
              </div>
            </div>

            <div
              role="radiogroup"
              aria-label="What are you looking for"
              className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3"
            >
              <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
              {INTENTS.map((row, index) => {
                const on = intent === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(row.id)}
                    className={`relative border p-5 text-left shadow-sm transition ${ROTATES[index]} ${
                      on
                        ? "border-2 border-blue-700 bg-blue-600 text-white hover:bg-blue-700"
                        : "border-blue-200 bg-white text-slate-700 hover:border-blue-600 hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`inline-block border px-3 py-1 text-lg ${
                        on ? "border-white/50 bg-white/10 text-white" : "border-blue-600 bg-white text-slate-900"
                      }`}
                      style={HAND}
                    >
                      {row.letter}
                    </span>
                    <p className={`mt-4 text-[15px] font-light leading-snug ${on ? "text-white" : "text-slate-900"}`}>
                      {row.label}
                    </p>
                    <p className={`mt-3 text-[12px] font-light ${on ? "text-blue-100" : "text-slate-500"}`}>
                      {row.note}
                    </p>
                    <p
                      className={`mt-5 text-sm ${on ? "text-white" : "text-blue-700"}`}
                      style={HAND}
                    >
                      → {row.lands}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            {STUDIO_PACKAGES.map((pkg, index) => (
              <span key={pkg.id} className="flex items-center gap-3">
                {index > 0 ? (
                  <span className="text-blue-300" aria-hidden>
                    ·
                  </span>
                ) : null}
                <a href={pkg.id === "custom" ? "#custom" : `#pkg-${pkg.id}`} className="hover:text-blue-900">
                  {pkg.name}
                </a>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <span className="text-blue-300" aria-hidden>
                ·
              </span>
              <a
                href="#alacarte"
                className="text-blue-800 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
              >
                A la carte
              </a>
            </span>
          </p>
        </div>
      </HomeBlueTint>

      {STUDIO_PACKAGES.map((pkg) => (
        <PackageSection
          key={pkg.id}
          pkg={pkg}
          currency={currencies[pkg.id]}
          onCurrency={(next) => setCurrency(pkg.id, next)}
          active={target === pkg.id}
        />
      ))}
    </>
  );
}
