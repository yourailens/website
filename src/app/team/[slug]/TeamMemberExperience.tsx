"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import TeamWorkCard from "@/components/team/TeamWorkCard";
import { TEAM_PAGE, TeamEyebrow, TeamMonogram, TeamProfileBar } from "@/components/team/TeamChrome";
import { TEAM_CALL_SHEETS } from "@/data/team-seed";
import { teamMemberPortrait, type StudioTeamMemberPublic } from "@/data/studio-team";

export default function TeamMemberExperience({ member }: { member: StudioTeamMemberPublic }) {
  const portrait = teamMemberPortrait(member, member.work);
  const sheet = TEAM_CALL_SHEETS[member.slug];
  const paragraphs = (member.bio || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />
      <TeamProfileBar unit={sheet?.unit} />

      <HomeBlueTint className="border-b border-blue-100/60 py-12 lg:py-20">
        <div className={TEAM_PAGE}>
          <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <TeamEyebrow>{sheet?.eyebrow ?? member.role ?? "Team"}</TeamEyebrow>
              <h1
                className="max-w-xl text-[clamp(2.4rem,6vw,4.6rem)] font-light leading-[1.05] text-slate-900"
                style={{ letterSpacing: "-0.04em" }}
              >
                {member.role ? (
                  <>
                    {member.name}. <span className="font-semibold italic text-blue-600">{member.role}.</span>
                  </>
                ) : (
                  member.name
                )}
              </h1>
              {member.short_bio ? (
                <p className="mt-6 max-w-md text-sm font-light leading-[1.85] text-slate-600">{member.short_bio}</p>
              ) : null}
              {member.links.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {member.links.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-blue-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 transition hover:border-blue-400"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <figure className="lg:col-span-6">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 sm:aspect-[4/5]">
                {portrait ? (
                  <Image
                    src={portrait}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover object-center"
                    priority
                  />
                ) : (
                  <TeamMonogram name={member.name} className="min-h-[320px]" />
                )}
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-4 border-t border-blue-100/80 pt-3">
                <span className="text-[10px] font-light uppercase tracking-[0.22em] text-slate-500">{member.name}</span>
                <span className="text-[10px] font-light uppercase tracking-[0.22em] text-slate-400">
                  {sheet?.unit ?? "YourAILens"}
                </span>
              </figcaption>
              {sheet?.signals?.length ? (
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {sheet.signals.map((signal) => (
                    <li
                      key={signal}
                      className="text-[10px] font-light uppercase tracking-[0.2em] text-slate-500"
                    >
                      {signal}
                    </li>
                  ))}
                </ul>
              ) : null}
            </figure>
          </div>
        </div>
      </HomeBlueTint>

      {sheet?.tracks?.length ? (
        <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
          <div className={TEAM_PAGE}>
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-blue-400/80" aria-hidden />
                <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">Three tracks</p>
                <span className="h-px w-8 bg-blue-400/80" aria-hidden />
              </div>
              <h2
                className="text-[clamp(2.1rem,5vw,3.6rem)] font-light leading-[1.1] text-slate-900"
                style={{ letterSpacing: "-0.04em" }}
              >
                {sheet.tracksLead} <span className="font-semibold text-blue-700">{sheet.tracksAccent}</span>
              </h2>
            </div>
            <div className="mt-12 grid gap-10 border-t border-blue-100/80 pt-10 lg:grid-cols-3 lg:gap-12">
              {sheet.tracks.map((beat) => (
                <article key={beat.no}>
                  <p className="font-mono text-[10px] text-blue-500">{beat.no}</p>
                  <h3 className="mt-3 text-xl font-light tracking-[-0.03em] text-slate-900">{beat.title}</h3>
                  <p className="mt-3 text-sm font-light leading-[1.85] text-slate-600">{beat.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {paragraphs.length > 0 ? (
        <HomeBlueTint className="border-t border-blue-100/60 py-16 lg:py-24">
          <div className={`${TEAM_PAGE} max-w-3xl`}>
            <TeamEyebrow>Notes</TeamEyebrow>
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mb-5 text-sm font-light leading-[1.9] text-slate-600">
                {p}
              </p>
            ))}
          </div>
        </HomeBlueTint>
      ) : null}

      {sheet?.reel?.length ? (
        <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
          <div className={TEAM_PAGE}>
            <TeamEyebrow>Credits</TeamEyebrow>
            <h2
              className="max-w-2xl text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.12] text-slate-900"
              style={{ letterSpacing: "-0.035em" }}
            >
              {sheet.reelLead}
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-8 border-t border-blue-100/80 pt-10 sm:grid-cols-2 lg:grid-cols-5">
              {sheet.reel.map((item) => (
                <article key={item.no}>
                  <p className="font-mono text-[8px] text-blue-500">{item.no}</p>
                  <h3 className="mt-2 text-[13px] font-medium leading-snug text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-[12px] font-light leading-relaxed text-slate-500">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {member.work.length > 0 ? (
        <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
          <div className={TEAM_PAGE}>
            <TeamEyebrow>Selected pieces</TeamEyebrow>
            <h2
              className="text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.12] text-slate-900"
              style={{ letterSpacing: "-0.035em" }}
            >
              Work on the board.
            </h2>
            <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {member.work.map((item, i) => (
                <TeamWorkCard key={item.id ?? `${item.media_type}-${i}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
