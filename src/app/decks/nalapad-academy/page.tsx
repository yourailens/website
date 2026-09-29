import type { Metadata } from "next";
import NalapadDeck from "./NalapadDeck";

export const metadata: Metadata = {
  title: "Nalapad Academy · GenAI Admissions Plan | YourAILens Studios",
  description:
    "A six slide plan to grow Nalapad Academy admissions with GenAI films parents actually watch.",
};

export default function NalapadDeckPage() {
  return <NalapadDeck />;
}
