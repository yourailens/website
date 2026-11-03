import Link from "next/link";
import Navbar from "@/components/Navbar";
import VaultPlayer from "@/components/vault/VaultPlayer";
import { SUMMIT_POSTS } from "@/data/summit-posts";
import type { SummitFilm } from "@/lib/summit/load";
import { formatCount, type SummitCounts, type SummitReach } from "@/lib/summit/reach";

export default function SummitStory({ film, reach }: { film: SummitFilm; reach: SummitReach }) {
  const video = film.video_url?.trim() || "";
  const minister = SUMMIT_POSTS[0];
  const department = SUMMIT_POSTS[1];
  const infra = SUMMIT_POSTS[2];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-body text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(198,161,91,0.16),transparent_52%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[6%] top-20 h-[32rem] w-[min(28rem,70vw)] overflow-hidden opacity-[0.2] [mask-image:radial-gradient(ellipse_at_center,black_28%,transparent_70%)]"
      >
        <img
          src="/images/logos/government-of-karnataka.png?v=2"
          alt=""
          className="h-[150%] w-full max-w-none object-cover object-top select-none"
        />
      </div>

      <Navbar />

      <main className="relative px-4 pb-24 pt-24 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <header className="relative overflow-hidden rounded-[1.75rem] border border-medal/55 bg-zinc-950 px-5 py-6 shadow-[inset_0_1px_0_rgba(228,197,106,0.55),0_40px_90px_-48px_rgba(198,161,91,0.9)] sm:px-8 sm:py-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(228,197,106,0.2),rgba(198,161,91,0.05)_46%,transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-medal-bright to-transparent"
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4 sm:gap-6">
                <img
                  src="/images/logos/government-of-karnataka.png?v=2"
                  alt="Government of Karnataka, Department of Electronics, IT and Biotechnology"
                  className="h-28 w-auto shrink-0 sm:h-36"
                />
                <div className="min-w-0 pb-1">
                  <p className="font-mono text-[10px] tracking-[0.32em] text-medal-bright">FEATURED CLIENT</p>
                  <h1 className="mt-2 font-body text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-none tracking-tight">
                    Govt. of Karnataka
                  </h1>
                  <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-white/60">
                    Pavilion film for Bengaluru Tech Summit. BIEC, 17 to 19 November.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end sm:pb-1">
                <p className="border border-medal/60 bg-black/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-medal-bright uppercase">
                  Hon’ble Home Minister of Karnataka
                </p>
                <a
                  href={minister.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] font-light text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-medal-bright hover:decoration-medal"
                >
                  View the ad posted by Hon’ble Home Minister Priyank Kharge
                </a>
              </div>
            </div>
          </header>

          <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.7fr)]">
            <div className="overflow-hidden rounded-[1.75rem] border border-medal/40 bg-black shadow-[0_0_0_1px_rgba(198,161,91,0.25)]">
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

            <aside className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-medal/50 bg-zinc-950 p-6 shadow-[inset_0_1px_0_rgba(228,197,106,0.4)] sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(228,197,106,0.16),transparent_55%)]"
              />
              <div className="relative">
                <p className="font-mono text-[10px] tracking-[0.32em] text-medal-bright">Views</p>
                <p className="mt-3 font-heading text-[clamp(2.8rem,6vw,4.2rem)] leading-[0.85] tracking-[0.04em] text-medal">
                  {reach.kharge.views != null ? formatCount(reach.kharge.views) : "—"}
                </p>
                <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-white/65">
                  On the post from Hon’ble Home Minister Priyank Kharge.
                </p>
              </div>
              <a
                href={minister.href}
                target="_blank"
                rel="noreferrer"
                className="relative mt-8 w-fit text-[13px] font-light text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-medal-bright hover:decoration-medal"
              >
                Open his post on X
              </a>
            </aside>
          </div>

          <section aria-label="Where the film travelled" className="mt-5 grid gap-4 md:grid-cols-3">
            <PostCard
              name={minister.who}
              meta="Home Minister · X"
              mark="x"
              line={minister.line}
              href={minister.href}
              action="Open his post on X"
              avatar={reach.kharge.avatar}
              still={reach.kharge.thumbnail}
              counts={[
                ["Views", reach.kharge.views],
                ["Likes", reach.kharge.likes],
                ["Reposts", reach.kharge.reposts],
              ]}
            />
            <PostCard
              name={department.who}
              meta="Department · LinkedIn"
              mark="linkedin"
              line="The stage is set. Robotics is moving beyond the extraordinary and into everyday reality at Bengaluru Tech Summit 2026."
              href={department.href}
              action="Open the department’s post"
              avatar={reach.linkedin.avatar}
              still={reach.linkedin.thumbnail}
              note="No public view count. P Sandeep Reddy wrote that he was proud of what YourAILens Studios is building."
              counts={[
                ["Reactions", reach.linkedin.likes],
                ["Comments", reach.linkedin.replies],
              ]}
            />
            <PostCard
              name={infra.who}
              meta="Trade press · X"
              mark="x"
              line={infra.line}
              href={infra.href}
              action="Open the post on X"
              avatar={reach.infra.avatar}
              still={reach.infra.thumbnail}
              counts={[
                ["Views", reach.infra.views],
                ["Likes", reach.infra.likes],
                ["Reposts", reach.infra.reposts],
              ]}
            />
          </section>

          <Link
            href="/"
            className="mt-8 inline-block text-sm text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-medal-bright"
          >
            Back to the studio
          </Link>
        </div>
      </main>
    </div>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

function PostCard({
  name,
  meta,
  mark,
  line,
  href,
  action,
  avatar,
  still,
  counts,
  note,
}: {
  name: string;
  meta: string;
  mark: "x" | "linkedin";
  line: string;
  href: string;
  action: string;
  avatar: SummitCounts["avatar"];
  still: SummitCounts["thumbnail"];
  counts: [string, number | null][];
  note?: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[1.5rem] border border-medal/30 bg-zinc-950 shadow-[0_24px_50px_-36px_rgba(198,161,91,0.8)]">
      <a href={href} target="_blank" rel="noreferrer" className="relative block aspect-video overflow-hidden bg-black">
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-35 saturate-50" />
        ) : null}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <span className="absolute inset-0 flex items-center justify-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-medal/55 bg-black/75 text-white shadow-[0_0_0_1px_rgba(198,161,91,0.35)]">
            {mark === "linkedin" ? <LinkedInMark /> : <XMark />}
          </span>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-full border border-medal/50 object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-medal/50 bg-medal/15 px-1 text-center text-[9px] leading-tight text-medal-bright">
              IT BT
            </span>
          )}
        </span>
      </a>
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="h-9 w-9 rounded-full border border-medal/40 bg-medal/10" aria-hidden />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-medal-bright/80">{meta}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">{line}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {counts.map(([label, value]) =>
            value == null ? null : (
              <p key={label} className="text-xs text-white/45">
                <span className="font-heading text-xl text-medal">{formatCount(value)}</span> {label}
              </p>
            ),
          )}
        </div>
        {note ? <p className="mt-3 text-xs leading-relaxed text-white/40">{note}</p> : null}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-auto pt-4 text-[13px] font-light text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-medal-bright hover:decoration-medal"
        >
          {action}
        </a>
      </div>
    </article>
  );
}
