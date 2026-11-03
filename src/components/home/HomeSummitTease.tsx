import Link from "next/link";
import VaultPlayer from "@/components/vault/VaultPlayer";
import { SUMMIT_PATH, SUMMIT_POSTS } from "@/data/summit-posts";
import { getSummitFilm } from "@/lib/summit/load";
import { formatCount, getSummitReach } from "@/lib/summit/reach";

/** Homepage billboard in the same shape as YAILIANS, in gold. */
export default async function HomeSummitTease() {
  const [film, reach] = await Promise.all([getSummitFilm(), getSummitReach()]);
  const video = film.video_url?.trim() || "";
  const minister = reach.kharge;

  return (
    <section aria-label="Government of Karnataka" className="relative pt-8 sm:pt-12">
      <div className="flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        <div className="flex min-w-0 items-end gap-4 sm:gap-6">
          <img
            src="/images/logos/government-of-karnataka.png?v=2"
            alt="Government of Karnataka, Department of Electronics, IT and Biotechnology"
            className="h-28 w-auto shrink-0 sm:h-36"
          />
          <div className="min-w-0 pb-1">
            <p className="font-mono text-[10px] tracking-[0.32em] text-medal-bright">FEATURED CLIENT</p>
            <h2 className="mt-2 font-body text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">
              Govt. of Karnataka
            </h2>
            <p className="mt-3 inline-flex border border-medal/45 bg-medal/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-medal-bright uppercase">
              Hon’ble Home Minister of Karnataka
            </p>
            <a
              href={SUMMIT_POSTS[0].href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block w-fit text-[13px] font-light text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-medal-bright hover:decoration-medal"
            >
              View the ad posted by Hon’ble Home Minister Priyank Kharge
            </a>
          </div>
        </div>
        <Link
          href={SUMMIT_PATH}
          className="mb-0.5 hidden shrink-0 items-center gap-2 rounded-full bg-medal px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_12px_32px_-10px_rgba(198,161,91,0.85)] transition hover:bg-medal-bright sm:inline-flex"
        >
          See the film
        </Link>
      </div>

      <div className="mt-6 px-5 sm:mt-8 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        <div className="relative overflow-hidden rounded-2xl border border-medal/30 bg-zinc-950 shadow-[0_40px_100px_-40px_rgba(198,161,91,0.55)] sm:rounded-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(198,161,91,0.22),_transparent_55%)]"
          />
          <div className="relative grid lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
            <div className="relative w-full self-start bg-black">
              {video ? (
                <VaultPlayer
                  src={video}
                  poster={film.poster_url}
                  title="Robotics and AI Pavilion, Bengaluru Tech Summit 2026"
                />
              ) : (
                <div className="flex aspect-video items-end p-6">
                  <p className="text-lg text-white/70">The film plays in this frame.</p>
                </div>
              )}
            </div>

            <div className="relative flex flex-col justify-between border-t border-white/10 px-5 py-7 sm:px-7 sm:py-8 lg:border-l lg:border-t-0">
              <div>
                <p className="font-mono text-[10px] tracking-[0.34em] text-medal-bright">VIEWS</p>
                <h3 className="mt-3 font-heading text-[clamp(2.8rem,6vw,4.6rem)] leading-[0.85] tracking-[0.04em] text-medal">
                  {minister.views != null ? formatCount(minister.views) : "—"}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                  The pavilion film, from his account. The department followed the same day. Indian Tech
                  &amp; Infra carried it next.
                </p>
                <a
                  href={SUMMIT_POSTS[0].href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-fit text-[13px] font-light text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-medal-bright hover:decoration-medal"
                >
                  View the ad posted by Hon’ble Home Minister Priyank Kharge
                </a>
              </div>
              <div className="mt-8">
                <Link
                  href={SUMMIT_PATH}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-medal px-6 py-4 text-center shadow-[0_0_0_1px_rgba(198,161,91,0.55),0_20px_50px_-12px_rgba(198,161,91,0.7)] transition hover:bg-medal-bright"
                >
                  <span className="font-heading text-[1.35rem] tracking-[0.12em] text-black sm:text-[1.5rem]">
                    THE FILM
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-black/70">
                    Open
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
