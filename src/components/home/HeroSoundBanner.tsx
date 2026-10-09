"use client";

type HeroSoundBannerProps = {
  muted: boolean;
  onToggle: () => void;
};

export default function HeroSoundBanner({ muted, onToggle }: HeroSoundBannerProps) {
  return (
    <div
      className="absolute inset-x-0 z-30 flex justify-center bg-transparent px-4 py-3"
      style={{ top: "var(--nav-h, 4.5rem)" }}
    >
      <style>{`
        @keyframes hero-eq-bounce {
          0%, 100% { height: 28%; }
          50% { height: 100%; }
        }
        .hero-eq-bar {
          height: 28%;
          animation: hero-eq-bounce 0.75s ease-in-out infinite;
        }
      `}</style>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!muted}
        aria-label={muted ? "Unmute" : "Mute"}
        className="group relative inline-flex cursor-pointer items-center gap-2.5 bg-transparent px-6 py-3 text-[12px] font-bold uppercase tracking-[0.22em] text-white transition active:translate-y-px sm:gap-3 sm:px-9 sm:py-4 sm:text-[15px] sm:tracking-[0.28em]"
      >
        <StepCorner className="left-0 top-0" />
        <StepCorner className="right-0 top-0 -scale-x-100" />
        <StepCorner className="bottom-0 left-0 -scale-y-100" />
        <StepCorner className="bottom-0 right-0 rotate-180" />
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className={`w-[2px] bg-current ${muted ? "hero-eq-bar" : "h-full"}`}
              style={muted ? { animationDelay: `${bar * 0.12}s` } : undefined}
            />
          ))}
        </span>
        {muted ? "UNMUTE" : "MUTE"}
      </button>
    </div>
  );
}

function StepCorner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 22 22"
      aria-hidden
      className={`pointer-events-none absolute h-5 w-5 text-white/80 transition group-hover:text-white sm:h-6 sm:w-6 ${className}`}
    >
      <path d="M1.5 18 V11 H8 V4 H15 V1.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="miter" />
      <path d="M1.5 13 H5.5 V8 H10.5 V4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="miter" />
    </svg>
  );
}
