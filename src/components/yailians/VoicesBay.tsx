import type { ReactNode } from "react";

export default function VoicesBay({
  back,
  action,
  heading = "h2",
  children,
}: {
  back?: ReactNode;
  action?: ReactNode;
  heading?: "h1" | "h2";
  children: ReactNode;
}) {
  const Title = heading;
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#12080c]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cf1.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_22%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cf2.jpeg"
          alt=""
          className="absolute -right-[4%] top-0 hidden h-full w-[58%] object-cover object-[center_40%] md:block"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, #000 34%, #000 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 34%, #000 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/62 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/75" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        {back ? <div className="mb-8">{back}</div> : null}

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <p className="font-mono text-[10px] tracking-[0.46em] text-white/55">IN PARTNERSHIP WITH</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/cflogo.png"
              alt="Cineflix Luxury Private Theatre & Cafe"
              className="mt-4 h-16 w-auto sm:h-[4.5rem]"
            />

            <Title className="mt-8 max-w-[12ch] font-heading text-[clamp(2.5rem,6vw,4.6rem)] leading-[0.88] tracking-[0.05em] text-white">
              PRIVATE SCREENING
            </Title>
            <p className="mt-4 max-w-md text-[1.05rem] font-light leading-snug tracking-wide text-white/75">
              Exclusively for AI creators.
            </p>
            <p className="mt-6 font-mono text-[10px] tracking-[0.38em] text-white/45">INTERVIEWS</p>
          </div>
          {action}
        </div>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
