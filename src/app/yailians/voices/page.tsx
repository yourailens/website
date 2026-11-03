import type { Metadata } from "next";
import Link from "next/link";
import VoiceInterviewCard from "@/components/yailians/VoiceInterviewCard";
import VoicesBay from "@/components/yailians/VoicesBay";
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
      <VoicesBay
        heading="h1"
        back={
          <Link
            href="/yailians"
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
          >
            ← YAILIANS
          </Link>
        }
      >
        <ul className="grid grid-cols-2 items-start gap-x-4 gap-y-10 sm:flex sm:flex-wrap sm:gap-x-6">
          {voices.map((voice) => (
            <li key={voice.id} className="min-w-0 sm:w-[17rem]">
              <VoiceInterviewCard voice={voice} />
            </li>
          ))}
        </ul>
        {!voices.length ? <p className="text-sm text-white/40">No interviews published yet.</p> : null}
      </VoicesBay>
    </YailiansShell>
  );
}
