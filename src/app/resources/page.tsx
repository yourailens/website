import type { Metadata } from "next";
import ResourcesHubExperience from "./ResourcesHubExperience";

export const metadata: Metadata = {
  title: "Resources | YourAI Lens Studio",
  description: "9 AI reference libraries in one place — character sheets, outfits, props, lighting presets, color grades, mood boards, workflows, locations, and scenarios.",
};

export default function ResourcesPage() {
  return <ResourcesHubExperience />;
}
