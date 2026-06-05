import type { Metadata } from "next";
import CharacterSheetsExperience from "./CharacterSheetsExperience";

export const metadata: Metadata = {
  title: "Models | YourAI Lens Studio",
  description:
    "Explore a diverse library of AI models across ethnicities, ages, archetypes and more — reference designs for your AI media projects.",
};

export default function CharacterSheetsPage() {
  return <CharacterSheetsExperience />;
}
