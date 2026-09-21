import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  studioEventIsPast,
  studioEventTypeLabel,
  type StudioEvent,
} from "@/data/studio-events";

function EventDetailsLink({ href }: { href: string }) {
  const className =
    "inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:text-blue-200";
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        Event Details
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      Event Details
    </Link>
  );
}

function EventRow({ event, index }: { event: StudioEvent; index: number }) {
  const past = studioEventIsPast(event);
  const meta = [
    studioEventTypeLabel(event.event_type),
    event.venue,
    event.location_label,
    event.date_label,
  ]
    .filter(Boolean)
    .join(" · ");

  const copy = (
    <div className="flex min-w-0 flex-1 flex-col justify-center">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">
          EP. {String(index + 1).padStart(2, "0")}
        </p>
        {meta ? <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">{meta}</p> : null}
      </div>

      <h2 className="mt-3 font-body text-[clamp(1.55rem,3.5vw,2.35rem)] font-semibold leading-[1.1] tracking-tight text-white">
        {event.title}
      </h2>
      {event.subtitle ? (
        <p className="mt-2 text-base font-light text-blue-300/90 sm:text-lg">{event.subtitle}</p>
      ) : null}
      {event.description ? (
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/55 sm:text-base">
          {event.description}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        {past ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Completed</p>
        ) : !event.href ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Coming soon</p>
        ) : null}
        {event.href ? <EventDetailsLink href={event.href} /> : null}
      </div>
    </div>
  );

  const poster = event.image_url ? (
    <div className="relative mx-auto aspect-square w-full max-w-[18rem] shrink-0 overflow-hidden border border-white/10 bg-black sm:mx-0 sm:w-[14rem] sm:max-w-none md:w-[16rem] lg:w-[18rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={event.image_url} alt="" className="h-full w-full object-contain" />
    </div>
  ) : null;

  return (
    <div
      className={`border-t border-white/10 py-10 transition first:border-t-0 sm:py-12 ${
        past ? "opacity-70" : ""
      }`}
    >
      {poster ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 lg:gap-10">
          {poster}
          {copy}
        </div>
      ) : (
        copy
      )}
    </div>
  );
}

export default function EventsExperience({ events }: { events: StudioEvent[] }) {
  const upcoming = events.filter((e) => !studioEventIsPast(e));
  const past = events.filter((e) => studioEventIsPast(e));

  return (
    <div className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 18% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 35% at 90% 8%, rgba(29,78,216,0.16), transparent 50%)",
        }}
        aria-hidden
      />

      <section className="relative mx-auto max-w-[90rem] px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CHANNEL · EVENTS</p>

        <h1 className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
          <span className="sr-only">YAIL Events</span>
          <Image
            src="/images/logo_yail.png"
            alt=""
            width={640}
            height={180}
            className="h-[clamp(2.4rem,8vw,4.5rem)] w-auto select-none drop-shadow-[0_0_28px_rgba(59,130,246,0.45)]"
            aria-hidden
          />
          <span className="font-body text-[clamp(2.4rem,8vw,5rem)] font-semibold leading-none tracking-tight">
            Events
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          Meetups, workshops, and theatre nights from the YAIL desk. Live rooms where creators ship and share.
        </p>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 pb-20 sm:px-8 lg:px-16">
        {upcoming.length > 0 ? (
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">UPCOMING</p>
            <div className="mt-2">
              {upcoming.map((event, i) => (
                <EventRow key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        ) : null}

        {past.length > 0 ? (
          <div className={upcoming.length ? "mt-10 border-t border-white/10 pt-10" : ""}>
            <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">PAST</p>
            <div className="mt-2">
              {past.map((event, i) => (
                <EventRow key={event.id} event={event} index={upcoming.length + i} />
              ))}
            </div>
          </div>
        ) : null}

        {events.length === 0 ? (
          <p className="border-t border-white/10 py-16 text-sm text-white/45">No events published yet.</p>
        ) : null}
      </section>
    </div>
  );
}
