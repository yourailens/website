"use client";

import Link from "next/link";

export type VaultTeasePreview = {
  id: string;
  title: string;
  /** Poster or media URL. */
  src: string;
  /** Image poster when available — preferred over video src for <img>. */
  poster?: string | null;
  isVideo?: boolean;
  /** Pixel aspect ratio (w/h). Used for cut rows; ignored for avatar cards. */
  ratio?: number | null;
};

type Props = {
  filmmaking: VaultTeasePreview[];
  ads: VaultTeasePreview[];
  cutCount?: number;
};

const ROW_SIZE = 6;

/** Cut row — top N uniques, ticker needs one seamless copy for -50% scroll. */
function CutRow({
  items,
  reverse = false,
  shift = "0",
}: {
  items: VaultTeasePreview[];
  reverse?: boolean;
  shift?: string;
}) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden" style={{ paddingLeft: shift }} aria-hidden>
      <div
        className={`flex w-max items-center gap-3 sm:gap-3.5 ${
          reverse ? "animate-vault-ticker-reverse" : "animate-vault-ticker"
        }`}
      >
        {loop.map((item, i) => {
          const ratio =
            item.ratio && item.ratio > 0.2 && item.ratio < 6 ? item.ratio : 16 / 9;
          return (
            <div
              key={`${item.id}-${i}`}
              className="relative h-[7.5rem] shrink-0 overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 sm:h-[9.5rem] lg:h-[11rem]"
              style={{ aspectRatio: String(ratio) }}
            >
              {item.poster || !item.isVideo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.poster || item.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.src}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Homepage YAIL Vault tease — Artfolio-style multi-row thumbnail wall. */
export default function HomeVaultTease({
  filmmaking,
  ads,
  cutCount,
}: Props) {
  const rowFilm = filmmaking.slice(0, ROW_SIZE);
  const rowAds = ads.slice(0, ROW_SIZE);

  if (!rowFilm.length && !rowAds.length) {
    return (
      <section id="vault" aria-label="YAIL Vault" className="bg-black px-5 py-16 sm:px-8 lg:px-16 xl:pl-52">
        <p className="font-mono text-[10px] tracking-[0.32em] text-sky-400/90">SC. 3.5 · YAIL VAULT</p>
        <h2 className="mt-4 font-heading text-5xl tracking-tight">Vault</h2>
        <Link href="/vault" className="mt-6 inline-flex text-sm font-semibold text-sky-300">
          Enter the vault →
        </Link>
      </section>
    );
  }

  return (
    <section
      id="vault"
      aria-label="YAIL Vault"
      className="relative isolate overflow-x-hidden bg-black py-14 sm:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-[30%] h-64 w-64 rounded-full bg-sky-400/10 blur-[80px]"
      />

      <div className="relative z-[2] px-5 text-center sm:px-8 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-sky-400/90">SC. 3.5 · YAIL VAULT</p>
        <h2 className="mx-auto mt-5 max-w-4xl font-body text-[clamp(1.85rem,4.6vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-white">
          We keep{" "}
          <span className="font-heading text-[1.08em] font-normal italic tracking-[0.04em] text-sky-200">
            the best experiments
          </span>{" "}
          in the vault.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-white/50">
          Filmmaking labs and ad tests.{" "}
          {cutCount ? `${cutCount} cuts live now.` : "The reel behind the reel."}
        </p>
      </div>

      <div className="vault-thumb-wall relative z-[1] mt-10 sm:mt-12">
        <div className="vault-thumb-wall__stage space-y-3 sm:space-y-3.5">
          <CutRow items={rowFilm} />
          <CutRow items={rowAds} reverse shift="2.5rem" />
        </div>
        <div aria-hidden className="vault-thumb-wall__fade" />
      </div>

      <div className="relative z-[2] mx-auto mt-12 flex max-w-5xl flex-col items-center gap-8 px-5 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
        <div
          aria-hidden
          className="relative hidden h-28 w-28 shrink-0 items-center justify-center sm:flex"
        >
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-2 rounded-full border border-dashed border-white/15" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_yail.png" alt="" className="relative h-10 w-auto opacity-80" />
        </div>

        <div className="text-center sm:flex-1 sm:text-right">
          <p className="font-body text-[clamp(1.6rem,3.5vw,2.6rem)] font-semibold leading-[1.1] tracking-tight">
            Let’s start.{" "}
            <Link
              href="/vault"
              prefetch
              className="group relative inline-flex items-baseline gap-2 rounded-md px-2 py-0.5 font-heading text-[1.05em] font-normal italic tracking-[0.04em] text-emerald-300/95 transition hover:bg-emerald-300/10 hover:text-emerald-200"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-1 -bottom-0.5 h-px origin-left scale-x-100 bg-emerald-300/70 transition duration-300 group-hover:scale-x-110 group-hover:bg-emerald-200"
              />
              Enter the Vault
              <span
                aria-hidden
                className="relative ml-0.5 inline-flex h-[0.95em] w-[1.35em] translate-y-[0.12em] items-center not-italic"
              >
                {/* Stem grows on hover */}
                <span className="absolute left-0 top-1/2 h-[1.5px] w-[0.45em] -translate-y-1/2 origin-left rounded-full bg-emerald-300/80 transition duration-300 group-hover:w-[0.75em] group-hover:bg-emerald-200" />
                {/* Chevron tip */}
                <svg
                  viewBox="0 0 18 18"
                  className="absolute right-0 top-1/2 h-[0.72em] w-[0.72em] -translate-y-1/2 text-emerald-300/95 transition duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-200"
                  fill="none"
                >
                  <path
                    d="M6 3.5L12.5 9L6 14.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Soft pulse ring */}
                <span className="absolute right-[-0.15em] top-1/2 h-[1.05em] w-[1.05em] -translate-y-1/2 rounded-full border border-emerald-300/25 opacity-70 transition duration-300 group-hover:scale-110 group-hover:border-emerald-200/50 group-hover:opacity-100" />
              </span>
            </Link>
            .
          </p>
          <Link
            href="/vault"
            prefetch
            className="group mt-5 inline-flex items-center gap-3 text-sm font-medium text-white/70 transition hover:text-white"
          >
            Open YAIL Vault
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-sky-200">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
