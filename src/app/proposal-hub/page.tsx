import type { Metadata } from "next";
import ProposalHubExperience from "./ProposalHubExperience";
import { PROPOSAL_DECKS } from "@/data/proposal-decks";

export const metadata: Metadata = {
  title: "YAIL Proposal Hub | YourAILens Studios",
  description:
    "Client proposal decks from YourAILens Studios — GenAI video strategy, PR systems, and campaign plans.",
};

export default function ProposalHubPage() {
  return <ProposalHubExperience decks={PROPOSAL_DECKS} />;
}
