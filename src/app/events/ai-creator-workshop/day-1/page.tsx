import type { Metadata } from "next";
import Link from "next/link";
import { isWorkshopRegistrationOpen } from "@/lib/events/workshop-config";

const DAY1_PIPELINE_STEPS = [
  {
    title: "Story spine",
    blurb: "Lock the arc and what the microfilm must prove in ~3 minutes.",
  },
  {
    title: "Characters",
    blurb: "Sheets that stay consistent shot to shot.",
  },
  {
    title: "Wardrobe & props",
    blurb: "Outfits and objects as controllable variables before you generate.",
  },
] as const;

function StepIcon({ index }: { index: number }) {
  const common = "h-5 w-5";
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M6 19V7a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 5h8a2 2 0 0 1 2 2v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 10h10M8 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <path d="M9 7h6M10 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 20h10a2 2 0 0 0 2-2V8l-4-4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M15 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Day 1 | AI Creator Workshop | YourAILens Studios",
  description:
    "Microfilm workflow, character sheets, locations, prompts, AI tools landscape, and one to one model fit with the YourAILens team.",
};

export default async function WorkshopDayOnePage() {
  const registrationOpen = isWorkshopRegistrationOpen();
  return (
    <article className="max-w-none text-slate-800">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600">Day 1</p>
      <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900">Story world, prompts &amp; toolchain</h1>
      <p className="text-lg leading-relaxed text-slate-700">
        Day one is about clarity: how a professional AI film pipeline actually runs, end to end, without getting lost in hype or scattered
        tools.
      </p>

      <section className="my-10 rounded-3xl border border-slate-200 bg-gradient-to-b from-blue-50/70 to-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-700/70">Workflow</p>
          <h2 className="mt-2 font-heading text-xl font-black text-slate-900 sm:text-2xl">How Day 1 flows</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Simple, repeatable steps you can reuse on any microfilm. No arrows. No media. Just the structure that makes the work consistent.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {DAY1_PIPELINE_STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <StepIcon index={i} />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-lg font-black text-slate-900">
                    <span className="mr-2 text-blue-600">{String(i + 1).padStart(2, "0")}</span>
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.blurb}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mt-10 font-heading text-xl font-bold text-slate-900">Microfilm walkthrough (~3 minutes)</h2>
      <p className="text-slate-700">
        We unpack a complete microfilm, from idea to locked cut, so you see how character sheets, locations, outfits, props, and shot
        intent connect. You’ll leave with a mental model you can reuse on your own pieces.
      </p>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">Characters, places, wardrobe &amp; props</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>Character sheets that stay consistent across scenes</li>
        <li>Locations &amp; mood boards that directors and models can both read</li>
        <li>Outfits and props as controllable variables (not happy accidents)</li>
        <li>Prompt scaffolding: layers, negatives, references, and when to break the rules</li>
      </ul>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">The AI tools landscape</h2>
      <p className="text-slate-700">
        We map the major platforms: capabilities, rough pricing bands, and where each shines (and doesn’t). No vendor worship: just
        practical criteria so you can shortlist fast.
      </p>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">One to one with the team</h2>
      <p className="text-slate-700">
        Bring your real use cases. We help you pick model families and workflows that fit your budget, timeline, and aesthetic, not
        generic “best model” charts.
      </p>

      <p className="mt-12">
        <Link href="/events/ai-creator-workshop/day-2" className="font-bold text-blue-600 hover:underline">
          Continue to Day 2 →
        </Link>
      </p>
      <p className="mt-4">
        {registrationOpen ? (
          <Link href="/events/ai-creator-workshop#register" className="text-sm font-semibold text-slate-600 hover:text-blue-700">
            Register for the workshop →
          </Link>
        ) : (
          <span className="text-sm font-semibold text-slate-400">Registration closed — this event has ended.</span>
        )}
      </p>
    </article>
  );
}
