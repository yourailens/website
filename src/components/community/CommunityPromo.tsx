"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CommunityStill from "@/components/community/CommunityStill";
import ScrubBar from "@/components/community/ScrubBar";
import type { CommunityPiece, CommunitySite } from "@/data/community";

function InterestButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{ background: "#fafafa", color: "#0b1020" }}
      className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full py-2 pl-6 pr-2 text-sm font-semibold shadow-[0_18px_50px_-20px_rgba(255,255,255,0.85)]"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-200/50 to-transparent transition duration-700 group-hover:translate-x-full" />
      <span className="relative">{label}</span>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition group-hover:translate-x-0.5">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}

function HeroMedia({ piece }: { piece: CommunityPiece }) {
  if (piece.media_type === "video") {
    return (
      <video
        src={piece.media_url}
        poster={piece.poster_url ?? undefined}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={piece.media_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
  );
}

function clock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function frameTime(duration: number) {
  if (!Number.isFinite(duration) || duration <= 0.8) return 0.4;
  return Math.min(4.5, Math.max(1.2, duration * 0.3));
}

/** Main still plus timestamp frames saved when the video was uploaded. */
function JumboFilm({
  piece,
  index,
  active,
  onActivate,
}: {
  piece: CommunityPiece;
  index: number;
  active: boolean;
  onActivate: () => void;
}) {
  const frames = piece.frame_stills ?? [];
  const videoRef = useRef<HTMLVideoElement>(null);
  const engaged = useRef(false);
  const scrubbed = useRef(false);
  const [picked, setPicked] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cover, setCover] = useState(frames.length > 0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const still = frames[picked] ?? null;
  const portrait = ratio !== null && ratio < 0.9;
  const shape = ratio ? String(ratio) : "16 / 9";

  function prime(node: HTMLVideoElement | null) {
    videoRef.current = node;
    if (!node || node.dataset.primed === "1") return;
    node.dataset.primed = "1";
    const go = () => {
      if (node.videoWidth > 0 && node.videoHeight > 0) {
        setRatio(node.videoWidth / node.videoHeight);
      }
      if (Number.isFinite(node.duration)) setDuration(node.duration);
      if (frames.length) return;
      const target = frameTime(node.duration);
      const paint = () => {
        if (node.dataset.painted === "1" || engaged.current) return;
        node.dataset.painted = "1";
        node.muted = true;
        void node.play()
          .then(() => {
            const stop = () => {
              if (!engaged.current) node.pause();
            };
            if (typeof node.requestVideoFrameCallback === "function") {
              node.requestVideoFrameCallback(() => stop());
            } else {
              window.setTimeout(stop, 180);
            }
          })
          .catch(() => {});
      };
      node.addEventListener("seeked", paint, { once: true });
      if (Math.abs(node.currentTime - target) > 0.08) node.currentTime = target;
      else paint();
    };
    if (node.readyState >= 1) go();
    else node.addEventListener("loadedmetadata", go, { once: true });
  }

  useEffect(() => {
    if (active) return;
    const node = videoRef.current;
    if (!node) return;
    node.pause();
    setPlaying(false);
  }, [active]);

  const start = () => {
    const node = videoRef.current;
    if (!node) return;
    engaged.current = true;
    onActivate();
    if (!scrubbed.current && still && Math.abs(node.currentTime - still.t) > 0.25) node.currentTime = still.t;
    node.muted = false;
    node.volume = 1;
    setCover(false);
    void node.play().catch(() => {
      node.muted = true;
      void node.play().catch(() => {});
    });
    setPlaying(true);
  };

  const scrubTo = useCallback((seconds: number) => {
    const node = videoRef.current;
    if (!node) return;
    scrubbed.current = true;
    engaged.current = true;
    const limit = Number.isFinite(node.duration) ? node.duration : seconds;
    const next = Math.min(Math.max(0, seconds), limit);
    node.currentTime = next;
    setTime(next);
    setCover(false);
  }, []);

  const choose = (index: number) => {
    setPicked(index);
    const frame = frames[index];
    const node = videoRef.current;
    if (!frame || !node) return;
    if (playing) {
      scrubbed.current = true;
      node.currentTime = frame.t;
      setTime(frame.t);
      void node.play().catch(() => {});
      return;
    }
    scrubbed.current = false;
    setCover(true);
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-black" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1760px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/90">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-3 max-w-4xl font-heading text-[clamp(2.4rem,5vw,4.4rem)] leading-none tracking-tight">
          <Link href={`/ai-verse/${piece.id}`} className="transition hover:text-white/80">
            {piece.title}
          </Link>
        </h2>
        {piece.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{piece.description}</p>
        ) : null}
      </div>
      <div className={`relative mx-auto mt-6 w-full pb-8 sm:pb-10 ${portrait ? "max-w-xl px-4 sm:px-6" : "max-w-[1760px] px-3 sm:px-5 lg:px-8"}`}>
      <div className={`grid gap-3 ${portrait ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(11.5rem,18vw)] lg:items-stretch"}`}>
        <div
          className="relative overflow-hidden bg-black sm:rounded-2xl sm:ring-1 sm:ring-white/15"
          style={{ aspectRatio: shape }}
        >
          <video
            src={piece.media_url}
            poster={still?.url || piece.poster_url || undefined}
            muted
            playsInline
            loop
            preload="auto"
            controls={false}
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            ref={prime}
            aria-label={piece.title}
            className="block h-full w-full bg-black object-contain"
            onPlay={() => {
              if (engaged.current) setPlaying(true);
            }}
            onPause={() => {
              if (!engaged.current) return;
              setPlaying(false);
            }}
            onClick={() => {
              const node = videoRef.current;
              if (!node) return;
              if (node.paused) start();
              else {
                node.pause();
                setPlaying(false);
              }
            }}
            onLoadedMetadata={(event) => {
              const node = event.currentTarget;
              if (Number.isFinite(node.duration)) setDuration(node.duration);
            }}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onContextMenu={(event) => event.preventDefault()}
          />
          {cover && still ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={still.url}
              alt=""
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full bg-black object-contain"
              onLoad={(event) => {
                const img = event.currentTarget;
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                  setRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
            />
          ) : null}
          {!playing ? (
            <button
              type="button"
              aria-label={`Play ${piece.title}`}
              onClick={() => start()}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:h-20 sm:w-20">
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:h-8 sm:w-8" aria-hidden>
                  <path d="M8 5.5v13l11-6.5-11-6.5z" />
                </svg>
              </span>
            </button>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-2 pt-8">
            <ScrubBar time={time} duration={duration} onScrub={scrubTo} />
          </div>
        </div>
        {frames.length > 1 ? (
          <div className={`flex gap-2.5 overflow-x-auto pb-1 ${portrait ? "" : "lg:h-full lg:flex-col lg:overflow-hidden lg:pb-0"}`}>
            {frames.map((frame, frameIndex) =>
              frameIndex === picked ? null : (
              <button
                key={`${frame.t}-${frameIndex}`}
                type="button"
                aria-label={`Show ${clock(frame.t)}`}
                onClick={() => choose(frameIndex)}
                className={`relative shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/25 ${
                  portrait
                    ? "w-[42vw] [aspect-ratio:var(--frame)]"
                    : "w-[42vw] max-lg:[aspect-ratio:var(--frame)] sm:w-48 lg:h-0 lg:min-h-0 lg:w-full lg:flex-1"
                }`}
                style={{ "--frame": shape } as CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-white">
                  {clock(frame.t)}
                </span>
              </button>
              )
            )}
          </div>
        ) : null}
      </div>
      </div>
    </>
  );
}

export default function CommunityPromo({
  site,
  heroes,
  jumbos,
  gallery,
}: {
  site: CommunitySite;
  heroes: CommunityPiece[];
  jumbos: CommunityPiece[];
  gallery: CommunityPiece[];
}) {
  const [liveId, setLiveId] = useState<string | null>(null);
  const lead = heroes[0] ?? null;
  const extraHeroes = heroes.slice(1);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="min-h-screen bg-black font-body text-white">
      <Navbar />

      <section id={lead ? `piece-${lead.id}` : undefined} className="relative isolate min-h-[92vh] overflow-hidden">
        {lead ? <HeroMedia piece={lead} /> : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(36,87,230,0.45), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(96,165,250,0.2), transparent 50%), #070b16",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300">{site.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-heading text-[clamp(3.2rem,8vw,7rem)] leading-[0.9] tracking-tight">
            {site.title}
          </h1>
          {site.lede ? (
            <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-white/75 sm:text-lg">{site.lede}</p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-end gap-8">
            <div>
              <p className="font-heading text-[clamp(3rem,6vw,4.5rem)] leading-none tabular-nums">{site.member_count}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{site.member_label}</p>
            </div>
            <InterestButton label={site.cta_label} />
          </div>
        </div>
      </section>

      {[...extraHeroes, ...jumbos].map((piece, index) =>
        piece.media_type === "video" ? (
          <section key={piece.id} id={`piece-${piece.id}`} className="relative isolate overflow-hidden border-t border-white/10">
            <JumboFilm
              piece={piece}
              index={index}
              active={liveId === piece.id}
              onActivate={() => setLiveId(piece.id)}
            />
          </section>
        ) : (
          <section
            key={piece.id}
            id={`piece-${piece.id}`}
            className="relative isolate min-h-[78vh] overflow-hidden border-t border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={piece.media_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className={`absolute inset-0 ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-black via-black/55 to-black/10"
                  : "bg-gradient-to-l from-black via-black/55 to-black/10"
              }`}
            />
            <div
              className={`relative mx-auto flex min-h-[78vh] max-w-6xl items-end px-5 py-16 sm:px-8 ${
                index % 2 === 0 ? "" : "justify-end"
              }`}
            >
              <div className="max-w-lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/90">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-heading text-[clamp(2.2rem,5vw,4rem)] leading-none tracking-tight">{piece.title}</h2>
                {piece.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">{piece.description}</p>
                ) : null}
              </div>
            </div>
          </section>
        )
      )}

      <section id="gallery" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300">Gallery</p>
              <h2 className="mt-3 font-heading text-[clamp(2rem,4vw,3.4rem)] leading-none tracking-tight">
                Inside the room
              </h2>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="font-heading text-4xl leading-none tabular-nums">{site.member_count}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{site.member_label}</p>
              </div>
              <InterestButton label={site.cta_label} />
            </div>
          </div>

          {gallery.length ? (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((piece) => (
                <li key={piece.id} id={`piece-${piece.id}`}>
                  <Link href={`/ai-verse/${piece.id}`} className="block w-full text-left">
                    <span className="block overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
                      <span className="block aspect-video overflow-hidden">
                        <CommunityStill
                          src={piece.media_url}
                          poster={piece.poster_url}
                          video={piece.media_type === "video"}
                          alt={piece.title}
                          grade={piece.media_type === "video"}
                        />
                      </span>
                    </span>
                    <span className="mt-3 block text-[15px] font-medium text-white">{piece.title}</span>
                    {piece.description ? (
                      <span className="mt-1 block text-sm leading-relaxed text-white/50">{piece.description}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-12 max-w-md text-sm text-white/45">
              Films and stills from the community will land here.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
