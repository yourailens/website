import { ottCutYoutubeId } from "@/data/ott-cuts";
import type { YailiansSite } from "@/data/yailians";

function youtubePoster(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export default function YailiansHero({ site }: { site: YailiansSite }) {
  const yt = site.trailer_url ? ottCutYoutubeId(site.trailer_url) : null;
  const hero =
    site.hero_image_url?.trim() ||
    site.trailer_poster?.trim() ||
    (yt ? youtubePoster(yt) : null);

  const title = (site.title || "YAILIANS").toUpperCase();
  const letters = title.replace(/\s+/g, " ").trim().split("");

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      {/* Mobile: shorter cinematic frame, title locked to the bottom like a poster card */}
      <div className="relative min-h-[78svh] w-full sm:min-h-[100svh]">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] sm:object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-emerald-950" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/30 sm:via-black/20 sm:to-black/45" />

        {/* Desktop: centered one-sheet (unchanged spirit) */}
        <div className="relative z-10 hidden min-h-[100svh] flex-col items-center justify-center px-8 pb-20 pt-28 text-center sm:flex">
          <p className="font-mono text-[10px] uppercase tracking-[0.62em] text-white/60">
            YAIL&nbsp;&nbsp;·&nbsp;&nbsp;ORIGINAL&nbsp;&nbsp;FEATURE
          </p>

          {site.runtime_label ? (
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.48em] text-white/40">
              {site.runtime_label}
            </p>
          ) : null}

          <div className="mt-10 h-px w-14 bg-white/40" aria-hidden />

          <h1
            className="mt-8 flex max-w-[96vw] flex-wrap items-baseline justify-center gap-x-[0.08em] font-heading text-[clamp(2.75rem,11vw,7.75rem)] leading-none text-white"
            style={{
              textShadow: "0 2px 0 rgba(0,0,0,0.4), 0 28px 80px rgba(0,0,0,0.7)",
            }}
            aria-label={title}
          >
            {letters.map((ch, i) =>
              ch === " " ? (
                <span key={`sp-${i}`} className="inline-block w-[0.35em]" aria-hidden />
              ) : (
                <span key={`${ch}-${i}`} className="inline-block tracking-[0.22em]">
                  {ch}
                </span>
              )
            )}
          </h1>

          <div className="mt-8 h-px w-14 bg-white/40" aria-hidden />

          {site.tagline ? (
            <p className="mt-8 max-w-lg font-body text-[12px] font-light uppercase leading-[1.9] tracking-[0.38em] text-white/65">
              {site.tagline}
            </p>
          ) : null}

          <p className="mt-12 font-mono text-[8px] uppercase tracking-[0.5em] text-white/30">
            YOURAILens Studios
          </p>
        </div>

        {/* Mobile-only poster card */}
        <div className="relative z-10 flex min-h-[78svh] flex-col justify-end px-4 pb-8 pt-24 sm:hidden">
          <div className="rounded-2xl border border-white/15 bg-black/55 px-5 py-7 text-center backdrop-blur-md">
            <p className="font-mono text-[8px] uppercase tracking-[0.42em] text-emerald-300/90">
              YAIL ORIGINAL
              {site.runtime_label ? ` · ${site.runtime_label.toUpperCase()}` : ""}
            </p>
            <h1
              className="mt-4 font-heading text-[clamp(2.6rem,14vw,3.6rem)] leading-[0.92] tracking-[0.16em] text-white"
              style={{ textShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
            >
              {title}
            </h1>
            {site.tagline ? (
              <p className="mt-4 text-[12px] font-light leading-relaxed text-white/70">
                {site.tagline}
              </p>
            ) : null}
            <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.36em] text-white/35">
              YOURAILens Studios
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
