import type { Metadata } from "next";
import CurriculumFullDeck from "./CurriculumFullDeck";

export const metadata: Metadata = {
  title: "Curriculum on screen · Full brief | YourAILens Studios",
  description:
    "A ten slide brief, in tables and notes, for turning a school curriculum into GenAI lesson films.",
};

export default function CurriculumFullDeckPage() {
  return <CurriculumFullDeck />;
}
