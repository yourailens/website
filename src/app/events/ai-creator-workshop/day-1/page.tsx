import type { Metadata } from "next";
import Link from "next/link";
import WorkshopPipeline, { type WorkshopPipelineStep } from "@/components/events/WorkshopPipeline";
import { getWorkshopVisualAssets } from "@/lib/events/load-workshop-assets";

const DAY1_PIPELINE_STEPS: [
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
] = [
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
];

export const metadata: Metadata = {
  title: "Day 1 | AI Creator Workshop | YourAILens Studios",
  description:
    "Microfilm workflow, character sheets, locations, prompts, AI tools landscape, and one to one model fit with the YourAILens team.",
};

export default async function WorkshopDayOnePage() {
  const assets = await getWorkshopVisualAssets();
  const imgs = assets.images;
  const film = assets.films[0] ?? null;

  return (
    <article className="max-w-none text-slate-800">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600">Day 1</p>
      <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900">Story world, prompts &amp; toolchain</h1>
      <p className="text-lg leading-relaxed text-slate-700">
        Day one is about clarity: how a professional AI film pipeline actually runs, end to end, without getting lost in hype or scattered
        tools.
      </p>

      <WorkshopPipeline
        steps={DAY1_PIPELINE_STEPS}
        images={imgs}
        film={film}
        accent="blue"
        finalBadge="Final outfit"
        finalLabel="How it reads on camera"
      />

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
        <Link href="/events/ai-creator-workshop#register" className="text-sm font-semibold text-slate-600 hover:text-blue-700">
          Register for the workshop →
        </Link>
      </p>
    </article>
  );
}
