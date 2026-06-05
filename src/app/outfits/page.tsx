import type { Metadata } from "next";
import OutfitsExperience from "./OutfitsExperience";

export const metadata: Metadata = {
  title: "Outfit Reservoir — YourAILens Studios",
  description:
    "Browse, search and download AI-generated outfit reference sheets. Organised by style, category, and character type.",
  openGraph: {
    title: "Outfit Reservoir — YourAILens Studios",
    description: "AI-generated outfit reference sheets for every style and character.",
  },
};

export const dynamic = "force-dynamic";

export default function OutfitsPage() {
  return <OutfitsExperience />;
}
