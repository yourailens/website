import type { Metadata } from "next";
import { getPublishedPrompts } from "@/lib/prompts/load";
import PromptsLibraryExperience from "./PromptsLibraryExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prompt Library — YourAILens Studios",
  description:
    "Explore AI workflows, image prompts, and video prompts crafted by YourAILens Studios. Search by category, model, or keyword.",
  openGraph: {
    title: "Prompt Library — YourAILens Studios",
    description: "Discover AI-native creative workflows for images and videos.",
    url: "https://yourailens.studio/prompts",
  },
};

export default async function PromptsPage() {
  const { prompts } = await getPublishedPrompts({ limit: 24 });
  return <PromptsLibraryExperience initialPrompts={prompts} />;
}
