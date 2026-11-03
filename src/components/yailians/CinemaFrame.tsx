import type { ReactNode } from "react";

/** Quiet rounded mount used by every card on the YAILIANS page. */
export default function CinemaFrame({
  children,
  footer,
  compact = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#10131a]/90 shadow-[0_22px_50px_-32px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.12] backdrop-blur-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />
      <div
        className={`relative overflow-hidden bg-black ${
          compact ? "m-1.5 rounded-xl" : "m-2 rounded-xl"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div className={compact ? "relative z-20 px-2.5 pb-2.5 pt-2" : "relative z-20 px-3.5 pb-3.5 pt-2.5"}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
