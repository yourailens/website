import type { Metadata } from "next";
import NalapadPhoneDeck from "./NalapadPhoneDeck";

export const metadata: Metadata = {
  title: "Nalapad Academy · Phone brief | YourAILens Studios",
  description: "A vertical admissions brief for Nalapad Academy, set in large type for a phone.",
};

export default function NalapadPhonePage() {
  return <NalapadPhoneDeck />;
}
