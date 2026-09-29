import type { Metadata } from "next";
import NalapadFullDeck from "./NalapadFullDeck";

export const metadata: Metadata = {
  title: "Nalapad Academy · Full admissions brief | YourAILens Studios",
  description:
    "A six slide brief, in tables and notes, for growing Nalapad Academy admissions with GenAI films.",
};

export default function NalapadFullDeckPage() {
  return <NalapadFullDeck />;
}
