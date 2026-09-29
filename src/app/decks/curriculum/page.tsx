import type { Metadata } from "next";
import CurriculumDeck from "./CurriculumDeck";

export const metadata: Metadata = {
  title: "Curriculum on screen | YourAILens Studios",
  description:
    "A ten slide idea for turning a school curriculum into GenAI lesson films students can watch again.",
};

export default function CurriculumDeckPage() {
  return <CurriculumDeck />;
}
