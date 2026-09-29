import type { Metadata } from "next";
import CurriculumPhoneDeck from "./CurriculumPhoneDeck";

export const metadata: Metadata = {
  title: "Curriculum on screen · Phone brief | YourAILens Studios",
  description: "A vertical curriculum film brief, set in large type for a phone.",
};

export default function CurriculumPhonePage() {
  return <CurriculumPhoneDeck />;
}
