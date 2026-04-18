import type { Metadata } from "next";
import Link from "next/link";
import WorkshopPipeline, { type WorkshopPipelineStep } from "@/components/events/WorkshopPipeline";
import { getWorkshopVisualAssets } from "@/lib/events/load-workshop-assets";

const DAY2_PIPELINE_STEPS: [
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
] = [
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
];

export const metadata: Metadata = {
  title: "Day 2 | AI Creator Workshop | YourAILens Studios",
  description:
    "Audio, dialogue, shot lists for long AI videos, lip sync, action, facial performance, and advanced prompting.",
};

export default async function WorkshopDayTwoPage() {
  const assets = await getWorkshopVisualAssets();
  const imgs = assets.images.length >= 5 ? assets.images.slice(2, 7) : assets.images;
  const film = assets.films[1] ?? assets.films[0] ?? null;

  return (
    <article className="max-w-none text-slate-800">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600">Day 2</p>
      <h1 className="font-heading text-3xl font-black tracking-tight text-slate-900">Audio, shots &amp; advanced visuals</h1>
      <p className="text-lg leading-relaxed text-slate-700">
        Day two is where short experiments become <strong>directable</strong> longer pieces: sound that sells, shots that cut together,
        and faces that perform.
      </p>

      <WorkshopPipeline
        steps={DAY2_PIPELINE_STEPS}
        images={imgs.length >= 1 ? imgs : assets.images}
        film={film}
        accent="violet"
        finalLabel="Motion study"
      />

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
        <Link href="/events/ai-creator-workshop#register" className="text-sm font-semibold text-slate-600 hover:text-blue-700">
          Register for the workshop →
        </Link>
      </p>
    </article>
  );
}
