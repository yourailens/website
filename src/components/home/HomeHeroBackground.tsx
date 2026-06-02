"use client";

/** Done & Dusted — compressed hero (public/videos/hero.mp4). */
const DONE_AND_DUSTED_SRC = "/videos/hero.mp4";

export default function HomeHeroBackground() {
  return (
    <section className="relative h-[min(70vh,780px)] w-full overflow-hidden bg-[#0a0a0c]">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={DONE_AND_DUSTED_SRC} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/70 via-transparent to-black/20"
        aria-hidden
      />
    </section>
  );
}
