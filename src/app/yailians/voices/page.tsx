import type { Metadata } from "next";
import Link from "next/link";
import VoiceInterviewCard from "@/components/yailians/VoiceInterviewCard";
import YailiansShell from "@/components/yailians/YailiansShell";
import { getPublishedVoices, getYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getYailiansSite();
  return {
    title: `Voices · ${site.title}`,
    description: `Interview videos about ${site.title}.`,
  };
}

export default async function YailiansVoicesPage() {
  const voices = await getPublishedVoices();

  return (
    <YailiansShell activeHref="/yailians/voices">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/yailians"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
        >
          ← YAILIANS
        </Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-emerald-400/90">VOICES</p>
        <h1 className="mt-3 font-body text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-tight">
          Interviews
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/50">
          Conversations we recorded around the film — press play.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {voices.map((v) => (
            <li key={v.id}>
              <VoiceInterviewCard voice={v} />
            </li>
          ))}
        </ul>
        {!voices.length ? (
          <p className="mt-10 text-sm text-white/40">No interviews published yet.</p>
        ) : null}
      </div>
    </YailiansShell>
  );
}
