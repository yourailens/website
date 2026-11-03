import type { Metadata } from "next";
import SummitStory from "@/components/summit/SummitStory";
import { getSummitFilm } from "@/lib/summit/load";
import { getSummitReach } from "@/lib/summit/reach";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bengaluru Tech Summit 2026 · YourAILens Studios",
  description:
    "The Home Minister of Karnataka posted the Robotics and AI Pavilion film YourAILens Studios made for Bengaluru Tech Summit 2026.",
  openGraph: {
    title: "The Home Minister posted this film",
    description:
      "Robotics and AI Pavilion, Bengaluru Tech Summit 2026. A film for the Government of Karnataka.",
    url: "/bengaluru-tech-summit",
  },
};

export default async function BengaluruTechSummitPage() {
  const [film, reach] = await Promise.all([getSummitFilm(), getSummitReach()]);
  return <SummitStory film={film} reach={reach} />;
}
