import type { Metadata } from "next";
import Link from "next/link";
import { isWorkshopRegistrationOpen } from "@/lib/events/workshop-config";

const DAY2_PIPELINE_STEPS = [
  {
    title: "Audio bed",
    blurb: "Voice, ambience, and dialogue that match the picture.",
  },
  {
    title: "Shot lists",
    blurb: "Coverage and continuity for longer AI sequences.",
  },
  {
    title: "Lip sync",
    blurb: "Timing and mouth performance without the uncanny valley.",
  },
  {
    title: "Action & faces",
    blurb: "Staging intense beats and expression across cuts.",
  },
  {
    title: "Hard prompts",
    blurb: "Layering intent, references, and iteration discipline.",
  },
] as const;

function StepIcon({ index }: { index: number }) {
  const common = "h-5 w-5";
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M11 5h2v14h-2z" fill="currentColor" opacity="0.25" />
        <path d="M7 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 12h2M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M5 6h14M5 12h10M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 11l2 1-2 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M9 10c1.2-1.6 4.8-1.6 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 14c1.6 2.2 6.4 2.2 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (index === 3) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M12 3l3 6 6 .9-4.5 4.4 1.1 6.3L12 18.7 6.4 21l1.1-6.3L3 9.9 9 9l3-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <path d="M12 3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 9h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 13c3-2 13-2 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 19c2-1 10-1 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Day 2 | AI Creator Workshop | YourAILens Studios",
  description:
    "Audio, dialogue, shot lists for long AI videos, lip sync, action, facial performance, and advanced prompting.",
};

export default async function WorkshopDayTwoPage() {
  const registrationOpen = isWorkshopRegistrationOpen();
  return (
    <article className="max-w-none text-slate-800">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">Day 2</p>
      <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900">Audio, shots &amp; advanced visuals</h1>
      <p className="text-lg leading-relaxed text-slate-700">
        Day two is where short experiments become <strong>directable</strong> longer pieces: sound that sells, shots that cut together,
        and faces that perform.
      </p>

      <section className="my-10 rounded-3xl border border-slate-200 bg-gradient-to-b from-violet-50/70 to-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-violet-700/70">Workflow</p>
          <h2 className="mt-2 font-heading text-xl font-black text-slate-900 sm:text-2xl">How Day 2 flows</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            A practical checklist for longer, directable AI videos. Keep it simple, keep it controlled, and make every iteration count.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-2">
          {DAY2_PIPELINE_STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-md shadow-violet-200">
                  <StepIcon index={i} />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-lg font-black text-slate-900">
                    <span className="mr-2 text-violet-700">{String(i + 1).padStart(2, "0")}</span>
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.blurb}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mt-10 font-heading text-xl font-bold text-slate-900">Audio &amp; dialogue</h2>
      <p className="text-slate-700">
        Voice, ambience, and dialogue that match your picture, including practical patterns for iteration when the model disagrees with
        your script.
      </p>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">Shot lists for longer AI video</h2>
      <p className="text-slate-700">
        Why shot lists matter once you move past single clips: continuity, coverage, and how to design sequences so editors (human or
        hybrid) aren’t fighting the material.
      </p>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">Lip sync &amp; performance</h2>
      <p className="text-slate-700">
        Matching dialogue to picture, tightening timing, and getting believable mouth performance without the uncanny valley taking over.
      </p>

      <h2 className="mt-8 font-heading text-xl font-bold text-slate-900">Action, expression &amp; hard prompts</h2>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>Intense action beats: staging, motion, and safety rails</li>
        <li>Facial expression control across cuts</li>
        <li>Creative flourishes vs. chaos: when to simplify the prompt</li>
        <li>Complex scenes: layering intent, references, and iteration discipline</li>
      </ul>

      <p className="mt-12">
        <Link href="/events/ai-creator-workshop/day-1" className="font-bold text-blue-600 hover:underline">
          ← Back to Day 1
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
