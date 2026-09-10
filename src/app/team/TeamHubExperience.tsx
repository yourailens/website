"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import { TEAM_PAGE, TeamEyebrow, TeamMasthead, TeamMonogram } from "@/components/team/TeamChrome";
import { teamMemberPortrait, type StudioTeamMemberPublic } from "@/data/studio-team";

export default function TeamHubExperience({ members }: { members: StudioTeamMemberPublic[] }) {
  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />

      <TeamMasthead
        title="The people."
        accent={<span className="font-semibold italic text-blue-600">One cinematic vision.</span>}
      />

      <HomeBlueTint className="border-b border-blue-100/60 py-16 lg:py-24">
        <div className={TEAM_PAGE}>
          <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <TeamEyebrow>The studio</TeamEyebrow>
              <h2
                className="max-w-3xl text-[clamp(2rem,4.8vw,3.8rem)] font-light leading-[1.13] text-slate-900"
                style={{ letterSpacing: "-0.035em" }}
              >
                Faces behind the work. <span className="font-semibold text-blue-700">Quietly credited.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-[1.85] text-slate-600 lg:pb-1">
              Design, picture, process, data. Open a profile for the full set of tracks, notes, and selected pieces.
            </p>
          </div>
        </div>
      </HomeBlueTint>

      <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
        <div className={TEAM_PAGE}>
          {members.length === 0 ? (
            <p className="text-center text-sm font-light text-slate-500">
              Team profiles will appear here once they are published.
            </p>
          ) : (
            <ul className="grid list-none gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m, index) => {
                const portrait = teamMemberPortrait(m, m.work);
                const no = String(index + 1).padStart(2, "0");
                return (
                  <li key={m.id}>
                    <Link href={`/team/${m.slug}`} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                        {portrait ? (
                          <Image
                            src={portrait}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                            className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <TeamMonogram name={m.name} />
                        )}
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">
                          {m.role || "Studio"}
                        </p>
                        <span className="font-mono text-[9px] text-slate-400">{no}</span>
                      </div>
                      <h2
                        className="mt-1.5 text-[clamp(1.55rem,2.4vw,1.95rem)] font-light leading-[1.05] tracking-[-0.03em] text-slate-900"
                      >
                        {m.name}
                      </h2>
                      {m.short_bio ? (
                        <p className="mt-2 text-sm font-light leading-[1.75] text-slate-600">{m.short_bio}</p>
                      ) : null}
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-light uppercase tracking-[0.18em] text-blue-600">
                        View profile
                        <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
