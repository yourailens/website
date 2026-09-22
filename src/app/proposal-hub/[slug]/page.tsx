import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProposalDeckExperience from "../ProposalDeckExperience";
import { getProposalDeck, PROPOSAL_DECKS } from "@/data/proposal-decks";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PROPOSAL_DECKS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = getProposalDeck(slug);
  if (!deck) return { title: "Deck | YAIL Proposal Hub" };
  return {
    title: `${deck.title} | YAIL Proposal Hub`,
    description: deck.subtitle,
  };
}

export default async function ProposalDeckPage({ params }: PageProps) {
  const { slug } = await params;
  const deck = getProposalDeck(slug);
  if (!deck) notFound();
  return <ProposalDeckExperience deck={deck} />;
}
